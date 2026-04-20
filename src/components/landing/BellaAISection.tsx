'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

// ─── Bella AI chat bubbles data ───────────────────────────────────────────────
const CHAT_FLOW = [
  {
    role: 'user' as const,
    text: 'Hey Bella! I want a calm dog, good with kids 🐾',
    delay: 0,
  },
  {
    role: 'bella' as const,
    text: "Aw, love it! 🐶 I'm already scanning 1,200+ verified listings near you…",
    delay: 1.2,
  },
  {
    role: 'bella' as const,
    text: 'Found 3 perfect matches! Golden Retrievers & a sweet Beagle. All health-checked ✅',
    delay: 2.6,
  },
  {
    role: 'user' as const,
    text: 'Can I visit the Beagle this weekend?',
    delay: 4.0,
  },
  {
    role: 'bella' as const,
    text: 'Done! 🗓️ Visit scheduled for Saturday 11 AM. The shelter is 2.3 km away. See you there!',
    delay: 5.2,
  },
];

// ─── Feature pills ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🔍', label: 'Smart Matching' },
  { icon: '✅', label: 'Verified Listings' },
  { icon: '📍', label: 'GPS-Accurate' },
  { icon: '🛡️', label: 'Scam Shield' },
  { icon: '📅', label: 'Visit Booking' },
  { icon: '💬', label: '24/7 Support' },
];

// ─── Capability cards ──────────────────────────────────────────────────────────
const CAPABILITY_CARDS = [
  {
    icon: '🐾',
    title: 'Personalised Matching',
    desc: 'Bella learns your lifestyle, space, and family setup to surface pets that truly fit — not just filter by breed.',
  },
  {
    icon: '🛡️',
    title: 'Zero-Scam Guarantee',
    desc: 'Every listing is cross-verified against our Scam Shield before Bella ever shows it to you.',
  },
  {
    icon: '📅',
    title: 'One-Tap Visit Booking',
    desc: "Bella talks to the shelter's calendar in real time and locks in your slot without any back-and-forth.",
  },
] as const;

// ─── Floating paw SVG ─────────────────────────────────────────────────────────
function Paw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="currentColor">
      <ellipse cx="20" cy="28" rx="10" ry="8" />
      <ellipse cx="10" cy="18" rx="5" ry="6" />
      <ellipse cx="30" cy="18" rx="5" ry="6" />
      <ellipse cx="15" cy="12" rx="4" ry="5" />
      <ellipse cx="25" cy="12" rx="4" ry="5" />
    </svg>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

