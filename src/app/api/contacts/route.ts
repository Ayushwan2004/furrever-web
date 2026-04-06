// src/app/api/contacts/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const snap = await adminDb().collection('contacts').orderBy('createdAt','desc').get();
    return res.ok(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e: any) { return res.err(e.message); }
}

// Public — no auth required for contact form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ref = await adminDb().collection('contacts').add({ ...body, read: false, createdAt: FieldValue.serverTimestamp() });
    return res.ok({ id: ref.id });
  } catch (e: any) { return res.err(e.message); }
}
