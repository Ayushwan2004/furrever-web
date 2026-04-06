// src/app/(site)/page.tsx
import SplashScreen from '@/components/landing/SplashScreen';
import HeroSection from '@/components/landing/HeroSection';
import MarqueeBar from '@/components/landing/MarqueeBar';
// import BellaAISection from '@/components/landing/BellaAISection';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import CtaSection from '@/components/landing/CtaSection';
import BellaAISection from '@/components/landing/Bellaaisection';

export default function HomePage() {
  return (
    <>
      <SplashScreen />
      <HeroSection />
      <MarqueeBar />
      <BellaAISection />
      <HowItWorks />
      <Testimonials />
      <CtaSection />
    </>
  );
}