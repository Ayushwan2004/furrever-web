// src/lib/api.ts — all fetch helpers; frontend never touches Firestore directly
import { auth } from '@/lib/firebase/client';

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated — please log in again.');
  // forceRefresh=true ensures the token is never stale/expired
  return user.getIdToken(true);
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const r = await fetch('/api' + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...opts.headers,
    },
  });
  const json = await r.json();
  if (!r.ok) {
    const msg = json.error || json.message || `Request failed (${r.status})`;
    console.error(`[API] ${opts.method || 'GET'} /api${path} →`, r.status, msg, json.reason || '');
    throw new Error(msg);
  }
  return json.data as T;
}

// ── PETS ──────────────────────────────────────────
export const petsApi = {
  create: (d: any)                     => req('/pets',        { method: 'POST',   body: JSON.stringify(d) }),
  update: (id: string, d: any)         => req(`/pets/${id}`,  { method: 'PATCH',  body: JSON.stringify(d) }),
  remove: (id: string, reason: string) => req(`/pets/${id}`,  { method: 'DELETE', body: JSON.stringify({ reason }) }),
};

// ── USERS ─────────────────────────────────────────
export const usersApi = {
  terminate: (uid: string, reason: string) => req(`/users/${uid}/terminate`, { method: 'POST', body: JSON.stringify({ reason }) }),
  restore:   (uid: string)                 => req(`/users/${uid}/restore`,   { method: 'POST' }),
};

// ── ADOPTIONS ─────────────────────────────────────
export const adoptionsApi = {
  updateStatus: (id: string, petId: string, status: string) =>
    req(`/adoptions/${id}/status`, { method: 'POST', body: JSON.stringify({ petId, status }) }),
  cancel: (id: string, reason: string) =>
    req(`/adoptions/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
};

// ── CERTIFICATIONS ────────────────────────────────
export const certsApi = {
  issue: (d: any) =>
    req('/certifications', { method: 'POST', body: JSON.stringify(d) }),
  // ✅ FIXED: pass petId — it is now the Firestore document ID in 'certificates'
  revoke: (petId: string) =>
    req(`/certifications/${petId}/revoke`, { method: 'POST' }),
};

// ── NOTIFICATIONS ─────────────────────────────────
export const notificationsApi = {
  send: (d: any) => req('/notifications', { method: 'POST', body: JSON.stringify(d) }),
};

// ── CONTACTS ──────────────────────────────────────
export const contactsApi = {
  submit:   (d: any)     => fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
  delete:   (id: string) => req(`/contacts/${id}`,       { method: 'DELETE' }),
  markRead: (id: string) => req(`/contacts/${id}/read`,  { method: 'POST' }),
};

// ── ADMIN INVITES ──────────────────────────────────
export const invitesApi = {
  send:   (d: any)     => req('/admin/invites',        { method: 'POST',   body: JSON.stringify(d) }),
  revoke: (id: string) => req(`/admin/invites/${id}`,  { method: 'DELETE' }),
  accept: (code: string, uid: string) =>
    fetch('/api/admin/invites/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, uid }) }).then(r => r.json()),
};

// ── PROMO ─────────────────────────────────────────
export const promoApi = {
  send: (d: any) => req('/promo', { method: 'POST', body: JSON.stringify(d) }),
};