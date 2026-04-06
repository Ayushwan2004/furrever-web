'use client';
// src/app/admin-login/page.tsx
// Standalone — NOT inside (admin) group, so no auth guard wraps it
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [pw, setPw]           = useState('');
  const [busy, setBusy]       = useState(false);
  const [err, setErr]         = useState('');

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (!loading && user && (user.role === 'admin' || (user as any).adminRole)) {
      router.replace('/admin/dashboard');
    }
  }, [user, loading, router]);

  async function handle() {
    if (!email || !pw) { setErr('Please enter your email and password.'); return; }
    setBusy(true); setErr('');
    const result = await login(email, pw);
    setBusy(false);
    if (result.success) {
      toast.success('Welcome back! 🐾');
      router.replace('/admin/dashboard');
    } else {
      setErr(result.error || 'Login failed. Please try again.');
    }
  }

  // Show loading while checking existing session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf4e3] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🐾</div>
          <div className="text-sm font-bold text-[#543e35]">Checking session…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf4e3] flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-white rounded-3xl p-11 border-2 border-[#f0e8d5] shadow-[0_20px_60px_rgba(0,0,0,.07)] relative overflow-hidden"
      >
        {/* Top gradient bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg,#d98b19,#f4a900,#FFC133,#f4a900)' }}
        />

        <div className="text-center mb-8">
          <div className="font-display text-3xl font-black mb-1">
            Furr<span className="text-primary">Ever</span> 🐾
          </div>
          <div className="text-sm text-[#543e35] font-semibold">Super Admin Portal</div>
          <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
            🔒 Restricted Access — All logins are logged
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
              placeholder="admin@furrever.app"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] bg-[#fdf4e3] focus:border-[#f4a900] focus:outline-none focus:ring-4 focus:ring-[#f4a900]/10 font-semibold text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
              placeholder="••••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] bg-[#fdf4e3] focus:border-[#f4a900] focus:outline-none focus:ring-4 focus:ring-[#f4a900]/10 font-semibold text-sm transition-all"
            />
          </div>
        </div>

        {err && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-semibold flex items-center gap-2">
            ⚠️ {err}
          </div>
        )}

        <button
          onClick={handle}
          disabled={busy}
          className="w-full mt-6 py-3.5 rounded-full bg-[#f4a900] text-[#1b1a18] font-extrabold shadow-[4px_4px_0_#d98b19] hover:shadow-[6px_6px_0_#d98b19] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60"
        >
          {busy ? '🐾 Signing In…' : 'Sign In to Dashboard →'}
        </button>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs font-bold text-[#f4a900] hover:underline">
            ← Back to FurrEver
          </a>
        </div>
      </motion.div>
    </div>
  );
}
