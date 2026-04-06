# 🐾 FurrEver Web — Complete Setup Guide

## Prerequisites

Before starting, make sure you have these installed:

| Tool | Version | Check | Install |
|------|---------|-------|---------|
| Node.js | 18.17+ | `node --version` | https://nodejs.org |
| npm | 9+ | `npm --version` | Comes with Node |
| Git | Any | `git --version` | https://git-scm.com |

---

## Step 1: Place the Project

Put this folder as a **sibling** to your React Native project:

```
my-workspace/
├── furrever-app/        ← your React Native project (existing)
└── furrever-web/        ← THIS project (unzip here)
```

> ✅ Do NOT put furrever-web inside the React Native project.  
> Both share the same Firebase project but are completely separate apps.

---

## Step 2: Install Dependencies

```bash
# Navigate to the project
cd furrever-web

# Install all packages
npm install
```

This installs: Next.js 14, Firebase, GSAP, Framer Motion, Recharts, EmailJS, Tailwind, and all other dependencies.

---

## Step 3: Configure Environment Variables

The `.env.local` file is already created. You need to fill in 3 sections:

### 3A. Firebase Admin SDK (REQUIRED for backend API routes)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **furrever-expo**
3. Click ⚙️ **Project Settings** (gear icon, top left)
4. Click **"Service Accounts"** tab
5. Click **"Generate new private key"** → Download the JSON file
6. Open the downloaded JSON and copy these values into `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=furrever-expo
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@furrever-expo.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nABC123...\n-----END RSA PRIVATE KEY-----\n"
```

> ⚠️ For the private key: Copy the entire key from the JSON.  
> Replace actual newlines with `\n` so it's one long string in the .env file.  
> Keep the outer quotes.

### 3B. EmailJS (REQUIRED for sending emails)

