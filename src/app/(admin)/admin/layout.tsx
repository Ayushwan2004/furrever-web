'use client';
// src/app/(admin)/admin/layout.tsx
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/client';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

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
  const { user, fbUser, loading, logout } = useAuth();
  const router = useRouter();
  const path   = usePathname();
  const [timedOut, setTimedOut] = useState(false);

  // Change password modal state
  const [pwModal, setPwModal]     = useState(false);
  const [curPw, setCurPw]         = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy]       = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { if (loading) setTimedOut(true); }, 5000);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => { if (timedOut) router.replace('/admin-login'); }, [timedOut, router]);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && !(user as any).adminRole))) {
      router.replace('/admin-login');
    }
  }, [user, loading, router]);

  async function handleChangePassword() {
    if (!newPw || !curPw) { toast.error('Fill in all fields'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!fbUser) { toast.error('Session expired, please re-login'); return; }
    setPwBusy(true);
    try {
      // Re-authenticate first
      const cred = EmailAuthProvider.credential(fbUser.email!, curPw);
      await reauthenticateWithCredential(fbUser, cred);
      await updatePassword(fbUser, newPw);
      toast.success('Password changed successfully!');
      setPwModal(false); setCurPw(''); setNewPw(''); setConfirmPw('');
    } catch (e: any) {
      const m: Record<string, string> = {
        'auth/wrong-password':     'Current password is incorrect.',
        'auth/weak-password':      'New password is too weak.',
        'auth/too-many-requests':  'Too many attempts. Please wait.',
      };
      toast.error(m[e.code] || e.message);
    }
    setPwBusy(false);
  }

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdf4e3]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🐾</div>
          <div className="font-bold text-[#543e35]">Loading FurrEver Admin…</div>
          <p className="text-xs text-[#9B6E50] mt-2">{timedOut ? 'Redirecting to login…' : 'Connecting to Firebase…'}</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && !(user as any).adminRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdf4e3]">
        <div className="text-center"><div className="text-5xl mb-4">🔐</div><div className="font-bold text-[#543e35]">Redirecting to login…</div></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5ede0]">
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

        {/* Bottom user section */}
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
          <button onClick={() => setPwModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[.84rem] font-bold text-white/50 hover:bg-white/8 hover:text-white transition-all duration-200 mb-1">
            🔑 Change Password
          </button>
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

      {/* Change Password Modal */}
      <AnimatePresence>
        {pwModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 px-4"
            onClick={e => { if (e.target === e.currentTarget) setPwModal(false); }}>
            <motion.div initial={{scale:.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.95,opacity:0}}
              className="bg-white rounded-2xl p-8 w-full max-w-[380px] shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="font-display text-xl font-black">🔑 Change Password</div>
                <button onClick={() => setPwModal(false)} className="text-[#9B6E50] hover:text-[#543e35] text-xl font-bold">✕</button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Current Password', val: curPw, set: setCurPw },
                  { label: 'New Password',     val: newPw, set: setNewPw },
                  { label: 'Confirm Password', val: confirmPw, set: setConfirmPw },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-1">{label}</label>
                    <input type="password" value={val} onChange={e => set(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-[#f0e8d5] bg-[#fdf4e3] focus:border-primary focus:outline-none text-sm font-semibold"/>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setPwModal(false)}
                  className="flex-1 py-2.5 rounded-full border-2 border-[#f0e8d5] text-sm font-bold text-[#543e35]">
                  Cancel
                </button>
                <button onClick={handleChangePassword} disabled={pwBusy}
                  className="flex-1 py-2.5 rounded-full bg-primary text-[#1b1a18] text-sm font-extrabold shadow-[3px_3px_0_#d98b19] disabled:opacity-50">
                  {pwBusy ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}