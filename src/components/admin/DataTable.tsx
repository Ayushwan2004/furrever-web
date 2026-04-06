'use client';
// src/components/admin/DataTable.tsx
// Reusable table with search, filter chips, sort — used across all admin pages
import { useState, useMemo } from 'react';
import { cn, fmtDate, statusColor } from '@/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface Props<T extends Record<string,any>> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchKeys?: string[];
  filterKey?: string;
  filterOptions?: { label: string; value: string }[];
  title?: string;
  actions?: React.ReactNode;
  rowKey?: string;
  onRowClick?: (row: T) => void;
  emptyIcon?: string;
  emptyText?: string;
}

export default function DataTable<T extends Record<string,any>>({
  data, columns, loading, searchKeys = [], filterKey, filterOptions,
  title, actions, rowKey = 'id', onRowClick, emptyIcon = '📋', emptyText = 'No records found',
}: Props<T>) {
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [sortKey,  setSortKey]  = useState<string | null>(null);
  const [sortDir,  setSortDir]  = useState<'asc'|'desc'>('desc');
  const [page,     setPage]     = useState(0);
  const PER_PAGE = 20;

  const processed = useMemo(() => {
    let rows = [...data];
    // Search
    if (search && searchKeys.length) {
      const q = search.toLowerCase();
      rows = rows.filter(r => searchKeys.some(k => String(r[k] || '').toLowerCase().includes(q)));
    }
    // Filter
    if (filter !== 'all' && filterKey) {
      rows = rows.filter(r => r[filterKey] === filter);
    }
    // Sort
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1; if (bv == null) return -1;
        const cmp = typeof av === 'string' ? av.localeCompare(bv) : av > bv ? 1 : -1;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, filter, sortKey, sortDir, searchKeys, filterKey]);

  const paged    = processed.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const pages    = Math.ceil(processed.length / PER_PAGE);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  }

  if (loading) return (
    <div className="bg-white rounded-2xl border border-[#f0e8d5] overflow-hidden">
      {[...Array(6)].map((_,i) => (
        <div key={i} className={`h-14 border-b border-[#f0e8d5] skeleton ${i===0?'h-12':''}`}/>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-[#f0e8d5] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#f0e8d5] flex flex-wrap items-center gap-3">
        {title && <div className="font-extrabold text-base flex-1">{title} <span className="text-xs font-semibold text-[#9B6E50] ml-1">({processed.length})</span></div>}
        {/* Search */}
        {searchKeys.length > 0 && (
          <div className="relative">
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}
              placeholder="Search…"
              className="pl-8 pr-3 py-2 text-xs font-semibold rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none bg-[#fdf4e3] w-[200px] transition-all"/>
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B6E50] text-sm">🔍</span>
          </div>
        )}
        {actions}
      </div>
      {/* Filter chips */}
      {filterOptions && (
        <div className="px-5 py-3 border-b border-[#f0e8d5] flex gap-2 flex-wrap">
          <button onClick={()=>{setFilter('all');setPage(0);}}
            className={cn('px-3 py-1.5 rounded-full text-xs font-bold border transition-all', filter==='all'?'bg-primary border-primary text-[#1b1a18]':'bg-white border-[#f0e8d5] text-[#543e35] hover:border-primary/50')}>
            All ({data.length})
          </button>
          {filterOptions.map(o => (
            <button key={o.value} onClick={()=>{setFilter(o.value);setPage(0);}}
              className={cn('px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                filter===o.value?'bg-primary border-primary text-[#1b1a18]':'bg-white border-[#f0e8d5] text-[#543e35] hover:border-primary/50')}>
              {o.label} ({data.filter(r=>r[filterKey!]===o.value).length})
            </button>
          ))}
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full atbl">
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} style={c.width?{width:c.width}:{}}
                  onClick={()=>c.sortable&&toggleSort(c.key)}
                  className={cn(c.sortable && 'cursor-none hover:bg-[#ede5d4] select-none')}>
                  <span className="flex items-center gap-1">
                    {c.label}
                    {c.sortable && (
                      <span className="text-[10px]">
                        {sortKey===c.key ? (sortDir==='asc'?'↑':'↓') : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="py-16 text-center">
                <div className="text-4xl mb-3 opacity-30">{emptyIcon}</div>
                <div className="font-bold text-[#9B6E50] text-sm">{emptyText}</div>
                {search && <div className="text-xs text-[#9B6E50] mt-1">Try adjusting your search</div>}
              </td></tr>
            ) : paged.map((row, i) => (
              <tr key={row[rowKey] || i} onClick={()=>onRowClick?.(row)}
                className={cn(onRowClick && 'cursor-none')}>
                {columns.map(c => (
                  <td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? '—')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pages > 1 && (
        <div className="px-5 py-3 border-t border-[#f0e8d5] flex items-center justify-between text-xs font-semibold text-[#9B6E50]">
          <span>Showing {page*PER_PAGE+1}–{Math.min((page+1)*PER_PAGE,processed.length)} of {processed.length}</span>
          <div className="flex gap-1.5">
            <button disabled={page===0} onClick={()=>setPage(p=>p-1)}
              className="px-3 py-1.5 rounded-lg border border-[#f0e8d5] disabled:opacity-40 hover:border-primary transition-all">← Prev</button>
            {Array.from({length:Math.min(pages,5)},(_,i)=>i+Math.max(0,page-2)).filter(i=>i<pages).map(i=>(
              <button key={i} onClick={()=>setPage(i)}
                className={cn('w-8 h-7 rounded-lg border transition-all font-bold text-xs',i===page?'bg-primary border-primary text-[#1b1a18]':'border-[#f0e8d5] hover:border-primary')}>
                {i+1}
              </button>
            ))}
            <button disabled={page===pages-1} onClick={()=>setPage(p=>p+1)}
              className="px-3 py-1.5 rounded-lg border border-[#f0e8d5] disabled:opacity-40 hover:border-primary transition-all">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
