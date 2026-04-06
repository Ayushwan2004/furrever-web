// src/app/(site)/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16 px-[5%] max-w-[720px] mx-auto">
      <h1 className="font-display text-4xl font-black mb-2">Privacy <span className="italic text-primary">Policy</span></h1>
      <p className="text-[#9B6E50] mb-8 text-sm">Last updated: January 2026</p>
      {[
        ['1. Information We Collect','We collect information you provide when registering, listing pets, or submitting adoption applications. This includes name, email address, profile images, and pet-related data.',],
        ['2. How We Use Your Information','Your data is used to facilitate pet adoptions, send notifications, and improve our platform. We never sell your data to third parties.',],
        ['3. Firebase & Data Storage','All data is stored securely in Google Firebase (Firestore). We use Firebase Authentication for secure login. Your data is protected by industry-standard encryption.',],
        ['4. Email Communications','We use EmailJS to send transactional emails such as adoption confirmations, certificates, and important notifications. You may opt out of promotional emails.',],
        ['5. Data Retention','Your account data is retained while your account is active. Deleted pet listings are soft-deleted and retained for 90 days for audit purposes.',],
        ['6. Contact Us','For privacy concerns, contact us at privacy@furrever.app',],
      ].map(([title,body])=>(
        <div key={title as string} className="mb-7">
          <h2 className="font-extrabold text-lg mb-2">{title}</h2>
          <p className="text-[#543e35] leading-[1.8] text-sm">{body}</p>
        </div>
      ))}
    </div>
  );
}
