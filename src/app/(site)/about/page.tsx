'use client';
// src/app/(site)/about/page.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PetIllustrators from '@/components/shared/PetIllustrators';
gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(()=>{
      gsap.from('.about-hero',{opacity:0,y:30,duration:.7,ease:'power3.out'});
      gsap.from('.about-card',{opacity:0,y:25,stagger:.1,duration:.55,ease:'power3.out',scrollTrigger:{trigger:'.about-grid',start:'top 85%'}});
    },ref);
    return ()=>ctx.revert();
  },[]);
  const team = [
    {n:'Ayush Wankhede',r:'Founder & CEO',e:'❤️‍🔥',d:'Computer Engineering Graduate, Strong Passion towards Business and Human Welfare'},
    {n:'Mohit Patil',r:'Founder & CTO',e:'💻',d:'Full-stack engineer and ML enthusiast passionate about building technology for social good.'},
    {n:'Ajinkya Patil',r:'Founder & Head of Operations',e:'🌟',d:'Operations specialist ensuring smooth adoption processes nationwide.'},
    {n:'Partth Thombre',r:'Founder & CMO',e:'💹',d:'ML enthusiast and marketing strategist dedicated to connecting pets with loving families.'},
  ];
  return (
    <div ref={ref} className="pt-20">
      <section className="relative bg-[#fdf4e3] px-[5%] py-20 overflow-hidden">
        <PetIllustrators count={2}/>
        <div className="about-hero max-w-[640px] relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#d98b19] mb-4 border border-primary/30 bg-primary/10 px-4 py-2 rounded-full">🐾 Our Story</div>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-black leading-tight mb-5">We Believe Every Pet Deserves a <span className="italic text-primary">Forever Home</span></h1>
          <p className="text-[#543e35] leading-[1.8] text-base">FurrEver was born from a simple belief: finding the perfect pet companion should be joyful, transparent, and safe. We built technology that connects animals with families who will love them unconditionally.</p>
        </div>
      </section>
      <section className="px-[5%] py-20 bg-[#f3e6ce]">
        <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-black mb-10">Meet the Team</h2>
        <div className="about-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map(t=>(
            <div key={t.n} className="about-card bg-white rounded-2xl p-7 border border-[#f0e8d5] text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-3xl mx-auto mb-4">{t.e}</div>
              <div className="font-extrabold text-base">{t.n}</div>
              <div className="text-xs text-primary font-bold mb-3">{t.r}</div>
              <p className="text-sm text-[#543e35] leading-relaxed">{t.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
