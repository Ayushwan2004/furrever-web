'use client';
// src/app/(admin)/admin/adoptions/page.tsx
import { useState } from 'react';
import { useRTAdoptions } from '@/hooks/useRealtime';
import { adoptionsApi } from '@/lib/api';
import { emailService } from '@/lib/email';
import { useAuth } from '@/context/AuthContext';
import { AdminTopbar, Modal, Badge, DetailRow, ActionBtn } from '@/components/admin/AdminShared';
import DataTable, { Column } from '@/components/admin/DataTable';
import { fmtDate, fmtRelative, truncate } from '@/utils';
import toast from 'react-hot-toast';

export default function AdoptionsPage() {
  const { data: adoptions, loading } = useRTAdoptions();
  const { user: me } = useAuth();
  const [selected, setSelected] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [actionTarget, setActionTarget] = useState<{id:string;petId:string;action:string;name:string}|null>(null);
  const [reason, setReason] = useState('');
  const [actionModal, setActionModal] = useState(false);

  async function handleAction() {
    if (!actionTarget) return;
    setBusy(true);
    try {
      if (actionTarget.action === 'cancel') {
        await adoptionsApi.cancel(actionTarget.id, reason || 'Cancelled by admin');
        toast.success('Adoption cancelled');
      } else {
        const res:any = await adoptionsApi.updateStatus(actionTarget.id, actionTarget.petId, actionTarget.action);
        // Send email decision
        if (res?.adopterEmail) {
          try {
            await emailService.decision(
              res.adopterEmail, res.adopterName,
              actionTarget.action === 'approved' ? 'Approved 🎉' : 'Rejected',
              res.petName,
              reason || `Your adoption request was ${actionTarget.action}`,
            );
          } catch {}
        }
        toast.success(`Adoption ${actionTarget.action}!`);
      }
      setActionModal(false); setActionTarget(null); setReason(''); setSelected(null);
    } catch (e:any) { toast.error(e.message); }
    setBusy(false);
  }

  function openAction(row: any, action: string) {
    setActionTarget({ id: row.id, petId: row.petId, action, name: `${row.adopterName} → ${row.petName}` });
    setReason('');
    setActionModal(true);
  }

  const columns: Column<any>[] = [
    {
      key:'petName', label:'Pet', sortable:true,
      render:(r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#f0e8d5] flex-shrink-0">
            {r.petImage ? <img src={r.petImage} className="w-full h-full object-cover" alt={r.petName}/> : <div className="w-full h-full flex items-center justify-center text-lg">🐾</div>}
          </div>
          <div>
            <div className="font-bold text-sm">{r.petName}</div>
            <div className="text-[10px] text-[#9B6E50]">{r.petBreed||'—'}</div>
          </div>
        </div>
      ),
    },
    { key:'adopterName', label:'Adopter', sortable:true, render:(r)=>(
      <div><div className="font-bold text-sm">{r.adopterName}</div><div className="text-[10px] text-[#9B6E50] font-mono">{truncate(r.adopterId,14)}</div></div>
    )},
    { key:'status', label:'Status', sortable:true, render:(r)=><Badge status={r.status}/> },
    { key:'isRead',  label:'Read', render:(r)=>r.isRead?<span className="text-[10px] text-green-600 font-bold">✓ Read</span>:<span className="text-[10px] text-amber-500 font-bold">● New</span> },
    { key:'petCategory', label:'Category', render:(r)=><span className="text-xs">{r.petCategory||'—'}</span> },
    { key:'createdAt', label:'Applied', sortable:true, render:(r)=><span className="text-xs text-[#9B6E50]">{fmtDate(r.createdAt)}</span> },
    { key:'updatedAt', label:'Updated',  sortable:true, render:(r)=><span className="text-xs text-[#9B6E50]">{r.updatedAt ? fmtRelative(r.updatedAt) : '—'}</span> },
    { key:'adminDecision', label:'Admin Note', render:(r)=>r.adminDecision?<span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">📋 {truncate(r.adminDecision,28)}</span>:null },
    {
      key:'actions', label:'Actions',
      render:(r) => (
        <div className="flex gap-1.5 flex-wrap">
          <ActionBtn onClick={()=>setSelected(r)} variant="info">👁</ActionBtn>
          {r.status === 'pending' && <>
            <ActionBtn onClick={()=>openAction(r,'approved')} variant="success">✓ Approve</ActionBtn>
            <ActionBtn onClick={()=>openAction(r,'rejected')} variant="danger">✗ Reject</ActionBtn>
          </>}
          {['pending','approved'].includes(r.status) && (
            <ActionBtn onClick={()=>openAction(r,'cancel')} variant="default">⊘ Cancel</ActionBtn>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminTopbar title="Adoptions" subtitle={`${adoptions.length} total · live`}/>
      <div className="p-7">
        <DataTable
          data={adoptions}
          columns={columns}
          loading={loading}
          searchKeys={['petName','adopterName','adopterId','ownerId']}
          filterKey="status"
          filterOptions={[{label:'Pending',value:'pending'},{label:'Approved',value:'approved'},{label:'Rejected',value:'rejected'},{label:'Cancelled',value:'cancelled'}]}
          title="All Adoptions"
          onRowClick={setSelected}
          emptyIcon="🤝" emptyText="No adoption applications"
        />
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Adoption Details" wide>
        {selected && (
          <div>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#f0e8d5]">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f0e8d5]">
                {selected.petImage ? <img src={selected.petImage} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>}
              </div>
              <div>
                <div className="font-display text-xl font-black">{selected.petName}</div>
                <div className="text-sm text-[#543e35]">Adopter: {selected.adopterName}</div>
                <Badge status={selected.status}/>
              </div>
            </div>
            <DetailRow label="Application ID" value={selected.id}/>
            <DetailRow label="Pet ID"          value={selected.petId}/>
            <DetailRow label="Adopter ID"      value={selected.adopterId}/>
            <DetailRow label="Owner ID"        value={selected.ownerId}/>
            <DetailRow label="Status"          value={selected.status} badge/>
            <DetailRow label="Pet Breed"       value={selected.petBreed}/>
            <DetailRow label="Pet Category"    value={selected.petCategory}/>
            <DetailRow label="Pet Color"       value={selected.petColor}/>
            <DetailRow label="Pet Age"         value={selected.petAge}/>
            <DetailRow label="Applied"         value={fmtDate(selected.createdAt)}/>
            <DetailRow label="Updated"         value={fmtDate(selected.updatedAt)}/>
            {selected.rejectionReason && <DetailRow label="Rejection Reason" value={selected.rejectionReason}/>}
            {selected.adminDecision && <><DetailRow label="Admin Decision" value={selected.adminDecision}/><DetailRow label="Decision By" value={selected.adminDecisionBy}/></>}
            <div className="flex gap-3 mt-6">
              {selected.status === 'pending' && <>
                <ActionBtn onClick={()=>{openAction(selected,'approved');setSelected(null);}} variant="success">✓ Approve</ActionBtn>
                <ActionBtn onClick={()=>{openAction(selected,'rejected');setSelected(null);}} variant="danger">✗ Reject</ActionBtn>
              </>}
              {['pending','approved'].includes(selected.status) && (
                <ActionBtn onClick={()=>{openAction(selected,'cancel');setSelected(null);}} variant="default">⊘ Cancel</ActionBtn>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Action modal */}
      <Modal open={actionModal} onClose={()=>{setActionModal(false);setActionTarget(null);}} title={`${actionTarget?.action === 'cancel' ? 'Cancel' : actionTarget?.action === 'approved' ? 'Approve' : 'Reject'} Adoption`}>
        {actionTarget && (
          <div>
            <p className="text-sm text-[#543e35] mb-4"><strong>{actionTarget.name}</strong></p>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Admin Note / Reason</label>
            <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3}
              placeholder="Optional note…"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold resize-none mb-4"/>
            <p className="text-xs text-[#9B6E50] mb-4">This will be recorded in Firestore and an email notification will be sent to the adopter.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={()=>{setActionModal(false);setActionTarget(null);}} className="px-5 py-2 rounded-full border border-[#f0e8d5] text-sm font-bold">Cancel</button>
              <button onClick={handleAction} disabled={busy}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-50
                  ${actionTarget.action==='approved'?'bg-green-500 text-white':actionTarget.action==='rejected'?'bg-red-500 text-white':'bg-[#1b1a18] text-white'}`}>
                {busy ? 'Processing…' : `Confirm ${actionTarget.action}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
