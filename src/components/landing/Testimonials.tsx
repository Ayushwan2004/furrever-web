'use client';
// src/components/landing/Testimonials.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  { name:'Priya Sharma',   pet:'Bruno 🐶', avatar:'👩', text:'FurrEver made the whole process so smooth. Within a week we adopted Bruno. Best thing that happened to our family!' },
  { name:'Rahul Mehta',    pet:'Luna 🐱',  avatar:'👨', text:'The smart matching is incredible! Luna is a perfect fit. The certification made it feel so official and special.' },
  { name:'Anjali Patel',   pet:'Snowball 🐰', avatar:'👩', text:'The adoption certificate from FurrEver hangs on our wall! The whole process felt so professional.' },
];

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.testi-card', { opacity:0, y:30, stagger:.15, duration:.6, ease:'power3.out',
        scrollTrigger: { trigger:'.testi-grid', start:'top 80%' } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="px-[5%] py-24 bg-[#fdf4e3]">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#d98b19] mb-3">
          <span className="w-4 h-0.5 bg-primary rounded"/>Happy Families
        </div>
        <h2 className="font-display text-[clamp(1.9rem,3.8vw,2.9rem)] font-black">
          They Found Their <span className="italic text-primary">FurrEver</span> Match
        </h2>
      </div>
      <div className="testi-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map(t => (
          <div key={t.name} className="testi-card bg-white rounded-2xl p-7 border border-[#f0e8d5]">
            <div className="font-display text-5xl text-primary leading-none mb-3">"</div>
            <p className="text-sm text-[#543e35] leading-[1.75] italic mb-6">{t.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 border-primary" style={{background:'rgba(244,169,0,.1)'}}>
                {t.avatar}
              </div>
              <div>
                <div className="font-extrabold text-sm">{t.name}</div>
                <div className="text-xs text-[#9B6E50]">Adopted {t.pet}</div>
                <div className="text-primary text-xs mt-0.5">★★★★★</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
