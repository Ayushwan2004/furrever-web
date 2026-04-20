'use client';
// src/components/landing/HeroSection.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PetIllustrators from '@/components/shared/PetIllustrators';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { num: '5+', label: 'Happy Adoptions' },
  { num: '30+',   label: 'Pets Available' },
  { num: '4+',     label: 'Partner Shelters' },
];

const phonePets = [
  { emoji:'🐶', name:'Buddy',    breed:'Golden Retriever · 2 yrs', bg:'rgba(244,169,0,.15)' },
  { emoji:'🐱', name:'Luna',     breed:'Persian Cat · 1 yr',       bg:'rgba(120,200,65,.15)' },
  { emoji:'🐰', name:'Snowball', breed:'Mini Rabbit · 8 mo',       bg:'rgba(51,161,224,.15)' },
  { emoji:'🐕', name:'Max',      breed:'Beagle · 3 yrs',           bg:'rgba(229,32,32,.1)' },
];

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 3.8 });
      tl.from('.h-badge',  { opacity:0, y:18, duration:.5, ease:'back.out(1.5)' })
        .from('.h-title',  { opacity:0, y:28, duration:.65, ease:'power3.out' }, '-=.2')
        .from('.h-desc',   { opacity:0, y:18, duration:.5 }, '-=.3')
        .from('.h-btns',   { opacity:0, y:14, duration:.4 }, '-=.25')
        .from('.h-stat',   { opacity:0, y:10, stagger:.1, duration:.35 }, '-=.25')
        .from('.h-phone',  { opacity:0, x:50, rotation:3, duration:.8, ease:'back.out(1.1)' }, '-=.5')
        .from('.h-float',  { opacity:0, scale:.85, stagger:.18, duration:.4 }, '-=.4');
      // Floating phone
      gsap.to('.h-phone', { y:-10, duration:2.5, yoyo:true, repeat:-1, ease:'sine.inOut' });
      gsap.to('.h-float-1', { y:-7, duration:2, yoyo:true, repeat:-1, ease:'sine.inOut' });
      gsap.to('.h-float-2', { y:7, duration:2.3, yoyo:true, repeat:-1, ease:'sine.inOut' });
      // Scroll parallax on hero BG circles
      gsap.to('.h-circle-1', { yPercent:30, ease:'none', scrollTrigger: { trigger: heroRef.current, start:'top top', end:'bottom top', scrub:1 } });
      gsap.to('.h-circle-2', { yPercent:-20, ease:'none', scrollTrigger: { trigger: heroRef.current, start:'top top', end:'bottom top', scrub:1.5 } });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center px-[5%] pt-20 pb-16 overflow-hidden gap-14"
             style={{background:'var(--bg)'}}>
      <PetIllustrators count={3} />
      {/* BG Circles */}
      <div className="h-circle-1 absolute w-[600px] h-[600px] rounded-full -top-20 -right-20 pointer-events-none"
           style={{background:'rgba(244,169,0,.1)'}}/>
      <div className="h-circle-2 absolute w-[280px] h-[280px] rounded-full -bottom-10 -left-10 pointer-events-none"
           style={{background:'rgba(120,200,65,.12)'}}/>

      {/* Content */}
      <div className="relative z-10 flex-1 max-w-[580px]">
        <div className="h-badge inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
             style={{background:'rgba(244,169,0,.12)',border:'1.5px solid #f4a900',color:'#d98b19'}}>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
          1,200+ Pets Found Their Forever Home
        </div>
        <h1 className="h-title font-display font-black leading-[1.05] mb-5"
            style={{fontSize:'clamp(2.8rem,5.5vw,4.8rem)'}}>
          Find Your<br/>
          <span className="italic text-primary">Perfect</span><br/>
          <span className="relative">Companion
            <span className="absolute bottom-1 left-0 right-0 h-3 -z-[1] rounded-sm" style={{background:'rgba(244,169,0,.18)'}}/>
          </span>
        </h1>
        <p className="h-desc text-[#543e35] text-base leading-[1.75] mb-8 max-w-[460px]">
          FurrEver connects loving families with adorable pets waiting for their forever home. Browse, connect, and adopt — all in one joyful place. 🐕
        </p>
        <div className="h-btns flex gap-3 flex-wrap mb-11">
          {/* <button className="font-extrabold text-sm bg-primary text-[#1b1a18] px-7 py-3.5 rounded-full shadow-[4px_4px_0_#d98b19] hover:shadow-[7px_7px_0_#d98b19] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-200">
            🐾 Meet the Pets
          </button> */}
          <a href={process.env.NEXT_PUBLIC_APK_URL || '#'}
             className="font-extrabold text-sm bg-[#1b1a18] text-primary px-7 py-3.5 rounded-full shadow-[4px_4px_0_#543e35] hover:shadow-[7px_7px_0_#543e35] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-200">
            📱 Download APK
          </a>
        </div>
        <div className="flex gap-9">
          {stats.map(s => (
            <div key={s.label} className="h-stat">
              <div className="font-display text-[1.9rem] font-black leading-none">{s.num}</div>
              <div className="text-xs font-semibold text-[#9B6E50] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phone mockup */}
      <div className="relative z-10 flex-1 hidden lg:flex justify-center items-center">
        <div className="h-float-1 h-float absolute top-[8%] right-[5%] bg-white rounded-xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5 text-xs font-bold z-20">
          🐶 <div><div className="text-[10px] text-[#9B6E50]">Just listed</div>Bella — Labrador</div>
        </div>
        <div className="h-phone w-[260px] h-[520px] bg-[#1b1a18] rounded-[38px] border-[5px] border-[#1b1a18] shadow-[20px_28px_55px_rgba(27,26,24,.22)] overflow-hidden relative">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[70px] h-[18px] bg-[#1b1a18] rounded-full z-10"/>
          <div className="w-full h-full bg-[#fdf4e3] rounded-[33px] overflow-hidden flex flex-col">
            <div className="bg-primary px-3.5 pt-8 pb-3.5 font-display font-black text-base text-[#1b1a18] text-center">FurrEver 🐾</div>
            <div className="p-2.5 flex flex-col gap-2">
              {phonePets.map(p => (
                <div key={p.name} className="bg-white rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:p.bg}}>{p.emoji}</div>
                  <div className="flex-1 min-w-0"><div className="font-extrabold text-xs">{p.name}</div><div className="text-[10px] text-[#9B6E50] truncate">{p.breed}</div></div>
                  <div className="text-[9px] font-bold px-2 py-1 rounded-full" style={{background:'rgba(120,200,65,.15)',color:'#366025',border:'1px solid #78C841'}}>Available</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-float-2 h-float absolute bottom-[10%] left-[2%] bg-white rounded-xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5 text-xs font-bold z-20">
          🎉 <div><div className="text-[10px] text-[#9B6E50]">Just adopted!</div>Max found a family</div>
        </div>
      </div>
    </section>
  );
}
