'use client';
// src/app/(admin)/admin/notifications/page.tsx
import { useState } from 'react';
import { useRTNotifications } from '@/hooks/useRealtime';
import { notificationsApi } from '@/lib/api';
import { AdminTopbar, ActionBtn } from '@/components/admin/AdminShared';
import DataTable, { Column } from '@/components/admin/DataTable';
import { fmtRelative } from '@/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { data: notifications, loading } = useRTNotifications();
  const [form, setForm] = useState({ title:'', message:'', receiverId:'ALL', type:'broadcast' });
  const [busy, setBusy] = useState(false);

  const broadcasts = (notifications as any[]).filter(n => n.receiverId === 'ALL' || n.type === 'broadcast');

  async function handleSend() {
    if (!form.title || !form.message) { toast.error('Title and message required.'); return; }
    setBusy(true);
    try {
      await notificationsApi.send(form);
      toast.success('Notification sent to all users!');
      setForm({ title:'', message:'', receiverId:'ALL', type:'broadcast' });
    } catch (e:any) { toast.error(e.message); }
    setBusy(false);
  }

  const columns: Column<any>[] = [
    { key:'title',   label:'Title',   sortable:true, render:(r)=><span className="font-bold text-sm">{r.title}</span> },
    { key:'message', label:'Message', render:(r)=><span className="text-xs text-[#9B6E50]">{r.message?.slice(0,70)}…</span> },
    { key:'type',    label:'Type',    render:(r)=><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">{r.type||'broadcast'}</span> },
    { key:'receiverId', label:'Target', render:(r)=><span className="text-xs font-mono">{r.receiverId==='ALL'?'📢 All Users':r.receiverId}</span> },
    { key:'createdAt', label:'Sent', sortable:true, render:(r)=><span className="text-xs text-[#9B6E50]">{fmtRelative(r.createdAt)}</span> },
  ];

  return (
    <div>
      <AdminTopbar title="Push Notifications" subtitle="Broadcast to all app users"/>
      <div className="p-7 space-y-7">
        {/* Compose */}
        <div className="bg-white rounded-2xl p-6 border border-[#f0e8d5]">
          <div className="font-extrabold text-base mb-5">📢 Send New Notification</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Title *</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Notification title…"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3]"/>
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Target</label>
              <select value={form.receiverId} onChange={e=>setForm(f=>({...f,receiverId:e.target.value}))}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3]">
                <option value="ALL">📢 All Users</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Message *</label>
              <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} rows={3} placeholder="Notification message…"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold resize-none bg-[#fdf4e3]"/>
            </div>
          </div>
          {/* Preview */}
          {form.title && (
            <div className="mt-4 p-4 bg-[#1b1a18] rounded-xl text-white text-xs font-semibold flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-lg flex-shrink-0">🐾</div>
              <div><div className="font-black text-sm">{form.title}</div><div className="text-white/60 mt-0.5">{form.message}</div></div>
            </div>
          )}
          <div className="mt-5 flex justify-end">
            <button onClick={handleSend} disabled={busy||!form.title||!form.message}
              className="flex items-center gap-2 bg-primary text-[#1b1a18] px-6 py-2.5 rounded-full font-extrabold text-sm shadow-[3px_3px_0_#d98b19] hover:shadow-[5px_5px_0_#d98b19] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {busy?'Sending…':'📢 Send to All Users'}
            </button>
          </div>
        </div>

        {/* History */}
        <DataTable data={broadcasts} columns={columns} loading={loading}
          searchKeys={['title','message']} title="Broadcast History"
          emptyIcon="🔔" emptyText="No broadcasts sent yet"/>
      </div>
    </div>
  );
}
