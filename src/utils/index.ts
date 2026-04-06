// src/utils/index.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function fmtDate(v: any): string {
  if (!v) return '—';
  try {
    const d = typeof v === 'string' ? new Date(v) : v?.seconds ? new Date(v.seconds * 1000) : new Date(v);
    if (isNaN(d.getTime())) return '—';
    return format(d, 'dd MMM yyyy');
  } catch { return '—'; }
}

export function fmtRelative(v: any): string {
  if (!v) return '—';
  try {
    const d = typeof v === 'string' ? new Date(v) : v?.seconds ? new Date(v.seconds * 1000) : new Date(v);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch { return '—'; }
}

export function fmtDateTime(v: any): string {
  if (!v) return '—';
  try {
    const d = typeof v === 'string' ? new Date(v) : v?.seconds ? new Date(v.seconds * 1000) : new Date(v);
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch { return '—'; }
}

export function truncate(s: string, n = 40) { return s?.length > n ? s.slice(0, n) + '…' : s || '—'; }

export function statusColor(status: string) {
  const m: Record<string,string> = {
    available:  'bg-green-100 text-green-700 border-green-300',
    sold:       'bg-blue-100 text-blue-700 border-blue-300',
    pending:    'bg-amber-100 text-amber-700 border-amber-300',
    approved:   'bg-green-100 text-green-700 border-green-300',
    rejected:   'bg-red-100 text-red-600 border-red-200',
    cancelled:  'bg-gray-100 text-gray-500 border-gray-200',
    admin:      'bg-amber-100 text-amber-800 border-amber-300',
    seller:     'bg-blue-100 text-blue-700 border-blue-200',
    adopter:    'bg-gray-100 text-gray-600 border-gray-200',
    issued:     'bg-green-100 text-green-700 border-green-300',
    revoked:    'bg-red-100 text-red-600 border-red-200',
    terminated: 'bg-red-100 text-red-700 border-red-300',
    active:     'bg-green-100 text-green-700 border-green-300',
    suspended:  'bg-orange-100 text-orange-700 border-orange-300',
    accepted:   'bg-green-100 text-green-700 border-green-300',
    expired:    'bg-gray-100 text-gray-500 border-gray-200',
  };
  return m[status] || 'bg-gray-100 text-gray-500';
}
