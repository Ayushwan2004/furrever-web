'use client';
// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { UserType } from '@/types';

interface AuthCtx {
  user: UserType | null;
  fbUser: User | null;
  loading: boolean;
  login: (email: string, pw: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubDocRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fu) => {
      setFbUser(fu);
      if (unsubDocRef.current) { unsubDocRef.current(); unsubDocRef.current = null; }
      if (!fu) { setUser(null); setLoading(false); return; }

      // First check if this uid exists in Admins collection
      const adminSnap = await getDoc(doc(db, 'Admins', fu.uid));

      if (adminSnap.exists()) {
        // ── Admin user — realtime listener on Admins collection ──────────────
        unsubDocRef.current = onSnapshot(doc(db, 'Admins', fu.uid), (snap) => {
          if (snap.exists()) {
            const d = snap.data();
            setUser({
              uid: d.aid || fu.uid,
              email: d.email || fu.email!,
              name: d.username || fu.displayName || 'Admin',
              role: 'admin',
              adminRole: d.adminRole || d.role,
              adminStatus: d.adminStatus,
              petPostIds: [],
              favorites: [],
              adoptedPets: [],
              emailVerified: true,
              createdAt: d.createdAt,
            } as any);
          } else {
            setUser(null);
          }
          setLoading(false);
        }, () => setLoading(false));

      } else {
        // ── Regular user — realtime listener on users collection ─────────────
        unsubDocRef.current = onSnapshot(doc(db, 'users', fu.uid), (snap) => {
          if (snap.exists()) {
            setUser({ ...snap.data() as UserType, uid: fu.uid, emailVerified: !!fu.emailVerified });
          } else {
            setUser(null);
          }
          setLoading(false);
        }, () => setLoading(false));
      }
    });

    return () => { unsubAuth(); if (unsubDocRef.current) unsubDocRef.current(); };
  }, []);

  const login = async (email: string, pw: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pw);
      const fu = cred.user;

      const adminSnap = await getDoc(doc(db, 'Admins', fu.uid));
      if (adminSnap.exists()) {
        const d = adminSnap.data();
        if (d.adminStatus === 'terminated') {
          await signOut(auth);
          return { success: false, error: 'This account has been terminated.' };
        }

        // ✅ Auto-accept pending invite on first login
        if (d.status === 'pending' && d.code) {
          try {
            await fetch('/api/admin/invites/accept', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: d.code, uid: fu.uid }),
            });
            await fu.getIdToken(true); // force-refresh claims
          } catch (e) {
            console.warn('Auto-accept failed:', e);
          }
        }

        return { success: true };
      }

      // regular user fallback...
      const userSnap = await getDoc(doc(db, 'users', fu.uid));
      if (!userSnap.exists()) { await signOut(auth); return { success: false, error: 'Account not found in database.' }; }
      const data = userSnap.data() as UserType;
      if (data.role !== 'admin' && !(data as any).adminRole) { await signOut(auth); return { success: false, error: 'Access denied. Admin privileges required.' }; }
      if ((data as any).adminStatus === 'terminated') { await signOut(auth); return { success: false, error: 'This account has been terminated.' }; }
      return { success: true };
    } catch (e: any) {
      const m: Record<string, string> = {
        'auth/wrong-password': 'Incorrect password.',
        'auth/user-not-found': 'No account found.',
        'auth/invalid-credential': 'Invalid credentials.',
        'auth/too-many-requests': 'Too many attempts. Please wait.',
      };
      return { success: false, error: m[e.code] || e.message };
    }
  };

  const logout = async () => { await signOut(auth); };

  return <Ctx.Provider value={{ user, fbUser, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside AuthProvider');
  return c;
};