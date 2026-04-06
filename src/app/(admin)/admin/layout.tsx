'use client';
// src/app/(admin)/admin/layout.tsx
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href:'/admin/dashboard',       icon:'📊', label:'Dashboard',       section:'Overview' },
  { href:'/admin/pets',            icon:'🐾', label:'Pets',            section:'Management' },
  { href:'/admin/users',           icon:'👥', label:'Users',           section:'Management' },
  { href:'/admin/adoptions',       icon:'🤝', label:'Adoptions',       section:'Management' },
  { href:'/admin/certifications',  icon:'🏆', label:'Certifications',  section:'Management' },
  { href:'/admin/messages',        icon:'📬', label:'Messages',        section:'Management' },
  { href:'/admin/notifications',   icon:'🔔', label:'Notifications',   section:'Engagement' },
  { href:'/admin/promo',           icon:'📣', label:'Promo Emails',    section:'Engagement' },
  { href:'/admin/invite',          icon:'✉️', label:'Invite Admins',   section:'Engagement' },
  { href:'/admin/analytics',       icon:'📈', label:'Analytics',       section:'Engagement' },
];

const sections = ['Overview','Management','Engagement'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router  = useRouter();
  const path    = usePathname();
  const [timedOut, setTimedOut] = useState(false);

  // Safety timeout — if loading takes >5s, redirect to login
  useEffect(() => {
    const t = setTimeout(() => { if (loading) setTimedOut(true); }, 5000);
    return () => clearTimeout(t);
  }, [loading]);

  // If timed out, go to login
  useEffect(() => {
    if (timedOut) router.replace('/admin-login');
  }, [timedOut, router]);

  // Auth check
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && !(user as any).adminRole))) {
      router.replace('/admin-login');
    }
  }, [user, loading, router]);

  // ── Still loading auth state ──
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdf4e3]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🐾</div>
          <div className="font-bold text-[#543e35]">Loading FurrEver Admin…</div>
          <p className="text-xs text-[#9B6E50] mt-2">
            {timedOut ? 'Redirecting to login…' : 'Connecting to Firebase…'}
          </p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ──
  if (!user || (user.role !== 'admin' && !(user as any).adminRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdf4e3]">
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <div className="font-bold text-[#543e35]">Redirecting to login…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5ede0]">
      {/* Sidebar */}
      <aside className="w-[252px] bg-[#1b1a18] min-h-screen flex flex-col fixed top-0 left-0 bottom-0 z-[200] overflow-y-auto">
        <div className="px-5 py-6 border-b border-white/8">
          <div className="font-display text-xl font-black text-white">Furr<span className="text-primary">Ever</span></div>
          <div className="text-[10px] font-extrabold tracking-widest uppercase text-white/30 mt-1">Super Admin</div>
        </div>
        <nav className="flex-1 px-3 py-4">
          {sections.map(sec => {
            const items = navItems.filter(n => n.section === sec);
            return (
              <div key={sec} className="mb-4">
                <div className="text-[10px] font-extrabold tracking-widest uppercase text-white/25 px-3 mb-2">{sec}</div>
                {items.map(item => {
                  const active = path === item.href;
                  return (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[.87rem] font-bold mb-0.5 transition-all duration-200
                        ${active ? 'bg-primary text-[#1b1a18]' : 'text-white/55 hover:bg-white/8 hover:text-white'}`}>
                      <span className="text-base w-5 text-center">{item.icon}</span>
                      {item.label}
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1b1a18] opacity-50"/>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="px-3 pb-5 border-t border-white/8 pt-4">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-black text-[#1b1a18]">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.name || 'Admin'}</div>
              <div className="text-[10px] text-white/35 truncate">{user.email}</div>
            </div>
          </div>
          <button onClick={() => { logout(); router.replace('/admin-login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[.84rem] font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200">
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-[252px] flex-1 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div key={path} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.25}}>
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
