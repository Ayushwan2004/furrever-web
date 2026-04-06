// src/lib/firebase/admin.ts — SERVER SIDE ONLY, never import in 'use client' files
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth }      from 'firebase-admin/auth';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // Validate required env vars — gives a clear error instead of silent failure
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [
      !projectId   && 'FIREBASE_ADMIN_PROJECT_ID',
      !clientEmail && 'FIREBASE_ADMIN_CLIENT_EMAIL',
      !privateKey  && 'FIREBASE_ADMIN_PRIVATE_KEY',
    ].filter(Boolean).join(', ');
    throw new Error(
      `Firebase Admin SDK: missing environment variables: ${missing}. ` +
      `Go to Firebase Console → Project Settings → Service Accounts → Generate new private key, ` +
      `then add the values to your .env.local file.`
    );
  }

  // Handle private key — works whether .env has \n literals or real newlines
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: formattedKey,
    }),
  });
}

export const adminDb   = () => getFirestore(getAdminApp());
export const adminAuth = () => getAuth(getAdminApp());