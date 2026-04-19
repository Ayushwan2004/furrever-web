'use client';
// src/app/(site)/contact/page.tsx
import { useState } from 'react';
import { contactsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handle() {
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('All fields required.'); return;
    }
    setBusy(true);
    try {
      // contactsApi.submit hits /api/contacts which sends email server-side
      await contactsApi.submit(form);
      setSent(true);
      toast.success('Message sent!');
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  }

  return (
    <div className="pt-24 pb-16 px-[5%] min-h-screen">
      <div className="max-w-[540px] mx-auto">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}>
          <div className="font-display text-[clamp(2rem,4vw,3rem)] font-black mb-2">Get in <span className="italic text-primary">Touch</span></div>
          <p className="text-[#543e35] mb-8 leading-relaxed">Have questions about adoption? We're here to help. 🐾</p>
          {sent ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <div className="font-extrabold text-lg text-green-700">Message Sent!</div>
              <p className="text-sm text-green-600 mt-2">We'll get back to you within 24 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}
                className="mt-5 text-sm font-bold text-primary underline">Send Another</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-[#f0e8d5] shadow-sm space-y-5">
              {(['name','email','subject'] as const).map(k => (
                <div key={k}>
                  <label className="block text-xs font-extrabold tracking-wider text-[#9B6E50] mb-2 capitalize">{k}</label>
                  <input type={k === 'email' ? 'email' : 'text'} value={form[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    placeholder={k==='email' ? 'you@example.com' : k==='subject' ? 'How can we help?' : k}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3] transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#9B6E50] mb-2">Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={5} placeholder="Tell us about your adoption inquiry…"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#f0e8d5] focus:border-primary focus:outline-none text-sm font-semibold bg-[#fdf4e3] resize-none transition-all" />
              </div>
              <button onClick={handle} disabled={busy}
                className="w-full py-3.5 rounded-full bg-primary text-[#1b1a18] font-extrabold shadow-[4px_4px_0_#d98b19] hover:shadow-[6px_6px_0_#d98b19] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
                {busy ? 'Sending…' : 'Send Message →'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}