// src/app/api/admin/invites/route.ts
// CHANGED: Sends invite email via Resend instead of returning to frontend for EmailJS
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { emailService } from '@/lib/email';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const snap = await adminDb().collection('adminInvites').orderBy('createdAt', 'desc').get();
    return res.ok(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e: any) {
    return res.err(e.message);
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();

  try {
    const { email, role, invitedByName } = await req.json();
    if (!email) return res.err('Email is required', 400);

    const code = 'FADMIN-' + Math.random().toString(36).slice(2, 12).toUpperCase();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 86400 * 1000));
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/accept-invite?code=${code}`;

    // Save to Firestore first
    const ref = await adminDb().collection('adminInvites').add({
      code,
      email,
      role: role || 'editor',
      invitedBy: admin.uid,
      invitedByName: invitedByName || admin.name || 'Admin',
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
    });

    // Send email via Resend (server-side, no EmailJS needed)
    let emailSent = false;
    try {
      await emailService.adminInvite(
        email,
        invitedByName || admin.name || 'Admin',
        code,
        role || 'editor',
        inviteUrl
      );
      emailSent = true;
    } catch (emailErr) {
      console.error('[Invite] Email failed:', emailErr);
      // Don't fail the whole request — invite still created, admin can share code manually
    }

    return res.ok({ id: ref.id, code, inviteUrl, email, emailSent });
  } catch (e: any) {
    return res.err(e.message);
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return res.err('id required', 400);
    await adminDb().collection('adminInvites').doc(id).update({ status: 'revoked' });
    return res.ok({ revoked: true });
  } catch (e: any) {
    return res.err(e.message);
  }
}