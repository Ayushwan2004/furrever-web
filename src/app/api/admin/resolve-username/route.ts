// src/app/api/admin/resolve-username/route.ts
import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { res } from '@/lib/apiMiddleware';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) return res.err('username required', 400);

    const snap = await adminDb()
      .collection('Admins')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (snap.empty) return res.err('Username not found.', 404);
    return res.ok({ email: snap.docs[0].data().email });
  } catch (e: any) {
    return res.err(e.message);
  }
}