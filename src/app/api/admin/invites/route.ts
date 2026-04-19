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

    // ── Derive username + password ────────────────────────────────────────────
    // username: FurrEver@<localpart>   e.g. FurrEver@john
    // password: <email>@furrever.admin#
    const localPart = email.split('@')[0];
   const username = `furrever@${localPart}`;
   const password = `furrever@$#FADMIN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    // ── Create Firebase Auth account ──────────────────────────────────────────
    let firebaseUid: string;
    try {
      // Check if user already exists
      const existing = await adminAuth().getUserByEmail(email).catch(() => null);
      if (existing) {
        // Update password + displayName if already exists
        await adminAuth().updateUser(existing.uid, { displayName: username, password });
        firebaseUid = existing.uid;
      } else {
        const created = await adminAuth().createUser({
          email,
          password,
          displayName: username,
          emailVerified: true,
        });
        firebaseUid = created.uid;
      }
    } catch (authErr: any) {
      return res.err(`Failed to create admin account: ${authErr.message}`, 500);
    }

    // ── Write to Firestore users collection ───────────────────────────────────
    await adminDb().collection('users').doc(firebaseUid).set({
      uid:           firebaseUid,
      email,
      name:          username,
      role:          'admin',
      adminRole:     role || 'editor',
      adminStatus:   'active',
      petPostIds:    [],
      favorites:     [],
      adoptedPets:   [],
      emailVerified: true,
      createdAt:     FieldValue.serverTimestamp(),
    }, { merge: true });

    // ── Write to Admins collection ────────────────────────────────────────────
    await adminDb().collection('Admins').doc(firebaseUid).set({
      uid:           firebaseUid,
      email,
      username,
      role:          role || 'editor',
      status:        'invited',
      invitedBy:     admin.uid,
      invitedByName: invitedByName || admin.name || 'Admin',
      createdAt:     FieldValue.serverTimestamp(),
    });

    // ── Create invite code ────────────────────────────────────────────────────
    const code      = 'FADMIN-' + Math.random().toString(36).slice(2, 12).toUpperCase();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 86400 * 1000));
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/accept-invite?code=${code}`;

    const ref = await adminDb().collection('adminInvites').add({
      code,
      email,
      username,
      role:          role || 'editor',
      invitedBy:     admin.uid,
      invitedByName: invitedByName || admin.name || 'Admin',
      status:        'pending',
      firebaseUid,
      createdAt:     FieldValue.serverTimestamp(),
      expiresAt,
    });

    // ── Send email ────────────────────────────────────────────────────────────
    let emailSent = false;
    try {
      await emailService.adminInvite(
        email,
        invitedByName || admin.name || 'Admin',
        code,
        role || 'editor',
        inviteUrl,
        username,
        password,
      );
      emailSent = true;
    } catch (emailErr) {
      console.error('[Invite] Email failed:', emailErr);
    }

    return res.ok({
      id: ref.id,
      code,
      inviteUrl,
      email,
      username,
      password,
      emailSent,
    });
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