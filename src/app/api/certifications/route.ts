// src/app/api/certifications/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin, res } from '@/lib/apiMiddleware';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.unauth();
  try {
    const body = await req.json();

    if (!body.petId) return res.err('petId is required');

    // ✅ Deterministic serial — identical to what the RN app generates
    const serialCode = `CERT-${body.petId}`;

    // ✅ Document ID = petId — same key the app uses, prevents any duplicate
    const certRef = adminDb().collection('certificates').doc(body.petId);
    const existing = await certRef.get();
    const currentVersion: number = existing.exists ? (existing.data()?.version ?? 1) : 0;

    const certData = {
      serialCode,
      petId:        body.petId,
      petName:      body.petName,
      petImage:     body.petImage    || '',
      adopterId:    body.adopterId,
      adopterName:  body.adopterName,
      adoptionId:   body.adoptionId,
      breed:        body.breed       || '',
      category:     body.category    || '',
      color:        body.color       || '',
      age:          body.age         || '',
      certType:     body.certType    || 'adoption',
      message:      body.message     || '',
      expiresAt:    body.expiresAt   || null,
      // 'active' on first issue, 'reissued' on every subsequent admin action
      status:       currentVersion >= 1 ? 'reissued' : 'active',
      issuedBy:     admin.uid,
      issuedByName: body.issuedByName || admin.name || 'Admin',
      issuedAt:     FieldValue.serverTimestamp(),
      version:      currentVersion + 1,
    };

    // ✅ merge:true — preserves fields the admin form didn't touch (e.g. petImage set by app)
    await certRef.set(certData, { merge: true });

    // In-app notification to adopter
    await adminDb().collection('notifications').add({
      receiverId: body.adopterId,
      title: '🏆 Your Adoption Certificate is Ready!',
      message: `Congratulations ${body.adopterName}! Your certificate for ${body.petName} (${serialCode}) has been ${currentVersion >= 1 ? 'reissued' : 'issued'}.`,
      isRead:    false,
      type:      'certificate',
      certId:    serialCode,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Resolve adopter email — use what was sent, or fall back to Firestore
    let adopterEmail = body.adopterEmail;
    if (!adopterEmail && body.adopterId) {
      try {
        const us = await adminDb().collection('users').doc(body.adopterId).get();
        adopterEmail = us.data()?.email;
      } catch {}
    }

    return res.ok({ id: body.petId, certId: serialCode, adopterEmail, version: currentVersion + 1 });
  } catch (e: any) { return res.err(e.message); }
}