'use client';
// src/app/admin-login/page.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/client';
import { sendPasswordResetEmail } from 'firebase/auth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

async function resolveIdentifier(identifier: string): Promise<string> {
  if (identifier.includes('@') && identifier.includes('.') && !identifier.startsWith('furrever@')) {
    return identifier;
  }
  const r = await fetch('/api/admin/resolve-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: identifier }),
  });
  const data = await r.json();
  console.log('resolve-username response:', r.status, JSON.stringify(data));
  if (!r.ok || !data.data?.email) throw new Error(data.error || 'Username not found.');
  return data.data.email;
}

export default function AdminLoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [pw, setPw]                 = useState('');
  const [busy, setBusy]             = useState(false);
  const [err, setErr]               = useState('');
  const [forgotSent, setForgotSent] = useState(false);

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

  async function handleForgot() {
    if (!identifier) { setErr('Enter your email or username first.'); return; }
    setBusy(true); setErr('');
    try {
      const email = await resolveIdentifier(identifier.trim());
      await sendPasswordResetEmail(auth, email);
      setForgotSent(true);
      toast.success('Password reset email sent!');
    } catch (e: any) {
      setErr(e.message || 'Could not send reset email.');
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
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}
        className="w-full max-w-[420px] bg-white rounded-3xl p-11 border-2 border-[#f0e8d5] shadow-[0_20px_60px_rgba(0,0,0,.07)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
             style={{background:'linear-gradient(90deg,#d98b19,#f4a900,#FFC133,#f4a900)'}}/>

        <div className="text-center mb-8">
          <div className="font-display text-3xl font-black mb-1">Furr<span className="text-primary">Ever</span> 🐾</div>
          <div className="text-sm text-[#543e35] font-semibold">Super Admin Portal</div>
          <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
            🔒 Restricted Access — All logins are logged
          </div>
        </div>

        {forgotSent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📧</div>
            <div className="font-bold text-[#543e35]">Reset email sent!</div>
            <p className="text-xs text-[#9B6E50] mt-2 mb-5">Check your inbox and follow the link to reset your password.</p>
            <button onClick={()=>setForgotSent(false)} className="text-xs font-bold text-primary underline">Back to Login</button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-1.5">Username or Email</label>
                <input type="text" value={identifier} onChange={e=>{setIdentifier(e.target.value);setErr('');}}
                  onKeyDown={e=>e.key==='Enter'&&handle()}
                  placeholder="furrever@username or email"
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] bg-[#fdf4e3] focus:border-[#f4a900] focus:outline-none focus:ring-4 focus:ring-[#f4a900]/10 font-semibold text-sm transition-all"/>
                {identifier.startsWith('furrever@') && (
                  <p className="text-[11px] text-[#9B6E50] mt-1.5 font-semibold">🔍 Username detected — will resolve to your registered email</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-1.5">Password</label>
                <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handle()}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] bg-[#fdf4e3] focus:border-[#f4a900] focus:outline-none focus:ring-4 focus:ring-[#f4a900]/10 font-semibold text-sm transition-all"/>
              </div>
            </div>

            {err && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-semibold flex items-center gap-2">
                ⚠️ {err}
              </div>
            )}

            <button onClick={handle} disabled={busy}
              className="w-full mt-6 py-3.5 rounded-full bg-[#f4a900] text-[#1b1a18] font-extrabold shadow-[4px_4px_0_#d98b19] hover:shadow-[6px_6px_0_#d98b19] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
              {busy ? '🐾 Signing In…' : 'Sign In to Dashboard →'}
            </button>

            <div className="mt-4 text-center">
              <button onClick={handleForgot} disabled={busy}
                className="text-xs font-bold text-[#9B6E50] hover:text-primary transition-colors">
                Forgot password?
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-xs font-bold text-[#f4a900] hover:underline">← Back to FurrEver</a>
        </div>
      </motion.div>
    </div>
  );
}