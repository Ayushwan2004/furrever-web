// src/app/api/admin/invites/accept/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { code, uid } = await req.json();
    const snap = await adminDb().collection('adminInvites').where('code','==',code).where('status','==','pending').get();
    if (snap.empty) return res.err('Invalid or expired invite code', 400);
    const inv = snap.docs[0]; const d = inv.data();
    if (d.expiresAt?.toDate?.() < new Date()) {
      await inv.ref.update({ status: 'expired' }); return res.err('Invite code expired', 400);
    }
    const batch = adminDb().batch();
    batch.update(inv.ref, { status: 'accepted', acceptedBy: uid, acceptedAt: FieldValue.serverTimestamp() });
    batch.update(adminDb().collection('users').doc(uid), { role: 'admin', adminRole: d.role, adminGrantedBy: d.invitedBy, adminGrantedAt: FieldValue.serverTimestamp() });
    await batch.commit();
    return res.ok({ role: d.role });
  } catch (e: any) { return res.err(e.message); }
}
