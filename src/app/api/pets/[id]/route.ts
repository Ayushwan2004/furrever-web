// src/app/api/pets/[id]/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const body = await req.json();
    await adminDb().collection('pets').doc(params.id).update({ ...body, updatedAt: FieldValue.serverTimestamp() });
    return res.ok({ id: params.id });
  } catch (e: any) { return res.err(e.message); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    // Safe body parse — never throw if body is missing/malformed
    let reason = 'Removed for violating FurrEver listing guidelines';
    try { const b = await req.json(); if (b?.reason) reason = b.reason; } catch {}

    // Fetch pet BEFORE deleting so we can get owner info for the notification email
    const petSnap = await adminDb().collection('pets').doc(params.id).get();
    const pet = petSnap.data();

    // Soft-delete with full admin decision trail
    await adminDb().collection('pets').doc(params.id).update({
      isDeleted:          true,
      adminRemoved:       true,
      adminRemovedReason: reason,
      adminRemovedBy:     admin.uid,
      adminRemovedAt:     FieldValue.serverTimestamp(),
      deletedAt:          FieldValue.serverTimestamp(),
      status:             'removed',
    });

    // Fetch owner email/name so client-side EmailJS can notify them
    let ownerEmail: string | null = null;
    let ownerName:  string | null = null;
    if (pet?.ownerId) {
      try {
        const ownerSnap = await adminDb().collection('users').doc(pet.ownerId).get();
        const owner = ownerSnap.data();
        ownerEmail = owner?.email || null;
        ownerName  = owner?.name  || null;
      } catch {}
    }

    return res.ok({ id: params.id, petName: pet?.name || 'Your pet', ownerEmail, ownerName, reason });
  } catch (e: any) { return res.err(e.message); }
}