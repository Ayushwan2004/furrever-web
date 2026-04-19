// src/app/api/admin/invites/accept/route.ts
import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { code, uid } = await req.json();
    if (!code || !uid) return res.err('code and uid required', 400);

    const snap = await adminDb()
      .collection('Admins')
      .where('code', '==', code)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (snap.empty) return res.err('Invalid or expired invite code', 400);

    const docRef = snap.docs[0].ref;
    const d = snap.docs[0].data();

    if (d.expiresAt?.toDate?.() < new Date()) {
      await docRef.update({ status: 'expired' });
      return res.err('Invite code expired', 400);
    }

    if (d.aid !== uid) return res.err('Account mismatch', 403);
    await adminAuth().setCustomUserClaims(uid, {
      role: d.role || 'editor',
      isAdmin: true,
    });

    await docRef.update({
      status:         'accepted',
      acceptedAt:     FieldValue.serverTimestamp(),
      adminGrantedBy: d.invitedBy,
      adminGrantedAt: FieldValue.serverTimestamp(),
    });

    return res.ok({ role: d.role, aid: d.aid });
  } catch (e: any) {
    return res.err(e.message);
  }
}