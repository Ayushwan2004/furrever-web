// src/lib/email.ts
// Uses Resend REST API directly via fetch — avoids @react-email/render peer dep issue
// Compatible with Next.js 14.x — SERVER SIDE ONLY (API routes only, never 'use client')

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM = 'FurrEver <onboarding@resend.dev>'; // Use this until domain verified
// After domain verification change to: 'FurrEver <noreply@myfurrever.vercel.app>'
const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://furrever.netlify.app/';

// ─── Raw Resend REST call — no SDK needed ──────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!RESEND_API_KEY || RESEND_API_KEY === 're_your_resend_api_key_here') {
    console.warn('[Email] RESEND_API_KEY not set — skipping email send');
    return { id: 'skipped', message: 'No API key configured' };
  }

  const body: any = { from: FROM, to, subject, html };
  if (replyTo) body.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Resend error ${res.status}`);
  }
  return data;
}

// ─── Shared HTML shell ─────────────────────────────────────────────────────────
function shell(accentColor: string, headerIcon: string, headerLabel: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f0e8;color:#1b1a18}
    .wrap{max-width:580px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.08)}
    .header{background:${accentColor};padding:28px 36px;display:flex;align-items:center;gap:12px}
    .header-icon{font-size:28px}
    .header-label{font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#1b1a18}
    .body{padding:36px}
    .footer{background:#fdf4e3;padding:18px 36px;font-size:11px;color:#9B6E50;text-align:center}
    a.btn{display:inline-block;padding:14px 28px;border-radius:50px;font-weight:800;font-size:14px;text-decoration:none;margin-top:24px}
    .box{background:#fdf4e3;border:2px solid #f0e8d5;border-radius:14px;padding:20px;margin:20px 0}
    .box-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#9B6E50;margin-bottom:6px}
    .box-value{font-size:22px;font-weight:900;color:#1b1a18;font-family:monospace}
    .box-sub{font-size:12px;color:#9B6E50;margin-top:4px}
    h2{font-size:22px;font-weight:900;margin-bottom:12px}
    p{font-size:15px;line-height:1.65;color:#543e35;margin-bottom:12px}
    .reason-box{border-radius:12px;padding:14px 18px;margin:16px 0;font-size:13px;font-weight:700;background:#fff5f5;border:1px solid #fecdd3;color:#1b1a18}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <span class="header-icon">${headerIcon}</span>
      <div>
        <div style="font-size:20px;font-weight:900;">🐾 FurrEver</div>
        <div class="header-label">${headerLabel}</div>
      </div>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">© ${new Date().getFullYear()} FurrEver &nbsp;·&nbsp; <a href="${SITE}" style="color:#9B6E50">${SITE}</a></div>
  </div>
</body>
</html>`;
}

