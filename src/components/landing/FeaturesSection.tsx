'use client';
// src/components/landing/FeaturesSection.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: '✅',
    title: '100% Trusted Listings',
    desc: 'Every pet listing goes through a strict verification process. No fake posts, no scams — only genuine pets from real, verified owners and shelters.',
    badge: 'Verified',
  },
  {
    icon: '🤖',
    title: 'Advanced AI Image Scan',
    desc: 'Our AI scans every photo before a listing goes live — detecting breed accuracy, flagging suspicious images, and ensuring the pet is real and healthy.',
    badge: 'AI-Powered',
  },
  {
    icon: '📋',
    title: 'Automated Listing Form',
    desc: 'Smart form that auto-fills breed details, suggests age ranges, and pre-populates health info — creating a complete pet profile in under 2 minutes.',
    badge: 'Smart',
  },
  {
    icon: '📍',
    title: 'Precise Location Tracker',
    desc: 'Find pets near you with our real-time GPS-based tracker. Filter by distance, neighbourhood, or city and never miss an adoption opportunity close to home.',
    badge: 'Real-Time',
  },
  {
    icon: '💬',
    title: 'In-App Chat & Connect',
    desc: 'Message pet owners directly through our secure in-app chat. Ask questions, share updates, and build a bond before the adoption — all in one safe space.',
    badge: 'Instant',
  },
  {
    icon: '🏆',
    title: 'Official Adoption Certificate',
    desc: 'Celebrate your forever companion with a digital certificate issued to you upon every successful adoption. A keepsake as special as the pet itself.',
    badge: 'Digital',
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      gsap.from('.feat-card', {
        opacity: 0, y: 40, stagger: .1, duration: .65, ease: 'power3.out',
        scrollTrigger: { trigger: '.feat-grid', start: 'top 80%' },
      });
      gsap.from('.feat-head', {
        opacity: 0, y: 22, duration: .6, ease: 'power3.out',
        scrollTrigger: { trigger: '.feat-head', start: 'top 85%' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="px-[5%] py-24 bg-[#fdf4e3]">
      <div className="feat-head mb-14">
        <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#d98b19] mb-3">
          <span className="w-4 h-0.5 bg-primary rounded"/>Why FurrEver?
        </div>
        <h2 className="font-display text-[clamp(1.9rem,3.8vw,2.9rem)] font-black leading-tight">
          Built Different. Built for <span className="italic text-primary">Every Pet.</span>
        </h2>
        <p className="mt-3 text-[#543e35] leading-[1.7] max-w-[520px]">
          FurrEver isn't just another adoption app. Every feature is crafted to make finding, trusting, and adopting a pet seamless and safe.
        </p>
      </div>

      <div className="feat-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="feat-card group bg-white rounded-2xl p-7 border border-[#f0e8d5] hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(244,169,0,.13)] transition-all duration-300 relative overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-2xl"/>

            {/* Badge */}
            <div className="absolute top-4 right-4 text-[9px] font-extrabold uppercase tracking-widest text-[#d98b19] bg-[rgba(244,169,0,.1)] border border-[rgba(244,169,0,.25)] px-2 py-0.5 rounded-full">
              {f.badge}
            </div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 border border-[rgba(244,169,0,.3)]" style={{ background: 'rgba(244,169,0,.08)' }}>
              {f.icon}
            </div>

            <div className="font-extrabold text-base mb-2 text-[#1b1a18]">{f.title}</div>
            <p className="text-sm text-[#543e35] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Bottom trust bar */}
      <div className="mt-14 flex flex-wrap gap-5 items-center justify-center">
        {['10,000+ Happy Adoptions','AI-Verified Listings','GPS-Accurate Matches','Zero Scam Policy'].map(label => (
          <div key={label} className="flex items-center gap-2 text-sm font-bold text-[#543e35]">
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"/>
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}