'use client';
// src/app/(admin)/admin/invite/page.tsx
// CHANGED: Removed emailService import — email is now sent from the API route (server-side Resend)
import { useState } from 'react';
import { useRTInvites } from '@/hooks/useRealtime';
import { invitesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AdminTopbar, Badge, ActionBtn } from '@/components/admin/AdminShared';
import DataTable, { Column } from '@/components/admin/DataTable';
import { fmtDate } from '@/utils';
import toast from 'react-hot-toast';

export default function InvitePage() {
  const { data: invites, loading } = useRTInvites();
  const { user: me } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [busy, setBusy] = useState(false);
  const [lastInvite, setLastInvite] = useState<{ code: string; url: string; email: string; emailSent: boolean } | null>(null);

  async function handleInvite() {
    if (!email) { toast.error('Enter an email address.'); return; }
    setBusy(true);
    try {
      // Email is sent server-side by the API route via Resend
      const res: any = await invitesApi.send({
        email,
        role,
        invitedByName: me?.name || 'Admin',
        invitedById: me?.uid,
      });

      if (res.emailSent) {
        toast.success(`Invite sent to ${email}!`);
      } else {
        toast.success(`Invite created! Email delivery failed — share the code manually.`);
      }

      setLastInvite({ code: res.code, url: res.inviteUrl, email, emailSent: res.emailSent });
      setEmail('');
      setRole('editor');
    } catch (e: any) {
      toast.error(e.message);
    }
    setBusy(false);
  }

  async function handleRevoke(id: string) {
    if (!confirm('Revoke this invite?')) return;
    try {
      await invitesApi.revoke(id);
      toast.success('Invite revoked');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-amber-100 text-amber-800 border-amber-300',
    editor: 'bg-blue-100 text-blue-700 border-blue-200',
    viewer: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const columns: Column<any>[] = [
    { key: 'email', label: 'Invited Email', sortable: true, render: (r) => <span className="font-bold text-sm">{r.email}</span> },
    { key: 'role', label: 'Role', render: (r) => <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleColors[r.role] || ''}`}>{r.role}</span> },
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs bg-[#f0e8d5] px-2 py-1 rounded-lg">{r.code}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'invitedByName', label: 'Invited By', render: (r) => <span className="text-sm">{r.invitedByName}</span> },
    { key: 'createdAt', label: 'Created', sortable: true, render: (r) => <span className="text-xs text-[#9B6E50]">{fmtDate(r.createdAt)}</span> },
    { key: 'expiresAt', label: 'Expires', render: (r) => <span className="text-xs text-[#9B6E50]">{fmtDate(r.expiresAt)}</span> },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <div className="flex gap-1.5">
          {r.status === 'pending' && (
            <>
              <ActionBtn onClick={() => { navigator.clipboard.writeText(r.code); toast.success('Code copied!'); }} variant="info">📋 Copy</ActionBtn>
              <ActionBtn onClick={() => handleRevoke(r.id)} variant="danger">Revoke</ActionBtn>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminTopbar title="Invite Admins" subtitle="Grant admin access to team members" />
      <div className="p-7 space-y-7">
        {/* Compose */}
        <div className="bg-white rounded-2xl p-6 border border-[#f0e8d5]">
          <div className="font-extrabold text-base mb-5">✉️ Send Admin Invite</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Email Address *</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3]"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Access Level</label>
              <select
                value={role} onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3]"
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="editor">Editor (Edit + View)</option>
                <option value="viewer">Viewer (View Only)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700">
            ℹ️ An invite email will be sent automatically via Resend. A unique 7-day code is generated and included. The recipient must log in and visit the invite URL to activate admin access.
          </div>

          {lastInvite && (
            <div className={`mt-4 p-4 rounded-xl border ${lastInvite.emailSent ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`font-bold text-sm mb-2 ${lastInvite.emailSent ? 'text-green-700' : 'text-amber-700'}`}>
                {lastInvite.emailSent ? `✓ Invite emailed to ${lastInvite.email}` : `⚠️ Email failed — share code manually with ${lastInvite.email}`}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm bg-white border border-green-300 px-3 py-1.5 rounded-lg">{lastInvite.code}</span>
                <button onClick={() => { navigator.clipboard.writeText(lastInvite.code); toast.success('Copied!'); }}
                  className="text-xs font-bold text-green-700 underline">Copy Code</button>
                <button onClick={() => { navigator.clipboard.writeText(lastInvite.url); toast.success('URL Copied!'); }}
                  className="text-xs font-bold text-green-700 underline">Copy URL</button>
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button onClick={handleInvite} disabled={busy || !email}
              className="flex items-center gap-2 bg-primary text-[#1b1a18] px-6 py-2.5 rounded-full font-extrabold text-sm shadow-[3px_3px_0_#d98b19] hover:shadow-[5px_5px_0_#d98b19] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {busy ? 'Sending…' : '✉️ Send Invite'}
            </button>
          </div>
        </div>

        {/* Role breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { role: 'admin', icon: '👑', desc: 'Full access — create, edit, delete, invite' },
            { role: 'editor', icon: '✏️', desc: 'Create and edit records, cannot delete or invite' },
            { role: 'viewer', icon: '👁', desc: 'View-only access to all data' },
          ].map(r => (
            <div key={r.role} className="bg-white rounded-2xl p-5 border border-[#f0e8d5]">
              <div className="text-2xl mb-2">{r.icon}</div>
              <div className="font-extrabold text-sm capitalize">{r.role}</div>
              <div className="text-xs text-[#9B6E50] mt-1">{r.desc}</div>
            </div>
          ))}
        </div>

        <DataTable
          data={invites} columns={columns} loading={loading}
          searchKeys={['email', 'code', 'invitedByName']}
          filterKey="status"
          filterOptions={[
            { label: 'Pending', value: 'pending' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Expired', value: 'expired' },
            { label: 'Revoked', value: 'revoked' },
          ]}
          title="Sent Invites"
          emptyIcon="✉️" emptyText="No invites sent yet"
        />
      </div>
    </div>
  );
}