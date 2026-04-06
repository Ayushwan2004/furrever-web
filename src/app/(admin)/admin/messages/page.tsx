'use client';
// src/app/(admin)/admin/messages/page.tsx
import { useState } from 'react';
import { useRTContacts } from '@/hooks/useRealtime';
import { contactsApi } from '@/lib/api';
import { AdminTopbar, Modal, DetailRow, ActionBtn } from '@/components/admin/AdminShared';
import DataTable, { Column } from '@/components/admin/DataTable';
import { fmtDate, truncate } from '@/utils';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { data: contacts, loading } = useRTContacts();
  const [selected, setSelected] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm('Delete this message?')) return;
    try {
      await contactsApi.delete(id);
      toast.success('Message deleted'); setSelected(null);
    } catch (e:any) { toast.error(e.message); }
  }

  async function handleMarkRead(id: string) {
    try {
      await contactsApi.markRead(id);
      toast.success('Marked as read');
    } catch (e:any) { toast.error(e.message); }
  }

  const columns: Column<any>[] = [
    { key:'read', label:'', render:(r)=>!r.read?<span className="w-2 h-2 rounded-full bg-primary block mx-auto"/>:null, width:'30px' },
    { key:'name', label:'Sender', sortable:true,
      render:(r)=><div><div className="font-bold text-sm">{r.name}</div><div className="text-[10px] text-[#9B6E50]">{r.email}</div></div>
    },
    { key:'subject', label:'Subject', sortable:true, render:(r)=><span className={`text-sm ${!r.read?'font-extrabold':'font-semibold'}`}>{r.subject}</span> },
    { key:'message', label:'Preview', render:(r)=><span className="text-xs text-[#9B6E50]">{truncate(r.message,60)}</span> },
    { key:'createdAt', label:'Received', sortable:true, render:(r)=><span className="text-xs text-[#9B6E50]">{fmtDate(r.createdAt)}</span> },
    { key:'read', label:'Status', render:(r)=>r.read?<span className="text-[10px] text-green-600 font-bold">✓ Read</span>:<span className="text-[10px] text-amber-600 font-bold">● Unread</span> },
    {
      key:'actions', label:'Actions',
      render:(r)=>(
        <div className="flex gap-1.5">
          <ActionBtn onClick={()=>setSelected(r)} variant="info">👁 View</ActionBtn>
          {!r.read && <ActionBtn onClick={()=>handleMarkRead(r.id)} variant="success">✓ Read</ActionBtn>}
          <ActionBtn onClick={()=>handleDelete(r.id)} variant="danger">🗑</ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminTopbar title="Messages" subtitle={`${(contacts as any[]).filter(c=>!c.read).length} unread — live`}/>
      <div className="p-7">
        <DataTable
          data={contacts}
          columns={columns}
          loading={loading}
          searchKeys={['name','email','subject','message']}
          filterKey="read"
          filterOptions={[{label:'Unread', value: false as any},{label:'Read', value: true as any}]}
          title="Contact Messages"
          onRowClick={(r)=>{setSelected(r);if(!r.read)handleMarkRead(r.id);}}
          emptyIcon="📬" emptyText="No messages"
        />
      </div>
      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Message Details">
        {selected && (
          <div>
            <DetailRow label="From"    value={selected.name}/>
            <DetailRow label="Email"   value={selected.email}/>
            <DetailRow label="Subject" value={selected.subject}/>
            <DetailRow label="Date"    value={fmtDate(selected.createdAt)}/>
            <div className="mt-4 p-4 bg-[#fdf4e3] rounded-xl text-sm text-[#543e35] leading-relaxed border border-[#f0e8d5]">
              {selected.message}
            </div>
            <div className="mt-5 flex gap-3">
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary rounded-full text-sm font-bold text-[#1b1a18]">
                ✉️ Reply
              </a>
              <ActionBtn onClick={()=>handleDelete(selected.id)} variant="danger">🗑 Delete</ActionBtn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
