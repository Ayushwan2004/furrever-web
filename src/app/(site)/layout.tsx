// src/app/(site)/layout.tsx
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
