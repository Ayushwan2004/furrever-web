// src/app/api/admin/invites/route.ts
import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { emailService } from '@/lib/email';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const snap = await adminDb().collection('Admins').orderBy('createdAt', 'desc').get();
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

    const localPart = email.split('@')[0];
    const username  = `furrever@${localPart}`;
    const code      = 'FADMIN-' + Math.random().toString(36).slice(2, 12).toUpperCase();
    const password  = `${code}@${username}#`;
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 86400 * 1000));
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/accept-invite?code=${code}`;

    // ── Firebase Auth account ─────────────────────────────────────────────────
    let aid: string;
    try {
      const existing = await adminAuth().getUserByEmail(email).catch(() => null);
      if (existing) {
        await adminAuth().updateUser(existing.uid, { displayName: username, password });
        aid = existing.uid;
      } else {
        const created = await adminAuth().createUser({
          email, password, displayName: username, emailVerified: true,
        });
        aid = created.uid;
      }
    } catch (authErr: any) {
      return res.err(`Failed to create admin account: ${authErr.message}`, 500);
    }

    // ── Single Admins doc — status: pending until first login ─────────────────
    await adminDb().collection('Admins').doc(aid).set({
      aid,
      email,
      username,
      role:          role || 'editor',
      adminRole:     role || 'editor',
      adminStatus:   'active',
      status:        'pending',         
      code,
      inviteUrl,
      expiresAt,
      invitedBy:     admin.uid,
      invitedByName: invitedByName || admin.name || 'Admin',
      createdAt:     FieldValue.serverTimestamp(),
      acceptedAt:    null,
    });

    // ── Email ─────────────────────────────────────────────────────────────────
    let emailSent = false;
    try {
      await emailService.adminInvite(email, invitedByName || admin.name || 'Admin', code, role || 'editor', inviteUrl, username, password);
      emailSent = true;
    } catch (err) {
      console.error('[Invite] Email failed:', err);
    }

    return res.ok({ aid, code, inviteUrl, email, username, password, emailSent });
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
    await adminDb().collection('Admins').doc(id).update({ status: 'revoked' });
    return res.ok({ revoked: true });
  } catch (e: any) {
    return res.err(e.message);
  }
}