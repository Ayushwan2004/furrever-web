'use client';
// src/components/landing/SplashScreen.tsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function SplashScreen() {
  const [gone, setGone] = useState(false);
  const splashRef = useRef<HTMLDivElement>(null);
  const dogRef    = useRef<HTMLDivElement>(null);
  const titleRef  = useRef<HTMLDivElement>(null);
  const subRef    = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tl = gsap.timeline({ onComplete: () => setGone(true) });
    tl.to('.sdot', { scale:1.5, stagger:.12, duration:.25, yoyo:true, repeat:1, ease:'power2.inOut' });
    tl.to(dogRef.current, { x:'115vw', duration:2.4, ease:'power2.inOut' }, 0.2);
    gsap.utils.toArray<HTMLElement>('.splash-paw').forEach((el,i) =>
      tl.to(el, { opacity:.55, scale:1.1, duration:.2 }, 0.35 + i*.38));
    tl.fromTo(titleRef.current,
      { opacity:0, y:30 },
      { opacity:1, y:0, duration:.75, ease:'back.out(1.8)' }, 1.9);
    tl.fromTo(subRef.current,
      { opacity:0 },
      { opacity:1, duration:.5 }, 2.3);
    tl.to(splashRef.current, { opacity:0, duration:.6, ease:'power2.inOut' }, 3.2);
    return () => { tl.kill(); };
  }, []);

  if (gone) return null;

  return (
    <div ref={splashRef} className="fixed inset-0 z-[9999] bg-[#fdf4e3] flex flex-col items-center justify-center overflow-hidden">
      {/* Ground */}
      <div className="absolute bottom-[22%] left-0 right-0 h-[3px] opacity-25 rounded-full"
           style={{background:'linear-gradient(90deg,transparent,#d98b19,#f4a900,transparent)'}}/>
      {/* Paw trails */}
      {[18,28,38,48,58].map((l,i) => (
        <span key={i} className="splash-paw absolute text-2xl opacity-0 select-none"
              style={{bottom:'21%', left:`${l}%`}}>🐾</span>
      ))}
      {/* Dog */}
      <div ref={dogRef} className="absolute bottom-[21%] -left-56 flex items-end">
        <svg width="140" viewBox="0 0 210 170" fill="none">
          <ellipse cx="105" cy="118" rx="58" ry="36" fill="#d98b19"/>
          <circle cx="162" cy="84" r="34" fill="#f4a900"/>
          <ellipse cx="147" cy="57" rx="13" ry="20" fill="#d98b19" transform="rotate(-22 147 57)"/>
          <ellipse cx="176" cy="54" rx="13" ry="20" fill="#d98b19" transform="rotate(22 176 54)"/>
          <circle cx="172" cy="80" r="7" fill="#1b1a18"/>
          <circle cx="174" cy="78" r="2.5" fill="white"/>
          <ellipse cx="183" cy="92" rx="8" ry="6" fill="#1b1a18"/>
          <path d="M180 98 Q184 104 188 98" stroke="#543e35" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <ellipse cx="184" cy="104" rx="6" ry="5" fill="#E52020"/>
          <rect x="124" y="138" width="15" height="32" rx="7" fill="#d98b19" transform="rotate(18 124 138)"/>
          <rect x="146" y="138" width="15" height="32" rx="7" fill="#d98b19" transform="rotate(-12 146 138)"/>
          <rect x="62"  y="136" width="15" height="32" rx="7" fill="#d98b19" transform="rotate(-18 62 136)"/>
          <rect x="83"  y="138" width="15" height="30" rx="7" fill="#d98b19" transform="rotate(12 83 138)"/>
          <path d="M50 115 Q18 84 34 62 Q46 50 58 62" stroke="#d98b19" strokeWidth="11" fill="none" strokeLinecap="round"/>
          <line x1="36" y1="62" x2="36" y2="28" stroke="#1b1a18" strokeWidth="2.8"/>
          <rect x="36" y="17" width="88" height="24" rx="5" fill="#f4a900"/>
          <text x="48" y="34" fontFamily="Fraunces,serif" fontSize="12" fontWeight="900" fill="#1b1a18">FurrEver 🐾</text>
        </svg>
      </div>
      {/* Title */}
      <div ref={titleRef} className="opacity-0 z-10 text-center font-display font-black leading-none"
           style={{fontSize:'clamp(3.5rem,10vw,7.5rem)'}}>
        Furr<span className="text-primary">Ever</span>
      </div>
      <p ref={subRef} className="opacity-0 z-10 mt-3 text-[#543e35] font-bold text-lg">Find Your Forever Friend 🐾</p>
      <div className="absolute bottom-[8%] flex gap-2">
        {[0,1,2].map(i => <div key={i} className="sdot w-3 h-3 rounded-full bg-primary"/>)}
      </div>
    </div>
  );
}
