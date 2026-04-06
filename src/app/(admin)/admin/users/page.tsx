'use client';
// src/app/(admin)/admin/users/page.tsx
// CHANGED: Removed emailService import — terminate email is now sent server-side from the API route
import { useState } from 'react';
import { useRTUsers } from '@/hooks/useRealtime';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AdminTopbar, Modal, Badge, Avatar, DetailRow, ActionBtn } from '@/components/admin/AdminShared';
import DataTable, { Column } from '@/components/admin/DataTable';
import { fmtDate } from '@/utils';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { data: users, loading } = useRTUsers();
  const { user: me } = useAuth();
  const [selected, setSelected]       = useState<any>(null);
  const [termTarget, setTermTarget]   = useState<any>(null);
  const [reasonModal, setReasonModal] = useState(false);
  const [reason, setReason]           = useState('');
  const [busy, setBusy]               = useState(false);

  const columns: Column<any>[] = [
    {
      key: 'name', label: 'User', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={r.image} name={r.name} size={34} />
          <div className="min-w-0">
            <div className="font-bold text-sm truncate max-w-[140px]">{r.name}</div>
            <div className="text-[10px] text-[#9B6E50] truncate max-w-[140px]">{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', sortable: true, render: (r) => <Badge status={r.role} /> },
    {
      key: 'adminStatus', label: 'Status', sortable: true,
      render: (r) => r.adminStatus === 'terminated'
        ? <Badge status="terminated" />
        : <Badge status="active" />,
    },
    { key: 'petPostIds',  label: 'Pets Posted', sortable: true, render: (r) => <span className="font-bold text-sm">{r.petPostIds?.length || 0}</span> },
    { key: 'adoptedPets', label: 'Adopted',     sortable: true, render: (r) => <span className="font-bold text-sm">{r.adoptedPets?.length || 0}</span> },
    {
      key: 'emailVerified', label: 'Verified',
      render: (r) => r.emailVerified
        ? <span className="text-green-600 font-bold text-xs">✓ Yes</span>
        : <span className="text-red-500 font-bold text-xs">✗ No</span>,
    },
    { key: 'createdAt', label: 'Joined', sortable: true, render: (r) => <span className="text-xs text-[#9B6E50]">{fmtDate(r.createdAt)}</span> },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <div className="flex gap-1.5 flex-wrap">
          <ActionBtn onClick={() => setSelected(r)} variant="info">👁 View</ActionBtn>
          {r.adminStatus === 'terminated'
            ? <ActionBtn onClick={() => handleRestore(r)} variant="success">↩ Restore</ActionBtn>
            : <ActionBtn onClick={() => openTerminate(r)} variant="danger">🚫 Terminate</ActionBtn>
          }
        </div>
      ),
    },
  ];

  function openTerminate(u: any) {
    setTermTarget(u);
    setReasonModal(true);
    setReason('');
  }

  async function handleTerminate() {
    if (!termTarget || !reason.trim()) { toast.error('Please enter a reason.'); return; }
    setBusy(true);
    try {
      // API route handles: Firestore update + Auth disable + push notification + email
      const result: any = await usersApi.terminate(termTarget.uid || termTarget.id, reason);
      toast.success(
        result?.emailSent
          ? `Account terminated & email sent: ${termTarget.name}`
          : `Account terminated (email delivery failed): ${termTarget.name}`
      );
      setReasonModal(false);
      setTermTarget(null);
      setReason('');
    } catch (e: any) {
      toast.error(e.message);
    }
    setBusy(false);
  }

  async function handleRestore(u: any) {
    if (!confirm(`Restore account for ${u.name}?`)) return;
    setBusy(true);
    try {
      await usersApi.restore(u.uid || u.id);
      toast.success(`Account restored: ${u.name}`);
      setSelected(null);
    } catch (e: any) {
      toast.error(e.message);
    }
    setBusy(false);
  }

  return (
    <div>
      <AdminTopbar title="Users" subtitle={`${users.length} total users — live updates`} />
      <div className="p-7">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          searchKeys={['name', 'email', 'role']}
          filterKey="role"
          filterOptions={[
            { label: 'Adopter', value: 'adopter' },
            { label: 'Seller',  value: 'seller' },
            { label: 'Admin',   value: 'admin' },
          ]}
          title="All Users"
          rowKey="uid"
          onRowClick={setSelected}
          emptyIcon="👥"
          emptyText="No users found"
        />
      </div>

      {/* User detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details" wide>
        {selected && (
          <div>
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[#f0e8d5]">
              <Avatar src={selected.image} name={selected.name} size={64} />
              <div>
                <div className="font-display text-xl font-black">{selected.name}</div>
                <div className="text-sm text-[#543e35]">{selected.email}</div>
                <div className="flex gap-2 mt-2">
                  <Badge status={selected.role} />
                  {selected.adminStatus === 'terminated' && <Badge status="terminated" />}
                </div>
              </div>
            </div>
            <DetailRow label="UID"            value={selected.uid} />
            <DetailRow label="Role"           value={selected.role} badge />
            <DetailRow label="Status"         value={selected.adminStatus || 'active'} badge />
            <DetailRow label="Email Verified" value={selected.emailVerified ? '✓ Verified' : '✗ Not Verified'} />
            <DetailRow label="Pets Posted"    value={selected.petPostIds?.length || 0} />
            <DetailRow label="Pets Adopted"   value={selected.adoptedPets?.length || 0} />
            <DetailRow label="Favorites"      value={selected.favorites?.length || 0} />
            <DetailRow label="Joined"         value={fmtDate(selected.createdAt)} />
            {selected.adminStatus === 'terminated' && (
              <>
                <DetailRow label="Reason"     value={selected.adminDecision} />
                <DetailRow label="Decided At" value={fmtDate(selected.adminDecisionAt)} />
              </>
            )}
            <div className="flex gap-3 mt-6">
              {selected.adminStatus === 'terminated'
                ? <ActionBtn onClick={() => handleRestore(selected)} variant="success" loading={busy}>↩ Restore Account</ActionBtn>
                : <ActionBtn onClick={() => { openTerminate(selected); setSelected(null); }} variant="danger">🚫 Terminate</ActionBtn>
              }
            </div>
          </div>
        )}
      </Modal>

      {/* Termination reason modal */}
      <Modal open={reasonModal} onClose={() => { setReasonModal(false); setTermTarget(null); }} title="Terminate Account">
        {termTarget && (
          <div>
            <div className="flex items-center gap-3 mb-5 p-3.5 bg-red-50 rounded-xl border border-red-200">
              <Avatar src={termTarget.image} name={termTarget.name} size={40} />
              <div>
                <div className="font-bold text-sm">{termTarget.name}</div>
                <div className="text-xs text-[#543e35]">{termTarget.email}</div>
              </div>
            </div>

            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">
              Reason for Termination *
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Explain why this account is being terminated…"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold resize-none mb-4"
            />

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold mb-4">
              ⚠️ This will:
              <ul className="mt-1.5 ml-4 list-disc space-y-0.5">
                <li>Disable Firebase Auth login immediately</li>
                <li>Mark account as terminated in Firestore</li>
                <li>Send an in-app push notification to the user</li>
                <li>Send a termination email via Resend</li>
                <li>Redirect the user to the suspended screen if app is open</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setReasonModal(false); setTermTarget(null); }}
                className="px-5 py-2 rounded-full border border-[#f0e8d5] text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                disabled={busy || !reason.trim()}
                className="px-5 py-2 rounded-full bg-red-500 text-white text-sm font-bold disabled:opacity-50 hover:bg-red-600 transition-colors"
              >
                {busy ? 'Processing…' : '🚫 Terminate Account'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}