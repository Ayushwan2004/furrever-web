// src/lib/apiMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  let decoded: any;
  try { decoded = await adminAuth().verifyIdToken(token); }
  catch (e: any) { console.error('[verifyAdmin] verifyIdToken failed:', e.code, e.message); return null; }

  // ✅ Check Admins collection first, then users
  let data: any = null;
  try {
    const adminSnap = await adminDb().collection('Admins').doc(decoded.uid).get();
    if (adminSnap.exists) {
      data = adminSnap.data();
    } else {
      const userSnap = await adminDb().collection('users').doc(decoded.uid).get();
      if (userSnap.exists) data = userSnap.data();
    }
  } catch (e: any) { console.error('[verifyAdmin] Firestore lookup failed:', e.message); return null; }

  if (!data) { console.error('[verifyAdmin] No doc found for uid:', decoded.uid); return null; }
  if (!data.adminRole && data.role !== 'admin') { console.error('[verifyAdmin] Not an admin'); return null; }
  if (data.adminStatus === 'terminated') { console.error('[verifyAdmin] Terminated'); return null; }

  return { uid: decoded.uid, role: data.role, adminRole: data.adminRole, name: data.username || data.name };
}

export const res = {
  ok:     (data: any, status = 200)      => NextResponse.json({ success: true,  data  }, { status }),
  err:    (error: string, status = 500)  => NextResponse.json({ success: false, error }, { status }),
  unauth: (reason?: string)             => NextResponse.json(
    { success: false, error: 'Unauthorized', reason: reason || 'Check server logs for details' },
    { status: 401 }
  ),
};