1. Go to [emailjs.com](https://www.emailjs.com) → Create free account
2. Go to **Email Services** → Add New Service → Connect Gmail/Outlook/etc → Note the **Service ID**
3. Go to **Email Templates** → Create these 6 templates:

**Template: `template_contact`** (Contact form)
```
Subject: New Contact from {{from_name}}
Body: Name: {{from_name}}, Email: {{from_email}}, Subject: {{subject}}, Message: {{message}}
```

**Template: `template_certificate`** (Adoption certificate)
```
Subject: 🏆 Your FurrEver Certificate for {{pet_name}}
Body: Dear {{to_name}}, Your certificate ({{cert_id}}) for {{pet_name}} is ready! {{message}}
```

**Template: `template_promo`** (Promotional)
```
Subject: {{subject}}
Body: Hi {{to_name}}, {{body}}
```

**Template: `template_terminate`** (Account termination)
```
Subject: Your FurrEver Account Update
Body: Dear {{to_name}}, Your account has been reviewed. Reason: {{reason}}
```

**Template: `template_invite`** (Admin invite)
```
Subject: You're invited to FurrEver Admin
Body: Hi! {{inviter_name}} has invited you as {{role}}. Code: {{invite_code}}. URL: {{invite_url}}
```

**Template: `template_decision`** (Adoption decision)
```
Subject: Update on your adoption request for {{pet_name}}
Body: Dear {{to_name}}, Your request was: {{decision}}. Reason: {{reason}}
```

4. Go to **Account** → **API Keys** → Copy your **Public Key**
5. Fill in `.env.local`:

```env
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_CONTACT=template_contact
NEXT_PUBLIC_EMAILJS_TEMPLATE_CERTIFICATE=template_certificate
NEXT_PUBLIC_EMAILJS_TEMPLATE_PROMO=template_promo
NEXT_PUBLIC_EMAILJS_TEMPLATE_TERMINATE=template_terminate
NEXT_PUBLIC_EMAILJS_TEMPLATE_INVITE=template_invite
NEXT_PUBLIC_EMAILJS_TEMPLATE_DECISION=template_decision
```

### 3C. App URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APK_URL=https://your-link.com/furrever.apk
```

---

## Step 4: Create Your First Admin User

Since there are no hardcoded credentials, you set up admin access in Firebase:

### 4A. Create Firebase Auth account
1. Firebase Console → **Authentication** → **Users** tab
2. Click **"Add user"**
3. Enter email and password (e.g. `admin@furrever.app` / strong password)
4. Copy the **User UID** shown in the users list

### 4B. Create Firestore user document
1. Firebase Console → **Firestore Database**
2. Click **"Start collection"** → Collection ID: `users`
3. Document ID: paste the UID you copied
4. Add these fields:

```
uid         (string)  →  paste the UID
email       (string)  →  admin@furrever.app
name        (string)  →  Your Name
role        (string)  →  admin
petPostIds  (array)   →  (leave empty)
favorites   (array)   →  (leave empty)
adoptedPets (array)   →  (leave empty)
emailVerified (boolean) → true
createdAt   (timestamp) → click "server timestamp"
```

---

## Step 5: Run the Project

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- **Public website**: http://localhost:3000
- **Admin login**: http://localhost:3000/admin/login
- **Admin dashboard**: http://localhost:3000/admin/dashboard (after login)

---

## Step 6: Build for Production

```bash
npm run build
npm start
```

---

## Step 7: Deploy to Vercel

### Option A: Vercel CLI (recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy from project root
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Framework: Next.js (auto-detected)
# - Root Directory: ./  (default)
```

### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your Git repository
3. Framework: **Next.js** (auto-detected)
4. Root Directory: `furrever-web` (if it's in a monorepo)

### Add Environment Variables in Vercel

Go to your project → **Settings** → **Environment Variables** and add ALL variables from `.env.local`.

> ⚠️ **Important for FIREBASE_ADMIN_PRIVATE_KEY in Vercel:**  
> In Vercel's UI, paste the private key with **actual newlines** (not `\n`).  
> Copy directly from the downloaded JSON service account file.

---

## Project Structure Reference

```
furrever-web/
├── .env.local              ← Your secrets (NEVER commit this)
├── .env.example            ← Template (safe to commit)
├── package.json            ← Dependencies
├── next.config.js          ← Next.js config
├── tailwind.config.js      ← Tailwind + custom colors/fonts
└── src/
    ├── app/
    │   ├── globals.css         ← Global styles, FurrEver tokens
    │   ├── layout.tsx          ← Root layout with AuthProvider
    │   ├── (site)/             ← PUBLIC website routes
    │   │   ├── page.tsx        ← Homepage (/)
    │   │   ├── about/          ← /about
    │   │   ├── contact/        ← /contact
    │   │   └── privacy/        ← /privacy
    │   ├── (admin)/admin/      ← ADMIN PANEL (guarded)
    │   │   ├── login/          ← /admin/login
    │   │   ├── dashboard/      ← /admin/dashboard
    │   │   ├── users/          ← /admin/users
    │   │   ├── pets/           ← /admin/pets
    │   │   ├── adoptions/      ← /admin/adoptions
    │   │   ├── certifications/ ← /admin/certifications
    │   │   ├── messages/       ← /admin/messages
    │   │   ├── notifications/  ← /admin/notifications
    │   │   ├── promo/          ← /admin/promo
    │   │   ├── invite/         ← /admin/invite
    │   │   ├── analytics/      ← /admin/analytics
    │   │   └── accept-invite/  ← /admin/accept-invite?code=XXX
    │   └── api/                ← BACKEND API ROUTES
    │       ├── pets/           ← POST, PATCH, DELETE
    │       ├── users/[uid]/    ← terminate, restore
    │       ├── adoptions/[id]/ ← status, cancel
    │       ├── certifications/ ← issue, revoke
    │       ├── contacts/       ← submit, delete, mark-read
    │       ├── notifications/  ← broadcast send
    │       ├── promo/          ← send promo emails
    │       └── admin/invites/  ← create, accept, revoke
    ├── components/
    │   ├── admin/
    │   │   ├── DataTable.tsx   ← Search + Sort + Filter + Pagination table
    │   │   └── AdminShared.tsx ← Modal, Badge, Avatar, MetricCard, etc.
    │   ├── landing/            ← All homepage components
    │   └── shared/             ← Cursor, PetIllustrators, Toaster
    ├── context/
    │   └── AuthContext.tsx     ← Firebase auth + realtime user listener
    ├── hooks/
    │   └── useRealtime.ts      ← onSnapshot hooks for all collections
    ├── lib/
    │   ├── firebase/
    │   │   ├── client.ts       ← Client Firebase (auth, db, storage)
    │   │   └── admin.ts        ← Server Firebase Admin SDK
    │   ├── api.ts              ← All fetch() helpers (frontend → API routes)
    │   ├── email.ts            ← EmailJS wrapper functions
    │   └── apiMiddleware.ts    ← verifyAdmin() + response helpers
    ├── types/index.ts          ← All TypeScript types (mirrors RN types.ts)
    └── utils/index.ts          ← cn(), fmtDate(), statusColor(), etc.
```

---

## Troubleshooting

### ❌ "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin
```

### ❌ Admin login says "Access denied"
- Check the Firestore `users/{uid}` document has `role: "admin"`
- Make sure the UID in Firestore matches the Firebase Auth UID exactly

### ❌ "FIREBASE_ADMIN_PRIVATE_KEY: invalid"
- The private key must have `\n` where newlines are
- Wrap in double quotes in `.env.local`
- Example: `FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN...\nline2\n...-----END-----\n"`

### ❌ Realtime data not loading
- Check browser console for Firestore permission errors
- Add Firestore Security Rules (see README.md)
- Ensure you're logged in as admin before viewing admin pages

### ❌ EmailJS not sending
- Check Public Key in `.env.local` matches emailjs.com account
- Verify template IDs match exactly
- Check EmailJS free plan limits (200 emails/month)

### ❌ TypeScript errors on build
```bash
# Skip type checking for quick build
npm run build -- --no-lint
```

---

## Firestore Security Rules

Add these in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /pets/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /adoptions/{id} {
      allow read, write: if request.auth != null;
    }
    match /notifications/{id} {
      allow read: if request.auth != null &&
        (resource.data.receiverId == request.auth.uid ||
         resource.data.receiverId == 'ALL');
      allow write: if request.auth != null;
    }
    match /certifications/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /contacts/{id} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }
    match /adminInvites/{id} {
      allow read, write: if request.auth != null;
    }
    match /promoEmails/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Key Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
vercel           # Deploy to Vercel
```

---

*Made with ❤️ for FurrEver — every pet deserves a forever home 🐾*
