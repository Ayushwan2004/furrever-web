// src/app/api/contacts/[id]/read/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try { await adminDb().collection('contacts').doc(params.id).update({ read: true }); return res.ok({}); }
  catch (e: any) { return res.err(e.message); }
}
