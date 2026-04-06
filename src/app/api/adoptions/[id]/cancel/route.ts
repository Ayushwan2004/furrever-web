// src/app/api/adoptions/[id]/cancel/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const { reason } = await req.json();
    await adminDb().collection('adoptions').doc(params.id).update({
      status: 'cancelled', updatedAt: FieldValue.serverTimestamp(),
      adminDecision: reason || 'Cancelled by admin',
      adminDecisionBy: admin.uid, adminDecisionAt: FieldValue.serverTimestamp(),
    });
    return res.ok({ id: params.id });
  } catch (e: any) { return res.err(e.message); }
}
