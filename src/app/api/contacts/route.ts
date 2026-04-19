// src/app/api/contacts/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';
import { emailService } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !subject || !message) return res.err('All fields required', 400);

    // Save to Firestore
    await adminDb().collection('contacts').add({
      name, email, subject, message,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Send email notification server-side — nodemailer runs here, never on client
    try {
      await emailService.contactForm(name, email, subject, message);
    } catch (emailErr) {
      console.error('[Contact] Email failed:', emailErr);
      // Don't fail the request — message is saved to Firestore regardless
    }

    return res.ok({ sent: true });
  } catch (e: any) {
    return res.err(e.message);
  }
}

export async function GET(req: NextRequest) {
  const { verifyAdmin } = await import('@/lib/apiMiddleware');
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const snap = await adminDb().collection('contacts').orderBy('createdAt', 'desc').get();
    return res.ok(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e: any) {
    return res.err(e.message);
  }
}