// ─── Single chat bubble ───────────────────────────────────────────────────────
function ChatBubble({
  msg,
  visible,
  typing,
}: {
  msg: (typeof CHAT_FLOW)[0];
  visible: boolean;
  typing: boolean;
}) {
  const isBella = msg.role === 'bella';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className={cn('flex items-end gap-2 max-w-[88%]', isBella ? 'self-start' : 'self-end flex-row-reverse')}
        >
          {isBella && (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md text-white text-sm font-bold font-display">
              B
            </div>
          )}

          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed shadow-sm',
              isBella
                ? 'bg-white text-brand-text rounded-bl-sm border border-brand-gray/40'
                : 'bg-primary text-white rounded-br-sm'
            )}
          >
            {typing && isBella ? <TypingDots /> : msg.text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main BellaAI Section ─────────────────────────────────────────────────────
export default function BellaAISection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    CHAT_FLOW.forEach((msg, i) => {
      const showDelay = msg.delay * 1000;
      const typingDelay = msg.role === 'bella' ? showDelay - 700 : null;

      if (typingDelay !== null && typingDelay > 0) {
        setTimeout(() => setTypingIndex(i), typingDelay);
      }

      setTimeout(() => {
        setTypingIndex(null);
        setVisibleCount(i + 1);
      }, showDelay + 200);
    });
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-brand-bg overflow-hidden py-24 px-6"
      aria-label="Bella AI Section"
    >
      {[
        { top: '8%', left: '3%', size: 56, rotate: -20, opacity: 0.06 },
        { top: '20%', right: '5%', size: 40, rotate: 30, opacity: 0.07 },
        { bottom: '15%', left: '8%', size: 32, rotate: 10, opacity: 0.05 },
        { bottom: '8%', right: '10%', size: 64, rotate: -15, opacity: 0.06 },
        { top: '50%', left: '50%', size: 80, rotate: 5, opacity: 0.04 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none text-primary"
          style={{ top: p.top, left: p.left, right: (p as any).right, bottom: (p as any).bottom, width: p.size, rotate: p.rotate, opacity: p.opacity }}
          animate={{ y: [0, -10, 0], rotate: [p.rotate, p.rotate + 6, p.rotate] }}
          transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        >
          <Paw />
        </motion.div>
      ))}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-4"
        >
          <span className="w-6 h-px bg-primary" />
          <span className="text-xs font-body font-bold tracking-widest text-primary uppercase">
            Meet Bella AI
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-text font-black leading-tight mb-4 max-w-2xl"
        >
          Your AI companion for{' '}
          <em className="not-italic text-primary">every wag</em>{' '}
          & purr.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-body text-brand-textLight text-lg max-w-xl mb-12"
        >
          Bella isn't a chatbot — she's your personal pet-adoption guide. She
          finds verified matches, books visits, and walks you through every step
          so adopting feels like magic, not paperwork.
        </motion.p>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-4 bg-primary/10 rounded-[2.5rem] blur-2xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl border border-brand-gray/30 overflow-hidden">
                <div className="bg-brand-bgDark/60 px-5 py-3 flex items-center justify-between border-b border-brand-gray/20">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold font-display shadow"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      B
                    </motion.div>
                    <div>
                      <p className="text-xs font-body font-bold text-brand-text">Bella</p>
                      <p className="text-[10px] font-body text-brand-lgreen flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-lgreen inline-block" />
                        Online
                      </p>
                    </div>
                  </div>
                  <Paw className="w-5 h-5 text-primary/40" />
                </div>

                <div className="p-4 flex flex-col gap-3 min-h-[320px] bg-brand-bg/30">
                  {CHAT_FLOW.map((msg, i) => (
                    <ChatBubble
                      key={i}
                      msg={msg}
                      visible={i < visibleCount}
                      typing={typingIndex === i}
                    />
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-brand-gray/20 bg-white flex items-center gap-2">
                  <div className="flex-1 bg-brand-bg rounded-full px-4 py-2 text-xs font-body text-brand-textLighter">
                    Ask Bella anything…
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md text-sm"
                  >
                    ↑
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap gap-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.07, type: 'spring', stiffness: 260, damping: 20 }}
                  whileHover={{ scale: 1.06, y: -2 }}
                  className="flex items-center gap-2 bg-white border border-brand-gray/40 rounded-full px-4 py-2 shadow-sm cursor-default"
                >
                  <span className="text-base">{f.icon}</span>
                  <span className="font-body text-sm font-semibold text-brand-text">{f.label}</span>
                </motion.div>
              ))}
            </div>

            {CAPABILITY_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: 24 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.5 + i * 0.12 }}
                whileHover={{ x: 4 }}
                className="group flex items-start gap-4 bg-white rounded-2xl px-5 py-4 border border-brand-gray/30 shadow-sm"
              >
                <motion.span
                  className="text-2xl mt-0.5 flex-shrink-0"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.6 }}
                >
                  {card.icon}
                </motion.span>
                <div>
                  <p className="font-display font-bold text-brand-text mb-1">{card.title}</p>
                  <p className="font-body text-sm text-brand-textLight leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: '10+', label: 'Happy Adoptions' },
            { value: '98%', label: 'Match Accuracy' },
            { value: '< 2 sec', label: 'Avg. Response Time' },
            { value: '0', label: 'Scams. Ever.' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl px-5 py-5 text-center border border-brand-gray/30 shadow-sm"
            >
              <p className="font-display text-3xl font-black text-primary mb-1">{stat.value}</p>
              <p className="font-body text-xs text-brand-textLighter uppercase tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}