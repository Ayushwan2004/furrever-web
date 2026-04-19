'use client';
// src/app/(admin)/admin/certifications/page.tsx
import { useState } from 'react';
import { useRTCertifications, useRTAdoptions, useRTUsers } from '@/hooks/useRealtime';
import { certsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AdminTopbar, Modal, Badge, DetailRow, ActionBtn, Avatar } from '@/components/admin/AdminShared';
import DataTable, { Column } from '@/components/admin/DataTable';
import { fmtDate } from '@/utils';
import toast from 'react-hot-toast';

const CERT_TYPES = ['adoption', 'foster', 'milestone'] as const;

export default function CertificationsPage() {
  const { data: certs,     loading: lc } = useRTCertifications();
  const { data: adoptions              } = useRTAdoptions();
  const { data: users                  } = useRTUsers();
  const { user: me } = useAuth();

  const [selected,     setSelected]     = useState<any>(null);
  const [issueModal,   setIssueModal]   = useState(false);
  const [busy,         setBusy]         = useState(false);
  const [existingCert, setExistingCert] = useState<any>(null);

  const [form, setForm] = useState({
    adopterId: '', adopterName: '', adopterEmail: '',
    petId: '', petName: '', petImage: '', breed: '', category: '', color: '', age: '',
    adoptionId: '', certType: 'adoption' as string, message: '', expiresAt: '',
  });

  async function prefillFromAdoption(a: any) {
    const u: any = users.find((u: any) => u.uid === a.adopterId || u.id === a.adopterId);
    setForm(f => ({
      ...f,
      adopterId:    a.adopterId,
      adopterName:  a.adopterName,
      adopterEmail: u?.email || '',
      petId:        a.petId,
      petName:      a.petName,
      petImage:     a.petImage || '',
      breed:        a.petBreed    || '',
      category:     a.petCategory || '',
      color:        a.petColor    || '',
      age:          String(a.petAge || ''),
      adoptionId:   a.id,
    }));
    try {
      const { db } = await import('@/lib/firebase/client');
      const { doc, getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'certificates', a.petId));
      setExistingCert(snap.exists() ? snap.data() : null);
    } catch { setExistingCert(null); }
  }

  async function handleIssue() {
    if (!form.adopterId || !form.petName) { toast.error('Select an adoption first.'); return; }
    setBusy(true);
    try {
      const result: any = await certsApi.issue({ ...form, issuedByName: me?.name || 'Admin' });

      // Send certificate email via API route (server-side nodemailer)
      const emailTarget = form.adopterEmail || result?.adopterEmail;
      if (emailTarget) {
        try {
          await fetch('/api/certifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail:   emailTarget,
              toName:    form.adopterName,
              petName:   form.petName,
              certId:    result.certId,
              certType:  form.certType,
              breed:     form.breed,
              issuedAt:  new Date().toLocaleDateString(),
              message:   form.message || 'Congratulations on your new companion!',
            }),
          });
        } catch (emailErr) {
          console.error('[Cert email]', emailErr);
          toast.error('Certificate issued but email failed.');
        }
      }

      toast.success(`${existingCert ? 'Reissued' : 'Issued'}: ${result.certId} (v${result.version})`);
      setIssueModal(false);
      setExistingCert(null);
      setForm({ adopterId:'', adopterName:'', adopterEmail:'', petId:'', petName:'', petImage:'', breed:'', category:'', color:'', age:'', adoptionId:'', certType:'adoption', message:'', expiresAt:'' });
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  }

  async function handleRevoke(cert: any) {
    if (!confirm(`Revoke certificate ${cert.serialCode || cert.certificateId}?`)) return;
    try { await certsApi.revoke(cert.petId); toast.success('Certificate revoked'); }
    catch (e: any) { toast.error(e.message); }
  }

  const approvedAdoptions = (adoptions as any[]).filter(a => a.status === 'approved');

  const columns: Column<any>[] = [
    { key: 'serialCode',   label: 'Serial Code',  render: (r) => <span className="font-mono text-xs font-bold text-primary">{r.serialCode || r.certificateId || '—'}</span> },
    { key: 'adopterName',  label: 'Adopter',       render: (r) => <div className="flex items-center gap-2"><Avatar name={r.adopterName} size={28} /><span className="font-bold text-sm">{r.adopterName}</span></div> },
    {
      key: 'petName', label: 'Pet',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#f0e8d5]">
            {r.petImage ? <img src={r.petImage} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-sm">🐾</div>}
          </div>
          <span className="font-semibold text-sm">{r.petName}</span>
        </div>
      ),
    },
    { key: 'certType',     label: 'Type',         render: (r) => <Badge status={r.certType || 'adoption'} /> },
    { key: 'status',       label: 'Status',        render: (r) => <Badge status={r.status || 'active'} /> },
    { key: 'version',      label: 'Ver.',          render: (r) => <span className="text-xs font-bold text-[#9B6E50]">v{r.version || 1}{r.issuedBy === 'system' ? ' 🤖' : ' 👤'}</span> },
    { key: 'breed',        label: 'Breed',         render: (r) => <span className="text-xs text-[#9B6E50]">{r.breed || '—'}</span> },
    { key: 'issuedAt',     label: 'Issued',        sortable: true, render: (r) => <span className="text-xs text-[#9B6E50]">{fmtDate(r.issuedAt)}</span> },
    { key: 'issuedByName', label: 'Issued By',     render: (r) => <span className="text-xs font-semibold">{r.issuedByName || (r.issuedBy === 'system' ? 'App' : 'Admin')}</span> },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <div className="flex gap-1.5">
          <ActionBtn onClick={() => setSelected(r)} variant="info">👁</ActionBtn>
          {r.status !== 'revoked' && <ActionBtn onClick={() => handleRevoke(r)} variant="danger">Revoke</ActionBtn>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminTopbar title="Certifications" subtitle={`${certs.length} issued — live`} />
      <div className="p-7">
        <DataTable
          data={certs} columns={columns} loading={lc}
          searchKeys={['adopterName', 'petName', 'serialCode', 'certType']}
          filterKey="status"
          filterOptions={[
            { label: 'Active',   value: 'active' },
            { label: 'Reissued', value: 'reissued' },
            { label: 'Revoked',  value: 'revoked' },
          ]}
          title="All Certificates"
          onRowClick={setSelected}
          emptyIcon="🏆" emptyText="No certificates issued yet"
          actions={
            <button onClick={() => setIssueModal(true)}
              className="flex items-center gap-2 bg-primary text-[#1b1a18] px-4 py-2 rounded-full text-xs font-extrabold shadow-[3px_3px_0_#d98b19] hover:shadow-[5px_5px_0_#d98b19] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
              🏆 Issue Certificate
            </button>
          }
        />
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Certificate Details" wide>
        {selected && (
          <div>
            <div className="bg-[#fdf4e3] border-2 border-primary/40 rounded-2xl p-6 mb-5 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-display text-xl font-black">Certificate of {selected.certType || 'Adoption'}</div>
              <div className="text-sm text-[#543e35] mt-1">Issued to <strong>{selected.adopterName}</strong></div>
              <div className="text-sm text-[#543e35]">For <strong>{selected.petName}</strong> · {selected.breed}</div>
              <div className="font-mono text-xs text-primary mt-2">{selected.serialCode || selected.certificateId}</div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge status={selected.status || 'active'} />
                <span className="text-xs text-[#9B6E50] font-bold">v{selected.version || 1}</span>
              </div>
            </div>
            <DetailRow label="Serial Code" value={selected.serialCode || selected.certificateId} />
            <DetailRow label="Adopter ID"  value={selected.adopterId} />
            <DetailRow label="Pet ID"      value={selected.petId} />
            <DetailRow label="Type"        value={selected.certType} />
            <DetailRow label="Breed"       value={selected.breed} />
            <DetailRow label="Category"    value={selected.category} />
            <DetailRow label="Color"       value={selected.color} />
            <DetailRow label="Version"     value={`v${selected.version || 1} · ${selected.issuedBy === 'system' ? 'Auto-generated by app' : `Admin: ${selected.issuedByName}`}`} />
            <DetailRow label="Issued At"   value={fmtDate(selected.issuedAt)} />
            <DetailRow label="Expires"     value={selected.expiresAt || 'Never'} />
            {selected.message && <div className="mt-4 p-4 bg-[#fdf4e3] rounded-xl text-sm italic text-[#543e35]">"{selected.message}"</div>}
          </div>
        )}
      </Modal>

      {/* Issue / Reissue modal */}
      <Modal open={issueModal} onClose={() => { setIssueModal(false); setExistingCert(null); }} title="Issue Certificate" wide>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Select Approved Adoption *</label>
            <select onChange={e => { const a = approvedAdoptions.find(a => a.id === e.target.value); if (a) prefillFromAdoption(a); }}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3]">
              <option value="">-- Select adoption --</option>
              {approvedAdoptions.map(a => <option key={a.id} value={a.id}>{a.petName} → {a.adopterName} ({fmtDate(a.createdAt)})</option>)}
            </select>
          </div>

          {form.petName && <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-700">✓ Pre-filled: {form.petName} → {form.adopterName} ({form.adopterEmail || 'no email'})</div>}
          {existingCert && <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-800">⚠️ App cert exists ({existingCert.serialCode}) · v{existingCert.version} · Issued {fmtDate(existingCert.issuedAt)}. Submitting reissues as <strong>v{existingCert.version + 1}</strong>.</div>}
          {form.petId && !existingCert && <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700">ℹ️ No existing cert — will create <strong>CERT-{form.petId}</strong> v1.</div>}

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Certificate Type</label>
            <div className="flex gap-2">
              {CERT_TYPES.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, certType: t }))}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${form.certType === t ? 'bg-primary border-primary text-[#1b1a18]' : 'border-[#f0e8d5] hover:border-primary/50'}`}>
                  {t === 'adoption' ? '🏠 Adoption' : t === 'foster' ? '💛 Foster' : '⭐ Milestone'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Personal Message</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={3} placeholder="A personal message for the adopter…"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold resize-none" />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Expiry Date (Optional)</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3]" />
          </div>

          {form.petName && (
            <div className="bg-[#fdf4e3] border-2 border-primary/30 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-display text-lg font-black">Certificate of {form.certType}</div>
              <div className="text-sm text-[#543e35] mt-1">Awarded to <strong>{form.adopterName}</strong></div>
              <div className="text-sm text-[#543e35]">For <strong>{form.petName}</strong> · {form.breed || 'Pet'}</div>
              {form.message && <p className="text-xs italic text-[#9B6E50] mt-2">"{form.message}"</p>}
              <div className="text-[10px] text-primary font-mono mt-2">
                {form.petId ? `CERT-${form.petId}` : 'CERT-…'} · {new Date().toLocaleDateString()}
                {existingCert && <span className="ml-2 text-amber-600 font-bold">→ v{existingCert.version + 1}</span>}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => { setIssueModal(false); setExistingCert(null); }} className="px-5 py-2 rounded-full border border-[#f0e8d5] text-sm font-bold">Cancel</button>
            <button onClick={handleIssue} disabled={busy || !form.petName}
              className="px-6 py-2 rounded-full bg-primary text-[#1b1a18] text-sm font-extrabold shadow-[3px_3px_0_#d98b19] hover:shadow-[5px_5px_0_#d98b19] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {busy ? 'Issuing…' : existingCert ? `🔄 Reissue (v${existingCert.version + 1})` : '🏆 Issue + Send Email'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}