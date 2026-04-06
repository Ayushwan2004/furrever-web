'use client';
// src/components/shared/Toaster.tsx
import { Toaster as HotToaster } from 'react-hot-toast';
export default function Toaster() {
  return (
    <HotToaster position="bottom-right" toastOptions={{
      style: { background:'#1b1a18', color:'#fff', fontFamily:'Nunito,sans-serif', fontWeight:700, borderRadius:14, fontSize:'.88rem' },
      success:{ iconTheme:{ primary:'#f4a900', secondary:'#1b1a18' } },
      error:  { iconTheme:{ primary:'#E52020', secondary:'#fff' } },
    }}/>
  );
}
