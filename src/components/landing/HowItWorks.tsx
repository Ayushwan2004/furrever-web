'use client';
// src/components/landing/HowItWorks.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const steps = [
  { icon:'📱', title:'Download the App',  desc:'Get FurrEver and create your profile in 2 minutes.' },
  { icon:'🔍', title:'Browse Pets',       desc:'Explore hundreds of adorable profiles with photos.' },
  { icon:'❤️', title:'Apply to Adopt',    desc:'Send an adoption application directly through the app.' },
  { icon:'🏆', title:'Get Certified',     desc:'Receive your official FurrEver adoption certificate!' },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.step-card', { opacity:0, y:30, stagger:.15, duration:.6, ease:'power3.out',
        scrollTrigger: { trigger:'.steps-row', start:'top 80%' } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="px-[5%] py-24 bg-[#f3e6ce] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {['🐾','🐕','🐈','🐩'].map((e,i) => (
          <span key={i} className="absolute text-5xl opacity-[0.035] select-none"
                style={{top:`${15+i*20}%`,left:`${i%2===0?5:80}%`,transform:`rotate(${i*20}deg)`}}>{e}</span>
        ))}
      </div>
      <div className="text-center mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#d98b19] mb-3">
          <span className="w-4 h-0.5 bg-primary rounded"/>The Process
        </div>
        <h2 className="font-display text-[clamp(1.9rem,3.8vw,2.9rem)] font-black">
          How <span className="italic text-primary">FurrEver</span> Works
        </h2>
      </div>
      <div className="steps-row grid grid-cols-2 lg:grid-cols-4 gap-7 relative z-10">
        <div className="absolute top-10 left-[12%] right-[12%] h-[2px] hidden lg:block"
             style={{background:'linear-gradient(90deg,#f4a900,#FFC133,#f4a900)'}}/>
        {steps.map((s,i) => (
          <div key={s.title} className="step-card text-center relative z-10">
            <div className="w-[58px] h-[58px] bg-primary rounded-full flex items-center justify-center mx-auto mb-5 text-2xl shadow-[0_0_0_4px_#f3e6ce,0_0_0_6px_#f4a900]">
              {s.icon}
            </div>
            <div className="font-extrabold text-base mb-2">{s.title}</div>
            <p className="text-sm text-[#543e35] leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
