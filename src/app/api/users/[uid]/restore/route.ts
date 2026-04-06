// src/app/api/users/[uid]/restore/route.ts
import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest, { params }: { params: { uid: string } }) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    await adminDb().collection('users').doc(params.uid).update({
      adminStatus: 'active',
      adminDecision: FieldValue.delete() as any,
      adminDecisionAt: FieldValue.delete() as any,
      adminDecisionBy: FieldValue.delete() as any,
    });
    try { await adminAuth().updateUser(params.uid, { disabled: false }); } catch {}
    return res.ok({ uid: params.uid });
  } catch (e: any) { return res.err(e.message); }
}
