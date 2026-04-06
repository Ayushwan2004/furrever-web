// src/app/api/pets/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const body = await req.json();
    const ref = adminDb().collection('pets').doc();
    await ref.set({ ...body, id: ref.id, isDeleted: false, favoredBy: [], status: 'available', createdAt: FieldValue.serverTimestamp() });
    return res.ok({ id: ref.id });
  } catch (e: any) { return res.err(e.message); }
}
