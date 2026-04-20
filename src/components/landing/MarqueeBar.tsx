'use client';
// src/components/landing/MarqueeBar.tsx
export default function MarqueeBar() {
  const items = ['🐾 Adopt Don\'t Shop','🐶 50+ Happy Tails','🏠 Forever Homes','🐱 All Breeds Welcome','❤️ Find Your Match','🎉 Certified Adoptions'];
  return (
    <div className="bg-[#1b1a18] py-4 overflow-hidden" style={{transform:'rotate(-1deg)',margin:'-6px 0'}}>
      <div className="marquee-track">
        {[...items,...items].map((item,i) => (
          <span key={i} className="font-display font-bold text-base flex items-center gap-3 flex-shrink-0">
            <span className="text-primary">{item.split(' ').slice(0,1).join(' ')}</span>
            <span className="text-white">{item.split(' ').slice(1).join(' ')}</span>
            <span className="text-primary opacity-40 mx-2">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
