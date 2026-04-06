'use client';
// src/app/(admin)/admin/pets/page.tsx
import { useState } from 'react';
import { useRTPets } from '@/hooks/useRealtime';
import { petsApi } from '@/lib/api';
import { emailService } from '@/lib/email';
import { AdminTopbar, Modal, Badge, Avatar, DetailRow, ActionBtn } from '@/components/admin/AdminShared';
import DataTable, { Column } from '@/components/admin/DataTable';
import { fmtDate, truncate } from '@/utils';
import toast from 'react-hot-toast';

export default function PetsPage() {
  const { data: pets, loading } = useRTPets();
  const [selected, setSelected] = useState<any>(null);
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [reasonModal, setReasonModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const columns: Column<any>[] = [
    {
      key:'name', label:'Pet', sortable:true,
      render:(r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#f0e8d5] flex-shrink-0">
            {r.image
              ? <img src={r.image} alt={r.name} className="w-full h-full object-cover"/>
              : <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
            }
          </div>
          <div>
            <div className="font-bold text-sm">{r.name}</div>
            <div className="text-[10px] text-[#9B6E50]">{r.breed}</div>
          </div>
        </div>
      ),
    },
    { key:'category', label:'Category', sortable:true, render:(r)=><span className="text-sm font-semibold capitalize">{r.category}</span> },
    { key:'status',   label:'Status',   sortable:true, render:(r)=><Badge status={r.status}/> },
    { key:'age',      label:'Age',      sortable:true, render:(r)=><span className="text-sm">{r.age ? `${r.age} yr${r.age>1?'s':''}` : '—'}</span> },
    { key:'favoredBy',label:'Favorites',sortable:true, render:(r)=><span className="font-bold text-sm">❤️ {r.favoredBy?.length || 0}</span> },
    { key:'ownerId',  label:'Owner ID', render:(r)=><span className="font-mono text-[10px] text-[#9B6E50]">{truncate(r.ownerId, 14)}</span> },
    { key:'createdAt',label:'Listed',   sortable:true, render:(r)=><span className="text-xs text-[#9B6E50]">{fmtDate(r.createdAt)}</span> },
    { key:'adminRemoved',label:'Admin Flag', render:(r)=>r.adminRemoved?<span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">🚫 Removed</span>:null },
    {
      key:'actions', label:'Actions',
      render:(r) => (
        <div className="flex gap-1.5">
          <ActionBtn onClick={()=>setSelected(r)} variant="info">👁 View</ActionBtn>
          <ActionBtn onClick={()=>{setRemoveTarget(r);setReasonModal(true);setReason('');}} variant="danger">🗑 Remove</ActionBtn>
        </div>
      ),
    },
  ];

  async function handleRemove() {
    if (!removeTarget || !reason.trim()) { toast.error('Please enter a reason.'); return; }
    setBusy(true);
    try {
      const result: any = await petsApi.remove(removeTarget.id, reason);
      // Send email to pet owner notifying them of the removal
      if (result?.ownerEmail) {
        try {
          await emailService.petRemoved(
            result.ownerEmail,
            result.ownerName || 'Pet Owner',
            result.petName   || removeTarget.name,
            reason,
          );
        } catch (emailErr) {
          console.warn('[Pets] Email send failed (non-critical):', emailErr);
        }
      }
      toast.success(`Pet removed: ${removeTarget.name}`);
      setReasonModal(false); setRemoveTarget(null); setReason('');
    } catch (e:any) { toast.error(e.message); }
    setBusy(false);
  }

  return (
    <div>
      <AdminTopbar title="Pets" subtitle={`${pets.length} active pets — live`}/>
      <div className="p-7">
        <DataTable
          data={pets}
          columns={columns}
          loading={loading}
          searchKeys={['name','breed','category','ownerId']}
          filterKey="status"
          filterOptions={[{label:'Available',value:'available'},{label:'Sold',value:'sold'}]}
          title="All Pets"
          onRowClick={setSelected}
          emptyIcon="🐾"
          emptyText="No pets found"
        />
      </div>

      {/* Pet detail */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Pet Details" wide>
        {selected && (
          <div>
            <div className="mb-5">
              {selected.image
                ? <img src={selected.image} alt={selected.name} className="w-full h-48 object-cover rounded-xl mb-4"/>
                : <div className="w-full h-48 bg-[#f0e8d5] rounded-xl flex items-center justify-center text-5xl mb-4">🐾</div>
              }
              <div className="font-display text-2xl font-black">{selected.name}</div>
              <div className="flex gap-2 mt-2"><Badge status={selected.status}/> {selected.adminRemoved && <Badge status="terminated"/>}</div>
            </div>
            <DetailRow label="Category"  value={selected.category}/>
            <DetailRow label="Breed"     value={selected.breed}/>
            <DetailRow label="Coat Color"value={selected.coatcolor}/>
            <DetailRow label="Age"       value={selected.age ? `${selected.age} years` : '—'}/>
            <DetailRow label="Address"   value={selected.address}/>
            <DetailRow label="Owner ID"  value={selected.ownerId}/>
            <DetailRow label="Status"    value={selected.status}    badge/>
            <DetailRow label="Favorites" value={selected.favoredBy?.length || 0}/>
            <DetailRow label="Listed"    value={fmtDate(selected.createdAt)}/>
            {selected.adminRemoved && (
              <>
                <DetailRow label="Admin Decision" value={selected.adminRemovedReason}/>
                <DetailRow label="Removed At"     value={fmtDate(selected.adminRemovedAt)}/>
              </>
            )}
            {selected.description && (
              <div className="mt-4 p-4 bg-[#fdf4e3] rounded-xl text-sm text-[#543e35]">{selected.description}</div>
            )}
          </div>
        )}
      </Modal>

      {/* Remove reason modal */}
      <Modal open={reasonModal} onClose={()=>{setReasonModal(false);setRemoveTarget(null);}} title="Remove Pet">
        {removeTarget && (
          <div>
            <div className="flex items-center gap-3 mb-5 p-3.5 bg-red-50 rounded-xl border border-red-200">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f0e8d5] flex-shrink-0">
                {removeTarget.image ? <img src={removeTarget.image} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-lg">🐾</div>}
              </div>
              <div><div className="font-bold text-sm">{removeTarget.name}</div><div className="text-xs text-[#543e35]">{removeTarget.breed} · {removeTarget.category}</div></div>
            </div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Reason for Removal *</label>
            <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3}
              placeholder="Why is this pet listing being removed?"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold resize-none mb-4"/>
            <p className="text-xs text-[#9B6E50] mb-4">This soft-deletes the pet (sets isDeleted:true) and records admin decision in Firestore.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={()=>{setReasonModal(false);setRemoveTarget(null);}} className="px-5 py-2 rounded-full border border-[#f0e8d5] text-sm font-bold">Cancel</button>
              <button onClick={handleRemove} disabled={busy||!reason.trim()}
                className="px-5 py-2 rounded-full bg-red-500 text-white text-sm font-bold disabled:opacity-50">
                {busy?'Removing…':'🗑 Remove Pet'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}