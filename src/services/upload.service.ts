'use client';

import { 
  FirebaseStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { Auth, signInAnonymously } from 'firebase/auth';
import { CustomPhoto } from '@/types/cart';
import { compressAndResizeToBlob } from '@/utils/customization';

export class UploadService {
  constructor(
    private storage: FirebaseStorage,
    private auth: Auth
  ) {}

  /**
   * Validates the file extension/MIME type and size constraints.
   */
  public validateFile(
    file: File,
    allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    maxSizeBytes = 5 * 1024 * 1024 // 5MB default limit
  ): void {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Please upload a PNG, JPG, JPEG, or WEBP image.`);
    }

    if (file.size > maxSizeBytes) {
      const limitMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      throw new Error(`File size exceeds the allowed limit of ${limitMb}MB.`);
    }
  }

  /**
   * Performs client-side image optimization, authenticates guests anonymously if necessary,
   * uploads the file directly to user-specific folders in Firebase Storage,
   * and reports progress percentages.
   */
  public async uploadPhoto(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<CustomPhoto> {
    // 1. Ensure user is authenticated (sign in anonymously if not logged in)
    let uid = this.auth.currentUser?.uid;
    if (!uid) {
      try {
        const credential = await signInAnonymously(this.auth);
        uid = credential.user.uid;
      } catch (authErr: any) {
        throw new Error(`Authentication failure: ${authErr.message}`);
      }
    }

    // 2. Client-side validation
    this.validateFile(file);

    // 3. Compress and resize image to keep it optimized while preserving existing quality settings
    let uploadData: Blob | File = file;
    try {
      uploadData = await compressAndResizeToBlob(file, 800, 800, 0.7);
    } catch (compressionErr) {
      console.warn('Compression failed, falling back to original file.', compressionErr);
    }

    // 4. Generate a secure, sanitized filename to prevent path traversal
    // Strip parent directory attempts and keep letters, numbers, hyphens, underscores and dots
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const fileName = `${uniqueId}_${sanitizedOriginalName}`;
    
    // Structure: users/{uid}/customizations/{fileName}
    // Storage rules will enforce uid match to prevent cross-user writes
    const storagePath = `users/${uid}/customizations/${fileName}`;
    const storageRef = ref(this.storage, storagePath);

    const metadata = {
      contentType: 'image/jpeg', // output of compressAndResizeToBlob is jpeg
      customMetadata: {
        originalName: file.name,
        uploadedBy: uid,
      }
    };

    // 5. Perform the binary upload with progress monitoring
    return new Promise<CustomPhoto>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, uploadData, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          if (process.env.NODE_ENV !== 'production' && error.code === 'storage/quota-exceeded') {
            console.warn('Firebase Storage quota exceeded. Falling back to a local URL for testing.');
            try {
              const localUrl = URL.createObjectURL(uploadData);
              resolve({
                imageUrl: localUrl,
                fileName: `MOCK_QUOTA_FALLBACK_${fileName}`,
                contentType: 'image/jpeg',
                fileSize: uploadData.size,
                uploadedAt: new Date().toISOString()
              });
              return;
            } catch (fallbackErr) {
              console.error('Local Object URL fallback failed:', fallbackErr);
            }
          }
          reject(new Error(`Storage upload failed: ${error.message}`));
        },
        async () => {
          try {
            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              imageUrl,
              fileName,
              contentType: 'image/jpeg',
              fileSize: uploadData.size,
              uploadedAt: new Date().toISOString()
            });
          } catch (urlErr: any) {
            reject(new Error(`Failed to retrieve download URL: ${urlErr.message}`));
          }
        }
      );
    });
  }

  /**
   * Deletes an uploaded customization photo from Firebase Storage.
   * Path traversal protections are enforced.
   */
  public async deletePhoto(fileName: string): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      console.warn('Cannot delete photo: User is not authenticated.');
      return;
    }

    // Remove any path traversal sequences
    const safeFileName = fileName.replace(/\.\./g, '').replace(/\//g, '');
    const storagePath = `users/${uid}/customizations/${safeFileName}`;
    const storageRef = ref(this.storage, storagePath);

    try {
      await deleteObject(storageRef);
    } catch (error: any) {
      // If the file was already deleted or doesn't exist, ignore the error
      if (error.code !== 'storage/object-not-found') {
        console.error(`Failed to delete object from Storage: ${storagePath}`, error);
      }
    }
  }
}