// ─── Email templates ───────────────────────────────────────────────────────────
export const emailService = {

  // Admin invite — sent from /api/admin/invites route
  adminInvite: (toEmail: string, inviterName: string, code: string, role: string, url: string) =>
    sendEmail(toEmail, "You've Been Invited to FurrEver Admin ✉️", shell(
      '#F4A900', '✉️', 'Admin Invitation',
      `<h2>You've been invited! 👋</h2>
       <p><strong>${inviterName}</strong> has invited you to join the <strong>FurrEver Admin Panel</strong> as a <strong>${role}</strong>.</p>
       <div class="box">
         <div class="box-title">Your Invite Code</div>
         <div class="box-value">${code}</div>
         <div class="box-sub">⏰ Expires in 7 days</div>
       </div>
       <p>Click the button below to accept your invitation and activate your admin access.</p>
       <a href="${url}" class="btn" style="background:#F4A900;color:#1b1a18;">Accept Invitation →</a>
       <p style="margin-top:18px;font-size:12px;color:#9B6E50">Or copy this link:<br/><a href="${url}" style="color:#F4A900">${url}</a></p>`
    )),

  // Promo email — sent from /api/promo route
  promo: (toEmail: string, toName: string, subject: string, bodyText: string) =>
    sendEmail(toEmail, subject, shell(
      '#F4A900', '📣', 'FurrEver Update',
      `<h2>${subject}</h2>
       <p>Hi <strong>${toName}</strong>,</p>
       <p style="white-space:pre-wrap">${bodyText}</p>
       <a href="${SITE}" class="btn" style="background:#F4A900;color:#1b1a18;">Browse Pets →</a>`
    )),

  // Account terminated — sent from /api/users/[uid]/terminate route
  terminate: (toEmail: string, toName: string, reason: string) =>
    sendEmail(toEmail, 'Your FurrEver Account Has Been Suspended', shell(
      '#dc2626', '🚫', 'Account Notice',
      `<h2>Account Suspended 🚫</h2>
       <p>Dear <strong>${toName}</strong>,</p>
       <p>Your FurrEver account has been suspended by our moderation team for violating our Community Guidelines.</p>
       <div class="reason-box">
         <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#dc2626;margin-bottom:6px">Reason</div>
         <div>${reason}</div>
       </div>
       <p>If you believe this is a mistake, please contact our support team.</p>
       <a href="${SITE}/contact" class="btn" style="background:#dc2626;color:#fff;">Contact Support →</a>`
    )),

  // Pet removed — sent from /api/pets/[id] DELETE route
  petRemoved: (toEmail: string, toName: string, petName: string, reason: string) =>
    sendEmail(toEmail, `Your Pet "${petName}" Has Been Removed — FurrEver`, shell(
      '#ea580c', '🗑️', 'Listing Notice',
      `<h2>Listing Removed 🗑️</h2>
       <p>Dear <strong>${toName}</strong>,</p>
       <p>Your pet listing for <strong>${petName}</strong> has been removed from FurrEver.</p>
       <div class="reason-box" style="background:#fff7ed;border-color:#fed7aa">
         <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#ea580c;margin-bottom:6px">Reason</div>
         <div>${reason}</div>
       </div>
       <a href="${SITE}/contact" class="btn" style="background:#ea580c;color:#fff;">Contact Us →</a>`
    )),

  // Adoption certificate
  certificate: (toEmail: string, toName: string, petName: string, certId: string, message: string) =>
    sendEmail(toEmail, `🏆 Your FurrEver Certificate for ${petName}!`, shell(
      '#d98b19', '🏆', 'Adoption Certificate',
      `<h2>Congratulations, ${toName}! 🎉</h2>
       <p>Your adoption of <strong>${petName}</strong> has been officially approved and recorded on FurrEver.</p>
       <div class="box" style="border-color:#F4A900">
         <div class="box-title">Certificate ID</div>
         <div class="box-value">${certId}</div>
         <div class="box-sub">${petName}</div>
       </div>
       <p>${message}</p>
       <p>Welcome to the FurrEver family! Every pet deserves a forever home. 🐶❤️</p>
       <a href="${SITE}" class="btn" style="background:#F4A900;color:#1b1a18;">Open FurrEver →</a>`
    )),

  // Contact form submission — to admin inbox
  contactForm: (name: string, email: string, subject: string, message: string) =>
    sendEmail('furrever@zohomail.in', `New Message from ${name} — FurrEver`, shell(
      '#F4A900', '📬', 'Contact Form',
      `<h2>New Contact Message 📬</h2>
       <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
       <p><strong>Subject:</strong> ${subject}</p>
       <div class="box">
         <div class="box-title">Message</div>
         <p style="margin-top:8px;white-space:pre-wrap">${message}</p>
       </div>
       <p style="font-size:12px;color:#9B6E50">Reply directly to this email to respond to ${name}.</p>`
    ), email /* replyTo */),

  // Adoption decision (approved/rejected) — optional email notification
  decision: (toEmail: string, toName: string, decision: string, petName: string, message: string) => {
    const approved = decision === 'approved';
    return sendEmail(
      toEmail,
      `Update on Your Adoption for ${petName} — FurrEver`,
      shell(
        approved ? '#16a34a' : '#dc2626',
        '🤝', 'Adoption Update',
        `<h2>${approved ? '🎉 Adoption Approved!' : 'Application Update'}</h2>
         <p>Dear <strong>${toName}</strong>,</p>
         <p>We have an update on your adoption request for <strong>${petName}</strong>.</p>
         <div class="box" style="border-color:${approved ? '#16a34a' : '#dc2626'}">
           <div class="box-title">Decision</div>
           <div class="box-value" style="color:${approved ? '#16a34a' : '#dc2626'}">${decision.toUpperCase()}</div>
           <div class="box-sub">${petName}</div>
         </div>
         <p>${message}</p>
         <a href="${SITE}" class="btn" style="background:#F4A900;color:#1b1a18;">Open FurrEver →</a>`
      )
    );
  },
};