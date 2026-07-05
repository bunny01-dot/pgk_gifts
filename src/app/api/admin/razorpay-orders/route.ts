import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/firebase/admin';
import { verifyCsrf } from '@/utils/security';
import { logger } from '@/utils/logger';
import { ADMIN_EMAILS } from '@/lib/data';

export const runtime = 'nodejs';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    throw new Error('Unauthorized: No token provided.');
  }

  const decoded = await getAdminAuth().verifyIdToken(token, true);
  const uid = decoded.uid;
  const email = decoded.email;

  const isSuperAdmin = uid === '30S6HkIJXKWWSrmlLD8c8GBskst1';
  const isEmailAdmin = email && ADMIN_EMAILS.includes(email);
  
  if (isSuperAdmin || isEmailAdmin) {
    return { uid, email };
  }

  const adminDb = getAdminDb();
  const adminSnap = await adminDb.collection('roles_admin').doc(uid).get();
  if (adminSnap.exists) {
    return { uid, email };
  }

  throw new Error('Unauthorized: Access denied.');
}

export async function GET(request: Request) {
  try {
    // CSRF Protection
    if (!verifyCsrf(request)) {
      return NextResponse.json({ error: 'CSRF verification failed.' }, { status: 403 });
    }

    await verifyAdmin(request);
    
    const adminDb = getAdminDb();
    const querySnap = await adminDb
      .collection('razorpayOrders')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const orders = querySnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : data.createdAt) : null,
        updatedAt: data.updatedAt ? (typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null,
      };
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    logger.error('Error fetching razorpay orders', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
