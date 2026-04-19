// src/app/api/adoptions/[id]/status/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';
import { emailService } from '@/lib/email';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const { petId, status } = await req.json();
    const db = adminDb();
    const appSnap = await db.collection('adoptions').doc(params.id).get();
    if (!appSnap.exists) return res.err('Application not found', 404);
    const app = appSnap.data()!;

    let petBreed = 'Unknown', petCategory = 'Pet', petColor = 'Standard', petAge = 'N/A';
    try {
      const ps = await db.collection('pets').doc(petId).get();
      if (ps.exists) { const p = ps.data()!; petBreed = p.breed||petBreed; petCategory = p.category||petCategory; petColor = p.coatcolor||petColor; petAge = p.age||petAge; }
    } catch {}

    const batch = db.batch();
    batch.update(db.collection('adoptions').doc(params.id), {
      status, petBreed, petCategory, petColor, petAge,
      updatedAt: FieldValue.serverTimestamp(),
      adminDecision: `Status set to ${status} by admin`,
      adminDecisionBy: admin.uid,
      adminDecisionAt: FieldValue.serverTimestamp(),
    });

    if (status === 'approved') {
      const others = await db.collection('adoptions').where('petId','==',petId).where('status','==','pending').get();
      others.docs.forEach(d => { if (d.id !== params.id) batch.update(d.ref, { status:'rejected', updatedAt: FieldValue.serverTimestamp(), rejectionReason:'Pet adopted by another user' }); });
      batch.update(db.collection('pets').doc(petId), { status:'sold', adoptedBy: app.adopterId, updatedAt: FieldValue.serverTimestamp() });
      batch.update(db.collection('users').doc(app.adopterId), { adoptedPets: FieldValue.arrayUnion(petId) });
    }

    await batch.commit();

    await db.collection('notifications').add({
      receiverId: app.adopterId,
      title: status === 'approved' ? 'Adoption Approved! 🎉' : 'Application Update',
      message: `Your request for ${app.petName} was ${status}.`,
      isRead: false, type: 'adoption_update',
      createdAt: FieldValue.serverTimestamp(),
    });

    const adopterSnap = await db.collection('users').doc(app.adopterId).get();
    const adopterEmail = adopterSnap.data()?.email;
    if (adopterEmail) {
      try {
        await emailService.decision(
          adopterEmail, app.adopterName, status, app.petName,
          `Your adoption request was ${status}`,
        );
      } catch (emailErr) {
        console.error('Email failed (non-fatal):', emailErr);
      }
    }

    return res.ok({ status });
  } catch (e: any) { return res.err(e.message); }
}