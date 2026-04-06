// src/app/api/contacts/[id]/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try { await adminDb().collection('contacts').doc(params.id).delete(); return res.ok({}); }
  catch (e: any) { return res.err(e.message); }
}
