'use client';
// src/app/admin-login/page.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

async function resolveIdentifier(identifier: string): Promise<string> {
  // If it's already a valid email, return as-is
  if (identifier.includes('@') && identifier.includes('.') && !identifier.startsWith('FurrEver@')) {
    return identifier;
  }
  // Username format: FurrEver@<localpart> — look up real email from Admins collection
  const res = await fetch('/api/admin/resolve-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: identifier }),
  });
  const data = await res.json();
  if (!res.ok || !data.email) throw new Error(data.error || 'Username not found.');
  return data.email;
}

export default function AdminLoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');   // email OR username
  const [pw, setPw]                 = useState('');
  const [busy, setBusy]             = useState(false);
  const [err, setErr]               = useState('');

  useEffect(() => {
    if (!loading && user && (user.role === 'admin' || (user as any).adminRole)) {
      router.replace('/admin/dashboard');
    }
  }, [user, loading, router]);

  async function handle() {
    if (!identifier || !pw) { setErr('Please enter your username/email and password.'); return; }
    setBusy(true); setErr('');
    try {
      const email = await resolveIdentifier(identifier.trim());
      const result = await login(email, pw);
      if (result.success) {
        toast.success('Welcome back! 🐾');
        router.replace('/admin/dashboard');
      } else {
        setErr(result.error || 'Login failed. Please try again.');
      }
    } catch (e: any) {
      setErr(e.message || 'Login failed.');
    }
    setBusy(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#fdf4e3] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🐾</div>
        <div className="text-sm font-bold text-[#543e35]">Checking session…</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf4e3] flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-white rounded-3xl p-11 border-2 border-[#f0e8d5] shadow-[0_20px_60px_rgba(0,0,0,.07)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg,#d98b19,#f4a900,#FFC133,#f4a900)' }} />

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
              Username or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
              placeholder="furrever@username or email"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] bg-[#fdf4e3] focus:border-[#f4a900] focus:outline-none focus:ring-4 focus:ring-[#f4a900]/10 font-semibold text-sm transition-all"
            />
            {/* Live hint */}
            {identifier && !identifier.includes('.') && identifier.includes('@') && (
              <p className="text-[11px] text-[#9B6E50] mt-1.5 font-semibold">
                🔍 Username detected — will resolve to your registered email
              </p>
            )}
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
              autoComplete="current-password"
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
          <a href="/" className="text-xs font-bold text-[#f4a900] hover:underline">← Back to FurrEver</a>
        </div>
      </motion.div>
    </div>
  );
}