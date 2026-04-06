// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Toaster from '@/components/shared/Toaster';
import Cursor from '@/components/shared/Cursor';

export const metadata: Metadata = {
  title: 'FurrEver – Find Your Forever Friend',
  description: 'Adopt adorable pets and give them their forever home.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Cursor />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
