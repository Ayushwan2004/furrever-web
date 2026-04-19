'use client';
// src/hooks/useRealtime.ts — onSnapshot listeners for admin panel live data
import { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, where, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/context/AuthContext';

function normaliseTimestamp(v: any): string | null {
  if (!v) return null;
  if (v?.toDate) return v.toDate().toISOString();
  if (typeof v === 'string') return v;
  if (v?.seconds) return new Date(v.seconds * 1000).toISOString();
  return null;
}
function normaliseDoc(d: any) {
  return {
    ...d,
    createdAt:       normaliseTimestamp(d.createdAt),
    updatedAt:       normaliseTimestamp(d.updatedAt),
    issuedAt:        normaliseTimestamp(d.issuedAt),
    deletedAt:       normaliseTimestamp(d.deletedAt),
    adminDecisionAt: normaliseTimestamp(d.adminDecisionAt),
    adminRemovedAt:  normaliseTimestamp(d.adminRemovedAt),
    expiresAt:       normaliseTimestamp(d.expiresAt),
    sentAt:          normaliseTimestamp(d.sentAt),
  };
}

export function useRealtimeCol<T>(col: string, constraints: QueryConstraint[] = []) {
  const [data, setData]       = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, col), ...constraints);
    const unsub = onSnapshot(q,
      (snap) => { setData(snap.docs.map(d => normaliseDoc({ id: d.id, ...d.data() }) as T)); setLoading(false); },
      (e)    => { setError(e.message); setLoading(false); },
    );
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [col, user?.uid]);

  return { data, loading, error };
}

// ── Specific hooks ───────────────────────────────────────
export function useRTPets() {
  return useRealtimeCol('pets', [where('isDeleted', '==', false), orderBy('createdAt', 'desc')]);
}
export function useRTUsers() {
  return useRealtimeCol('users', [orderBy('createdAt', 'desc')]);
}
export function useRTAdoptions() {
  return useRealtimeCol('adoptions', [orderBy('createdAt', 'desc')]);
}
export function useRTCertifications() {
  return useRealtimeCol('certificates', [orderBy('issuedAt', 'desc')]);
}
export function useRTContacts() {
  return useRealtimeCol('contacts', [orderBy('createdAt', 'desc')]);
}
export function useRTNotifications() {
  return useRealtimeCol('notifications', [orderBy('createdAt', 'desc')]);
}
export function useRTInvites() {
  return useRealtimeCol('Admins', [orderBy('createdAt', 'desc')]);
}
export function useRTPromos() {
  return useRealtimeCol('promoEmails', [orderBy('sentAt', 'desc')]);
}

// ── Dashboard aggregated stats ────────────────────────────
export function useDashboardStats() {
  const { data: pets,      loading: lp } = useRTPets();
  const { data: users,     loading: lu } = useRTUsers();
  const { data: adoptions, loading: la } = useRTAdoptions();
  const { data: contacts,  loading: lc } = useRTContacts();
  const { data: certs,     loading: lk } = useRTCertifications();

  const stats = useMemo(() => {
    const ad = adoptions as any[];
    return {
      totalPets:         pets.length,
      availablePets:     (pets as any[]).filter(p => p.status === 'available').length,
      soldPets:          (pets as any[]).filter(p => p.status === 'sold').length,
      totalUsers:        users.length,
      adopters:          (users as any[]).filter(u => u.role === 'adopter').length,
      sellers:           (users as any[]).filter(u => u.role === 'seller').length,
      admins:            (users as any[]).filter(u => u.role === 'admin').length,
      totalAdoptions:    adoptions.length,
      pendingAdoptions:  ad.filter(a => a.status === 'pending').length,
      approvedAdoptions: ad.filter(a => a.status === 'approved').length,
      rejectedAdoptions: ad.filter(a => a.status === 'rejected').length,
      totalContacts:     contacts.length,
      unreadContacts:    (contacts as any[]).filter(c => !c.read).length,
      totalCerts:        certs.length,
      terminated:        (users as any[]).filter(u => u.adminStatus === 'terminated').length,
      adoptionRate:      adoptions.length
        ? Math.round((ad.filter(a => a.status === 'approved').length / adoptions.length) * 100) : 0,
    };
  }, [pets, users, adoptions, contacts, certs]);

  return { stats, pets, users, adoptions, contacts, certs, loading: lp || lu || la || lc || lk };
}