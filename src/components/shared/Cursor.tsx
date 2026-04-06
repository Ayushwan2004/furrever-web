'use client';
// src/components/shared/Cursor.tsx
import { useEffect } from 'react';

export default function Cursor() {
  useEffect(() => {
    const dot  = document.getElementById('cdot')!;
    const ring = document.getElementById('cring')!;
    if (!dot || !ring) return;
    let rx = 0, ry = 0, mx = 0, my = 0;
    const mv = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; dot.style.left = mx+'px'; dot.style.top = my+'px'; };
    document.addEventListener('mousemove', mv);
    let raf: number;
    const lerp = () => { rx+=(mx-rx)*.12; ry+=(my-ry)*.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; raf=requestAnimationFrame(lerp); };
    raf = requestAnimationFrame(lerp);
    return () => { document.removeEventListener('mousemove',mv); cancelAnimationFrame(raf); };
  }, []);
  return <><div id="cdot"/><div id="cring"/></>;
}
