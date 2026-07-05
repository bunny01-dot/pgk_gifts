
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Upload, X, ShieldCheck, Loader2 } from 'lucide-react';
import { useFirebase, useFirestore } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { OrdersService } from '@/services/orders.service';
import { ReturnRequest } from '@/types/order';

interface ReturnReportModalProps {
  orderId: string;
  onSuccess: () => void;
}

export function ReturnReportModal({ orderId, onSuccess }: ReturnReportModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { firebaseApp } = useFirebase();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [reason, setReason] = useState<ReturnRequest['reason']>('damaged');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (images.length + files.length > 3) {
      toast({ variant: "destructive", title: "Limit Exceeded", description: "You can upload up to 3 images." });
      return;
    }

    setIsUploading(true);
    try {
      const storage = getStorage(firebaseApp);
      const newUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        const storageRef = ref(storage, `returns/${orderId}_${Date.now()}_${file.name}`);
        try {
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          newUrls.push(url);
        } catch (uploadErr: any) {
          if (process.env.NODE_ENV !== 'production' && uploadErr.code === 'storage/quota-exceeded') {
            console.warn('Firebase Storage quota exceeded. Falling back to local URL for return report.');
            newUrls.push(URL.createObjectURL(file));
          } else {
            throw uploadErr;
          }
        }
      }
      
      setImages(prev => [...prev, ...newUrls]);
      toast({ title: "Images Uploaded", description: "Proof successfully attached." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description || images.length === 0) {
      toast({ variant: "destructive", title: "Information Missing", description: "Please provide a description and at least one image of the issue." });
      return;
    }

    setLoading(true);
    try {
      const svc = new OrdersService(firestore);
      await svc.submitReturnRequest(orderId, {
        reason,
        description,
        images,
        status: 'pending'
      });
      
      toast({ title: "Request Submitted", description: "Our team will review your report within 24 hours." });
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full h-16 px-10 border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all font-bold">
          <AlertCircle className="w-5 h-5 mr-3" /> Report Damage / Return
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-2xl md:rounded-[3rem] p-5 md:p-10 border-none shadow-premium bg-card">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-4xl font-headline font-bold">Report an Issue</DialogTitle>
          <DialogDescription className="text-lg mt-2">
            We are sorry your gift didn&apos;t arrive perfectly. Please provide details and photos for our review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Reason for Return</Label>
            <Select value={reason} onValueChange={(v: any) => setReason(v)}>
              <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-none px-6 font-bold text-lg">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-2 border-none shadow-2xl">
                <SelectItem value="damaged" className="rounded-xl h-12">Damaged during shipping</SelectItem>
                <SelectItem value="wrong_item" className="rounded-xl h-12">Wrong item received</SelectItem>
                <SelectItem value="missing_parts" className="rounded-xl h-12">Parts/Accessories missing</SelectItem>
                <SelectItem value="other" className="rounded-xl h-12">Other issues</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Describe the Problem</Label>
            <Textarea 
              className="rounded-[2rem] bg-secondary/30 border-none p-6 text-base min-h-[150px] resize-none focus-visible:ring-primary"
              placeholder="Tell us exactly what is wrong..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Upload Photo Evidence (Max 3)</Label>
            <div className="grid grid-cols-3 gap-4">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                  <img src={url} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 3 && (
                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-primary/20 bg-secondary/10 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/30 transition-all group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />}
                  <span className="text-[10px] font-bold mt-2 uppercase tracking-widest text-muted-foreground">Add Photo</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-3xl flex gap-4 items-start">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Our support team will review your report. If approved, we will ship a replacement or issue a refund immediately. Thank you for your patience.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-10">
          <Button 
            disabled={loading || isUploading} 
            onClick={handleSubmit}
            className="w-full h-16 rounded-full text-xl font-bold font-headline shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            {loading ? <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Submitting...</> : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
