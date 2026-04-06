'use client';
// src/app/(admin)/admin/promo/page.tsx
// CHANGED: Removed EmailJS batch loop — email is now sent server-side via Resend
// The API route handles actual sending; page just shows progress from the response
import { useState } from 'react';
import { useRTPromos } from '@/hooks/useRealtime';
import { promoApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AdminTopbar } from '@/components/admin/AdminShared';
import DataTable, { Column } from '@/components/admin/DataTable';
import { fmtDate } from '@/utils';
import toast from 'react-hot-toast';

export default function PromoPage() {
  const { data: promos, loading } = useRTPromos();
  const { user: me } = useAuth();
  const [form, setForm] = useState({ subject: '', body: '', targetRole: 'all' });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ count: number; total: number } | null>(null);

  async function handleSend() {
    if (!form.subject || !form.body) { toast.error('Subject and body required.'); return; }
    if (!confirm(`Send promo email to all ${form.targetRole === 'all' ? 'users' : form.targetRole + 's'}?`)) return;

    setBusy(true);
    setResult(null);
    try {
      // Server handles all email sending via Resend
      const res: any = await promoApi.send({ ...form, sentBy: me?.uid });
      setResult({ count: res.count, total: res.total });
      toast.success(`Promo sent to ${res.count}/${res.total} users!`);
      setForm({ subject: '', body: '', targetRole: 'all' });
    } catch (e: any) {
      toast.error(e.message);
    }
    setBusy(false);
  }

  const columns: Column<any>[] = [
    { key: 'subject', label: 'Subject', sortable: true, render: (r) => <span className="font-bold text-sm">{r.subject}</span> },
    {
      key: 'targetRole', label: 'Target',
      render: (r) => (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 capitalize">
          {r.targetRole}
        </span>
      )
    },
    {
      key: 'sentCount', label: 'Sent', sortable: true,
      render: (r) => (
        <span className="font-bold text-sm">
          {r.sentCount ?? r.recipientCount}
          {r.recipientCount && r.sentCount !== undefined && r.sentCount < r.recipientCount
            ? <span className="text-xs text-amber-600 ml-1">/ {r.recipientCount}</span>
            : null}
        </span>
      )
    },
    { key: 'sentAt', label: 'Sent At', sortable: true, render: (r) => <span className="text-xs text-[#9B6E50]">{fmtDate(r.sentAt)}</span> },
  ];

  return (
    <div>
      <AdminTopbar title="Promo Emails" subtitle="Send promotional emails to users via Resend" />
      <div className="p-7 space-y-7">
        <div className="bg-white rounded-2xl p-6 border border-[#f0e8d5]">
          <div className="font-extrabold text-base mb-5">📣 Compose Promo Email</div>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Subject *</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Email subject…"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Target Audience</label>
                <select
                  value={form.targetRole}
                  onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
                  className="px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3]"
                >
                  <option value="all">All Users</option>
                  <option value="adopter">Adopters Only</option>
                  <option value="seller">Sellers Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Email Body *</label>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={6}
                placeholder="Write your promotional email content…"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold resize-none bg-[#fdf4e3]"
              />
            </div>

            {/* Email preview */}
            {form.subject && (
              <div className="border-2 border-[#f0e8d5] rounded-xl overflow-hidden">
                <div className="bg-primary px-5 py-3 font-black text-sm text-[#1b1a18]">🐾 FurrEver — {form.subject}</div>
                <div className="px-5 py-4 text-sm text-[#543e35] whitespace-pre-wrap bg-white">{form.body}</div>
                <div className="px-5 py-3 bg-[#fdf4e3] text-[10px] text-[#9B6E50]">FurrEver · Powered by Resend</div>
              </div>
            )}

            {/* Success result */}
            {result && (
              <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-green-700">
                ✓ Sent to {result.count} of {result.total} recipients
                {result.count < result.total && (
                  <span className="text-amber-600 ml-2">({result.total - result.count} failed — check Resend logs)</span>
                )}
              </div>
            )}

            {/* Sending state */}
            {busy && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Sending via Resend… this may take a moment for large lists.
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSend}
                disabled={busy || !form.subject || !form.body}
                className="flex items-center gap-2 bg-primary text-[#1b1a18] px-6 py-2.5 rounded-full font-extrabold text-sm shadow-[3px_3px_0_#d98b19] hover:shadow-[5px_5px_0_#d98b19] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {busy ? 'Sending…' : '📣 Send Promo Email'}
              </button>
            </div>
          </div>
        </div>

        <DataTable
          data={promos} columns={columns} loading={loading}
          searchKeys={['subject']} title="Promo History"
          emptyIcon="📣" emptyText="No promos sent yet"
        />
      </div>
    </div>
  );
}