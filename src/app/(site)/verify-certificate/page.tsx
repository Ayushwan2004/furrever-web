'use client';

import { useState, useRef, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// ─── Firebase Config ────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:             process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:         process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:              process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─── Types ───────────────────────────────────────────────────────────────────
type CertResult = {
  petName: string;
  adopterName: string;
  breed: string;
  category: string;
  color?: string;
  age?: string | number;
  issuedAt: any;
  serialCode: string;
  status: string;
  petImage?: string;
};

type VerifyState = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyCertificatePage() {
  const [certId, setCertId]       = useState('');
  const [email,  setEmail]        = useState('');
  const [state,  setState]        = useState<VerifyState>('idle');
  const [result, setResult]       = useState<CertResult | null>(null);
  const [errorMsg, setErrorMsg]   = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isMounted, setIsMounted] = useState(false); 
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setCertId(id);
  }, []);

  const handleVerify = async () => {
    const trimmedCert  = certId.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedCert || !trimmedEmail) {
      setErrorMsg('Please fill in both fields.');
      setState('error');
      return;
    }
    
    if (!/^CERT-/i.test(trimmedCert)) {
      setErrorMsg('Certificate ID must start with CERT-');
      setState('error');
      return;
    }

    setState('loading');
    setResult(null);

    try {
      const certQ    = query(collection(db, 'certificates'), where('serialCode', '==', trimmedCert));
      const certSnap = await getDocs(certQ);

      if (certSnap.empty) {
        setState('error');
        setErrorMsg('Certificate not found. Check the ID and casing.');
        return;
      }

      const certDoc  = certSnap.docs[0];
      const certData = certDoc.data();
      const adopterId = certData.adopterId;

      let adopterEmail: string | null = null;
      const uSnap = await getDoc(doc(db, 'users', adopterId));
      
      if (uSnap.exists()) {
        adopterEmail = uSnap.data().email?.toLowerCase() ?? null;
      } else {
        const userQ = query(collection(db, 'users'), where('uid', '==', adopterId));
        const userByField = await getDocs(userQ);
        if (!userByField.empty) {
          adopterEmail = userByField.docs[0].data().email?.toLowerCase() ?? null;
        }
      }

      if (!adopterEmail || adopterEmail !== trimmedEmail) {
        setState('error');
        setErrorMsg('Email does not match our records.');
        return;
      }

      setResult({
        petName:     certData.petName,
        adopterName: certData.adopterName,
        breed:       certData.breed,
        category:    certData.category,
        color:       certData.color,
        age:         certData.age,
        issuedAt:    certData.issuedAt,
        serialCode:  certData.serialCode,
        status:      certData.status,
        petImage:    certData.petImage,
      });

      setState('success');
      setShowToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowToast(false), 4000);

    } catch (err) {
      console.error(err);
      setState('error');
      setErrorMsg('Connection error. Please try again.');
    }
  };

  const formatDate = (issuedAt: any) => {
    try {
      const d = issuedAt?.toDate ? issuedAt.toDate() : new Date(issuedAt);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return 'Unknown date'; }
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setCertId('');
    setEmail('');
    setErrorMsg('');
  };

  if (!isMounted) return null;

  return (
    <>
      <div className={`verified-toast ${showToast ? 'show' : ''}`}>
        <div className="toast-inner">
          <svg className="checkmark-svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14 27l8 8 16-16" />
          </svg>
          <div>
            <p className="toast-title">Certificate Verified!</p>
            <p className="toast-sub">This adoption is officially on record 🐾</p>
          </div>
        </div>
      </div>

      <main className="verify-page">
        <div className="verify-container">
          <div className="verify-header">
            <h2 className="brand-logo">FurrEver</h2>
            <p className="verify-eyebrow">Certificate Verification</p>
            <h1 className="verify-title">Verify an Adoption Certificate</h1>
            <p className="verify-subtitle">
              Enter the Certificate ID and the adopter's email to confirm authenticity.
            </p>
          </div>

          <div className="verify-card">
            {state !== 'success' ? (
              <div className="form-body">
                <div className="field">
                  <label>Certificate ID</label>
                  <div className="input-wrap">
                    <span className="input-icon">🔖</span>
                    <input
                      type="text"
                      placeholder="CERT-WPA2..."
                      value={certId}
                      onChange={e => { setCertId(e.target.value); setState('idle'); }}
                      onKeyDown={e => e.key === 'Enter' && handleVerify()}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Adopter's Email</label>
                  <div className="input-wrap">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      placeholder="adopter@email.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setState('idle'); }}
                      onKeyDown={e => e.key === 'Enter' && handleVerify()}
                    />
                  </div>
                </div>

                {state === 'error' && <div className="error-banner"><span>⚠️</span> {errorMsg}</div>}

                <button className="verify-btn" onClick={handleVerify} disabled={state === 'loading'}>
                  {state === 'loading' ? <span className="spinner" /> : "Verify Certificate 🐾"}
                </button>
              </div>
            ) : (
              <div className="result-body">
                <div className="result-badge">
                  <span className="result-badge-text">✓ Verified & Authentic</span>
                </div>

                {result?.petImage && (
                  <img src={result.petImage} alt={result.petName} className="result-pet-img" />
                )}

                <h2 className="result-pet-name">{result?.petName}</h2>
                <p className="result-adopted-by">Adopted by <strong>{result?.adopterName}</strong></p>

                <div className="result-grid">
                  <div className="result-cell"><span className="cell-label">Breed</span><span className="cell-value">{result?.breed}</span></div>
                  <div className="result-cell"><span className="cell-label">Category</span><span className="cell-value">{result?.category}</span></div>
                  <div className="result-cell"><span className="cell-label">Color</span><span className="cell-value">{result?.color || '—'}</span></div>
                  <div className="result-cell"><span className="cell-label">Age</span><span className="cell-value">{result?.age || '1 yr'}</span></div>
                  <div className="result-cell wide"><span className="cell-label">Issued On</span><span className="cell-value">{formatDate(result?.issuedAt)}</span></div>
                  <div className="result-cell wide"><span className="cell-label">Certificate ID</span><span className="cell-value mono">{result?.serialCode}</span></div>
                </div>

                <button className="reset-btn" onClick={reset}>Verify Another</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .verify-page { 
            min-height: 100vh; 
            background: #FFF9F0; 
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: flex-start;
            padding: 100px 24px; 
            color: #1b1a18;
        }
        .verify-container { width: 100%; max-width: 520px; text-align: center; }
        .brand-logo { font-family: 'Fraunces', serif; color: #f4a900; font-size: 2.2rem; font-weight: 900; margin-bottom: 20px; }
        .verify-eyebrow { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; color: #888; margin-bottom: 8px; font-weight: 700; }
        .verify-title { font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 900; line-height: 1.2; margin-bottom: 12px; }
        .verify-subtitle { color: #666; font-size: 0.95rem; margin-bottom: 40px; }
        
        .verify-card { 
            background: #fff; 
            border-radius: 28px; 
            padding: 40px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.04); 
            border: 1px solid #f0f0f0;
        }

        .form-body { display: flex; flex-direction: column; gap: 20px; text-align: left; }
        .field label { font-size: 0.75rem; font-weight: 800; color: #888; text-transform: uppercase; margin-bottom: 8px; display: block; }
        .input-wrap { display: flex; align-items: center; background: #fafafa; border: 1.5px solid #eee; border-radius: 16px; padding: 0 16px; transition: 0.2s; }
        .input-wrap:focus-within { border-color: #f4a900; background: #fff; }
        .input-wrap input { flex: 1; border: none; outline: none; background: transparent; padding: 16px 0; font-size: 1rem; font-weight: 600; }
        
        .verify-btn { 
            width: 100%; padding: 18px; border-radius: 16px; border: none; 
            background: #f4a900; color: #1b1a18; font-weight: 900; font-size: 1rem;
            cursor: pointer; margin-top: 10px; box-shadow: 0 10px 20px rgba(244,169,0,0.2);
        }

        .result-body { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .result-badge { background: #e8f5e9; color: #2e7d32; padding: 8px 20px; border-radius: 30px; font-weight: 800; font-size: 0.85rem; }
        .result-pet-img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 5px solid #f4a900; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .result-pet-name { font-family: 'Fraunces', serif; font-size: 1.8rem; font-weight: 900; margin: 0; }
        .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; text-align: left; margin-top: 10px; }
        .result-cell { background: #f8f8f8; padding: 14px; border-radius: 14px; }
        .result-cell.wide { grid-column: span 2; }
        .cell-label { font-size: 0.65rem; color: #999; text-transform: uppercase; display: block; margin-bottom: 2px; font-weight: 700; }
        .cell-value { font-weight: 700; font-size: 0.95rem; color: #333; }
        .mono { font-family: monospace; font-size: 0.85rem; }

        .reset-btn { background: none; border: 1.5px solid #eee; padding: 12px 24px; border-radius: 12px; cursor: pointer; color: #888; font-weight: 700; }
        .error-banner { background: #fff0f0; color: #d32f2f; padding: 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; width: 100%; }
        
        .verified-toast {
          position: fixed; top: 20px; right: 20px; transform: translateX(120%);
          transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 1000;
        }
        .verified-toast.show { transform: translateX(0); }
        .toast-inner { background: #fff; padding: 16px 24px; border-radius: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-left: 5px solid #4caf50; }
        .toast-title { font-weight: 900; color: #2e7d32; margin: 0; }
        .toast-sub { font-size: 0.8rem; color: #666; margin: 0; }
      `}</style>
    </>
  );
}