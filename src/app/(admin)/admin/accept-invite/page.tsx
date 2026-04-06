'use client';
// src/app/(admin)/admin/accept-invite/page.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { invitesApi } from '@/lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AcceptInvitePage() {
  const params = useSearchParams();
  const code   = params.get('code') || '';
  const { user, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'idle'|'accepting'|'done'|'error'>('idle');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!loading && user && code && status === 'idle') {
      handleAccept();
    }
  }, [loading, user, code]);

  async function handleAccept() {
    if (!code || !user) return;
    setStatus('accepting');
    try {
      const res: any = await invitesApi.accept(code, user.uid || (user as any).id);
      if (res?.success) {
        setStatus('done');
        toast.success('Admin access granted!');
        setTimeout(() => router.replace('/admin/dashboard'), 2000);
      } else {
        setStatus('error'); setErr(res?.error || 'Invalid invite code');
      }
    } catch (e:any) { setStatus('error'); setErr(e.message); }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#fdf4e3] flex items-center justify-center">
      <div className="text-center"><div className="text-4xl animate-bounce mb-3">🐾</div><div className="font-bold text-[#543e35]">Loading…</div></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#fdf4e3] flex items-center justify-center px-5">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="bg-white rounded-2xl p-10 max-w-[400px] w-full border border-[#f0e8d5] text-center shadow-lg">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="font-display text-2xl font-black mb-3">Admin Invite</h1>
        <p className="text-sm text-[#543e35] mb-6">You need to be logged in to accept this invite. Sign in to your FurrEver account first.</p>
        <a href={`/admin-login?redirect=/admin/accept-invite?code=${code}`}
          className="inline-block bg-primary text-[#1b1a18] font-extrabold px-6 py-2.5 rounded-full shadow-[3px_3px_0_#d98b19]">
          Login to Accept
        </a>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf4e3] flex items-center justify-center px-5">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="bg-white rounded-2xl p-10 max-w-[400px] w-full border border-[#f0e8d5] text-center shadow-lg">
        {status === 'accepting' && <><div className="text-4xl mb-4 animate-pulse">🐾</div><h1 className="font-display text-2xl font-black">Activating Access…</h1></>}
        {status === 'done'      && <><div className="text-4xl mb-4">🎉</div><h1 className="font-display text-2xl font-black">Admin Access Granted!</h1><p className="text-sm text-[#543e35] mt-2">Redirecting to dashboard…</p></>}
        {status === 'error'     && <><div className="text-4xl mb-4">⚠️</div><h1 className="font-display text-2xl font-black text-red-600">Invite Error</h1><p className="text-sm text-red-500 mt-2">{err}</p><a href="/" className="inline-block mt-5 text-sm font-bold text-primary underline">Back to Home</a></>}
      </motion.div>
    </div>
  );
}
