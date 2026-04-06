// src/app/api/users/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const snap = await adminDb().collection('users').orderBy('createdAt', 'desc').get();
    return res.ok(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e: any) { return res.err(e.message); }
}
