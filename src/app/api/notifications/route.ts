// src/app/api/notifications/route.ts
// CHANGED: Now also sends Expo push to targeted user or ALL users
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';
import { sendSinglePush, sendBulkPush } from '@/lib/expoPush';

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();

  try {
    const body = await req.json();
    const { title, message, receiverId = 'ALL', type = 'broadcast' } = body;

    if (!title || !message) return res.err('title and message are required', 400);

    // 1. Write to Firestore (in-app notification history)
    await adminDb().collection('notifications').add({
      title,
      message,
      receiverId,
      type,
      isRead: false,
      sentBy: admin.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 2. Send Expo push notification(s)
    if (receiverId === 'ALL') {
      // Fetch all user push tokens
      const usersSnap = await adminDb()
        .collection('users')
        .where('adminStatus', '!=', 'terminated')
        .get();

      const tokens: string[] = [];
      usersSnap.docs.forEach(d => {
        const token = d.data().expoPushToken;
        if (token) tokens.push(token);
      });

      await sendBulkPush(tokens, title, message, { type });
    } else {
      // Target specific user
      const userSnap = await adminDb().collection('users').doc(receiverId).get();
      if (userSnap.exists) {
        const token = userSnap.data()?.expoPushToken;
        if (token) await sendSinglePush(token, title, message, { type });
      }
    }

    return res.ok({ sent: true });
  } catch (e: any) {
    return res.err(e.message);
  }
}