'use client';
// src/components/admin/AdminShared.tsx
import { cn, fmtDate, fmtRelative, statusColor } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

// ── Topbar ──────────────────────────────────────
export function AdminTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-white border-b border-[#f0e8d5] px-7 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="font-display font-black text-xl">{title}</h1>
        {subtitle && <p className="text-xs text-[#9B6E50] font-semibold mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-green-50 border border-green-300 px-3 py-1.5 rounded-full text-xs font-bold text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>Live Firestore
        </div>
      </div>
    </div>
  );
}

// ── Metric Card ──────────────────────────────────
export function MetricCard({ icon, label, value, change, color = '#f4a900', pct = 0 }: {
  icon: string; label: string; value: number | string; change?: string; color?: string; pct?: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#f0e8d5] relative overflow-hidden">
      <div className="absolute right-1 bottom-1 text-[60px] opacity-[.04] leading-none pointer-events-none select-none">{icon}</div>
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#9B6E50] mb-2">{label}</div>
      <div className="font-display text-3xl font-black leading-none mb-2">{value}</div>
      {change && <div className="text-[11px] font-bold text-green-600 mb-3">↑ {change}</div>}
      <div className="h-1 bg-[#f0e8d5] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{width:`${pct}%`,background:color}}/>
      </div>
    </div>
  );
}

// ── Badge ────────────────────────────────────────
export function Badge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border', statusColor(status))}>
      {status}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────
export function Avatar({ src, name, size = 32 }: { src?: string | null; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{width:size,height:size}}/>;
  return (
    <div className="rounded-full flex items-center justify-center font-black text-[#1b1a18] flex-shrink-0"
         style={{width:size,height:size,background:'#f4a900',fontSize:size*.38}}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

// ── Modal ────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }:
  { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
          style={{background:'rgba(27,26,24,.55)',backdropFilter:'blur(5px)'}}>
          <motion.div initial={{opacity:0,scale:.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.96,y:8}}
            transition={{duration:.25,ease:[.16,1,.3,1]}}
            className={cn('bg-white rounded-2xl shadow-2xl overflow-hidden relative',wide?'w-full max-w-[740px]':'w-full max-w-[520px]')}
            style={{maxHeight:'88vh',display:'flex',flexDirection:'column'}}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e8d5] flex-shrink-0">
              <h3 className="font-display font-black text-lg">{title}</h3>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#fdf4e3] flex items-center justify-center hover:bg-[#f0e8d5] transition-colors text-sm font-bold">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
          </motion.div>
          <div className="absolute inset-0 -z-[1]" onClick={onClose}/>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Confirm Dialog ───────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, danger }:
  { open: boolean; onClose: ()=>void; onConfirm: ()=>void; title: string; message: string; danger?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[#543e35] leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-5 py-2 rounded-full border border-[#f0e8d5] text-sm font-bold hover:bg-[#fdf4e3] transition-all">Cancel</button>
        <button onClick={()=>{onConfirm();onClose();}}
          className={cn('px-5 py-2 rounded-full text-sm font-bold transition-all',
            danger?'bg-red-500 text-white hover:bg-red-600':'bg-primary text-[#1b1a18] hover:brightness-95')}>
          Confirm
        </button>
      </div>
    </Modal>
  );
}

// ── Action Buttons ───────────────────────────────
export function ActionBtn({ onClick, variant='info', children, loading }:
  { onClick: ()=>void; variant?: 'info'|'danger'|'success'|'default'|'primary'; children: React.ReactNode; loading?: boolean }) {
  const styles = {
    info:    'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    danger:  'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
    success: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    default: 'bg-[#f0e8d5] text-[#543e35] border-[#e5ddc8] hover:bg-[#e5ddc8]',
    primary: 'bg-primary text-[#1b1a18] border-primary/50 hover:brightness-95',
  };
  return (
    <button onClick={onClick} disabled={loading}
      className={cn('px-2.5 py-1 rounded-lg border text-xs font-bold transition-all disabled:opacity-50', styles[variant])}>
      {loading ? '…' : children}
    </button>
  );
}

// ── Detail Row ───────────────────────────────────
export function DetailRow({ label, value, badge }: { label: string; value: any; badge?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-[#f0e8d5] last:border-0">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9B6E50] w-[120px] flex-shrink-0 mt-0.5">{label}</span>
      {badge && typeof value === 'string' ? <Badge status={value}/> :
        <span className="text-sm font-semibold text-[#1b1a18] break-all">{value || '—'}</span>}
    </div>
  );
}
