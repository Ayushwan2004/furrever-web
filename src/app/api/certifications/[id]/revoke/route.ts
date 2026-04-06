// src/app/api/certifications/[id]/revoke/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    // ✅ params.id is petId — the shared document ID used by both app and web
    await adminDb().collection('certificates').doc(params.id).update({
      status:    'revoked',
      revokedBy: admin.uid,
      revokedAt: FieldValue.serverTimestamp(),
    });
    return res.ok({ id: params.id });
  } catch (e: any) { return res.err(e.message); }
}