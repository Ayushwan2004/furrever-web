'use client';
// src/components/landing/Navbar.tsx
// CHANGED: Added mobile hamburger menu, sticky on all screen sizes, fully responsive
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 3.5 }}
        className={`fixed top-0 left-0 right-0 z-[500] transition-all duration-300
          ${scrolled
            ? 'bg-[#fdf4e3]/95 backdrop-blur-md shadow-[0_4px_24px_rgba(244,169,0,.12)]'
            : 'bg-transparent'
          }`}
        ref={menuRef}
      >
        <div className="flex items-center justify-between px-[5%] h-[68px] max-w-[1400px] mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl font-black text-[#1b1a18] flex-shrink-0"
            onClick={() => setMenuOpen(false)}
          >
            🐾 Furr<span className="text-primary">Ever</span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            {links.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-bold text-sm text-[#543e35] hover:text-[#1b1a18] transition-colors relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin-login"
                className="font-extrabold text-sm bg-primary text-[#1b1a18] px-5 py-2.5 rounded-full shadow-[3px_3px_0_#d98b19] hover:shadow-[5px_5px_0_#d98b19] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                Admin Login
              </Link>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-xl hover:bg-[#f0e8d5] transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <motion.span
              className="block w-5 h-0.5 bg-[#1b1a18] rounded-full origin-center"
              animate={menuOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.span
              className="block w-5 h-0.5 bg-[#1b1a18] rounded-full"
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block w-5 h-0.5 bg-[#1b1a18] rounded-full origin-center"
              animate={menuOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
            />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden bg-[#fdf4e3]/98 backdrop-blur-md border-t border-[#f0e8d5]"
            >
              <ul className="flex flex-col px-[5%] py-4 gap-1 list-none">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center font-bold text-base text-[#543e35] hover:text-[#1b1a18] hover:bg-[#f0e8d5] px-4 py-3 rounded-xl transition-all"
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: links.length * 0.05 }}
                  className="mt-2 pt-2 border-t border-[#f0e8d5]"
                >
                  <Link
                    href="/admin-login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center font-extrabold text-sm bg-primary text-[#1b1a18] px-5 py-3 rounded-xl shadow-[3px_3px_0_#d98b19] hover:shadow-[5px_5px_0_#d98b19] transition-all"
                  >
                    Admin Login
                  </Link>
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[499] bg-black/20 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}