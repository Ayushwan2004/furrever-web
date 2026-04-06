// src/app/api/users/[uid]/terminate/route.ts
import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';
import { emailService } from '@/lib/email';
import { sendSinglePush } from '@/lib/expoPush';

export async function POST(req: NextRequest, { params }: { params: { uid: string } }) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();

  try {
    let reason = 'Account terminated for violating FurrEver community guidelines';
    try { const b = await req.json(); if (b?.reason) reason = b.reason; } catch {}

    // Fetch user data BEFORE update
    const snap = await adminDb().collection('users').doc(params.uid).get();
    if (!snap.exists) return res.err('User not found', 404);
    const u = snap.data()!;

    // 1. Mark terminated in Firestore
    await adminDb().collection('users').doc(params.uid).update({
      adminStatus:     'terminated',
      adminDecision:   reason,
      adminDecisionBy: admin.uid,
      adminDecisionAt: FieldValue.serverTimestamp(),
      // Clear push token so terminated user stops receiving notifications
      expoPushToken:   null,
    });

    // 2. Disable Firebase Auth login
    try {
      await adminAuth().updateUser(params.uid, { disabled: true });
    } catch (authErr) {
      console.warn('[Terminate] Auth disable failed (non-critical):', authErr);
    }

    // 3. Write in-app Firestore notification (shows in NotificationContext when app opens)
    await adminDb().collection('notifications').add({
      receiverId: params.uid,
      title: '🚫 Account Suspended',
      message: `Your FurrEver account has been suspended. Visit ${process.env.NEXT_PUBLIC_APP_URL}/contact for more info.`,
      type: 'system',
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Send Expo push (fires BEFORE token is cleared — race is fine, best effort)
    if (u.expoPushToken) {
      await sendSinglePush(
        u.expoPushToken,
        '🚫 Account Suspended',
        'Your FurrEver account has been suspended. Tap for details.',
        { type: 'account_terminated' }
      ).catch(() => {}); // non-critical
    }

    // 5. Send termination email via Resend
    let emailSent = false;
    if (u.email) {
      try {
        await emailService.terminate(u.email, u.name || 'User', reason);
        emailSent = true;
      } catch (emailErr) {
        console.warn('[Terminate] Email failed (non-critical):', emailErr);
      }
    }

    return res.ok({
      uid: params.uid,
      email: u.email || null,
      name: u.name || 'User',
      reason,
      emailSent,
    });
  } catch (e: any) {
    return res.err(e.message);
  }
}