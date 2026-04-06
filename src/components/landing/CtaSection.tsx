'use client';
// src/components/landing/CtaSection.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PetIllustrators from '@/components/shared/PetIllustrators';
gsap.registerPlugin(ScrollTrigger);

export default function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta-inner', { opacity:0, y:30, duration:.7, ease:'power3.out',
        scrollTrigger:{ trigger: ref.current, start:'top 80%' } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="bg-[#1b1a18] py-24 px-[5%] text-center relative overflow-hidden">
      <PetIllustrators count={2} />
      <div className="cta-inner relative z-10">
        <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-black text-white leading-tight mb-5">
          Ready to Meet Your<br/><span className="italic text-primary">Forever Friend?</span>
        </h2>
        <p className="text-[#DDDAD0] max-w-[460px] mx-auto mb-9 leading-[1.75]">
          Download FurrEver today and give a loving pet their forever home.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a href={process.env.NEXT_PUBLIC_APK_URL || '#'}
             className="font-extrabold bg-primary text-[#1b1a18] px-8 py-3.5 rounded-full shadow-[4px_4px_0_#d98b19] hover:shadow-[7px_7px_0_#d98b19] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
            📥 Download APK
          </a>
          <a href="/contact"
             className="font-extrabold text-white border-2 border-white/30 px-8 py-3.5 rounded-full hover:bg-white/10 transition-all duration-200">
            📧 Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
