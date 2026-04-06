// src/lib/apiMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function verifyAdmin(req: NextRequest) {
  // Step 1: Extract token
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[verifyAdmin] No Authorization header or missing Bearer prefix');
    return null;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    console.error('[verifyAdmin] Token is empty after stripping Bearer');
    return null;
  }

  // Step 2: Verify Firebase ID token via Admin SDK
  let decoded: any;
  try {
    decoded = await adminAuth().verifyIdToken(token);
  } catch (e: any) {
    console.error('[verifyAdmin] verifyIdToken failed:', e.code, e.message);
    // Common causes:
    // "auth/id-token-expired" → client needs to refresh token
    // "app/invalid-credential" → FIREBASE_ADMIN_PRIVATE_KEY is wrong/missing
    // "auth/argument-error"   → token is malformed
    return null;
  }

  // Step 3: Look up user document in Firestore
  let snap: any;
  try {
    snap = await adminDb().collection('users').doc(decoded.uid).get();
  } catch (e: any) {
    console.error('[verifyAdmin] Firestore lookup failed:', e.message);
    return null;
  }

  if (!snap.exists) {
    console.error('[verifyAdmin] No Firestore user doc for uid:', decoded.uid);
    return null;
  }

  const data = snap.data()!;

  // Step 4: Check admin role
  if (data.role !== 'admin' && !data.adminRole) {
    console.error('[verifyAdmin] User is not admin. role:', data.role, 'adminRole:', data.adminRole);
    return null;
  }

  // Step 5: Check not terminated
  if (data.adminStatus === 'terminated') {
    console.error('[verifyAdmin] Admin account is terminated:', decoded.uid);
    return null;
  }

  return { uid: decoded.uid, role: data.role, adminRole: data.adminRole, name: data.name };
}

export const res = {
  ok:      (data: any, status = 200) => NextResponse.json({ success: true,  data  }, { status }),
  err:     (error: string, status = 500) => NextResponse.json({ success: false, error }, { status }),
  unauth:  (reason?: string) => NextResponse.json(
    { success: false, error: 'Unauthorized', reason: reason || 'Check server logs for details' },
    { status: 401 }
  ),
};