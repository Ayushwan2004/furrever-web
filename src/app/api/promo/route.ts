// src/app/api/promo/route.ts
// CHANGED: Now actually sends emails via Resend (previously only logged to Firestore)
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';
import { emailService } from '@/lib/email';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const snap = await adminDb().collection('promoEmails').orderBy('sentAt', 'desc').get();
    return res.ok(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e: any) {
    return res.err(e.message);
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();

  try {
    const { subject, body, targetRole } = await req.json();
    if (!subject || !body) return res.err('subject and body are required', 400);

    // Fetch recipients
    let q: FirebaseFirestore.Query = adminDb().collection('users');
    if (targetRole && targetRole !== 'all') {
      q = q.where('role', '==', targetRole);
    }

    const usersSnap = await q.get();
    const recipients = usersSnap.docs
      .map(d => ({ email: d.data().email, name: d.data().name || 'Friend', uid: d.id }))
      .filter(u => u.email && !usersSnap.docs.find(d => d.id === u.uid)?.data().adminStatus?.includes('terminated'));

    if (!recipients.length) return res.err('No eligible recipients found', 400);

    // Send emails via Resend (in parallel batches of 10)
    let sentCount = 0;
    const BATCH = 10;
    for (let i = 0; i < recipients.length; i += BATCH) {
      const chunk = recipients.slice(i, i + BATCH);
      await Promise.allSettled(
        chunk.map(async (r) => {
          try {
            await emailService.promo(r.email, r.name, subject, body);
            sentCount++;
          } catch (err) {
            console.error(`[Promo] Failed to send to ${r.email}:`, err);
          }
        })
      );
    }

    // Log to Firestore
    await adminDb().collection('promoEmails').add({
      subject,
      body,
      targetRole: targetRole || 'all',
      sentBy: admin.uid,
      recipientCount: recipients.length,
      sentCount,
      sentAt: FieldValue.serverTimestamp(),
    });

    return res.ok({ count: sentCount, total: recipients.length });
  } catch (e: any) {
    return res.err(e.message);
  }
}