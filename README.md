# 🐾 FurrEver Web — Next.js Admin Dashboard

Production-grade Next.js website + admin panel for the FurrEver pet adoption platform.

## 🗂 Project Structure (How to Integrate)

```
my-workspace/                        ← your root parent folder
├── furrever-app/                    ← React Native mobile app (existing)
│   ├── app/
│   ├── context/
│   ├── firebase.config.ts
│   └── ...
└── furrever-web/                    ← THIS project (new, sibling folder)
    ├── src/
    ├── .env.local
    └── package.json
```

> **✅ Answer: YES — put `furrever-web` as a sibling folder alongside your React Native project, NOT inside it.**  
> They share the same Firebase project but are completely independent apps.  
> `furrever-web` deploys to Vercel. React Native builds for Android/iOS.

---

## 🚀 Quick Start

```bash
cd furrever-web
npm install
# Fill in .env.local (see below)
npm run dev
```

Visit `http://localhost:3000`

---

## ⚙️ Environment Setup

### Step 1: Firebase Admin SDK (CRITICAL)

The admin panel makes all Firestore writes through **server-side API routes** — not the browser.  
This requires a Firebase Admin SDK service account.

1. Go to **Firebase Console** → `furrever-expo` project
2. Click ⚙️ **Project Settings** → **Service Accounts**
3. Click **"Generate New Private Key"** → Download the JSON file
4. Copy values into `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=furrever-expo
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@furrever-expo.iam.gserviceaccount.com
# Paste the entire private key, replacing real newlines with \n:
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n"
```

### Step 2: Create the First Admin User

Since there are no hardcoded credentials, you create admin access via Firebase:

1. **Firebase Console → Authentication** → Add User (email/password)
2. **Firestore Console** → Create document at `users/{uid}`:
   ```json
   {
     "uid": "the-firebase-auth-uid",
     "email": "admin@yourapp.com",
     "name": "Your Name",
     "role": "admin",
     "petPostIds": [],
     "favorites": [],
     "adoptedPets": [],
     "emailVerified": true,
     "createdAt": "SERVER_TIMESTAMP"
   }
   ```
3. Login at `http://localhost:3000/admin/login`

### Step 3: EmailJS Setup

1. Create account at [emailjs.com](https://emailjs.com)
2. Create an Email Service (Gmail, SendGrid, etc.)
3. Create these templates:
   - `template_contact` — Contact form
   - `template_certificate` — Adoption certificate
   - `template_promo` — Promotional email
   - `template_terminate` — Account termination
   - `template_invite` — Admin invite
   - `template_decision` — Adoption decision

Each template uses variables like `{{to_email}}`, `{{to_name}}`, etc.

---

## 📁 Architecture Overview

```
src/
├── app/
│   ├── (site)/                 ← Public website (landing, about, contact, privacy)
│   │   ├── layout.tsx          ← Navbar + Footer wrapper
│   │   ├── page.tsx            ← Homepage
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── privacy/page.tsx
│   │
│   ├── (admin)/admin/          ← Admin panel (route-guarded)
│   │   ├── layout.tsx          ← Sidebar + auth guard
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx  ← Live stats + charts
│   │   ├── users/page.tsx      ← CRUD + terminate
│   │   ├── pets/page.tsx       ← CRUD + admin removal
│   │   ├── adoptions/page.tsx  ← Status management
│   │   ├── certifications/     ← Issue + revoke certs
│   │   ├── messages/page.tsx   ← Contact inbox
│   │   ├── notifications/      ← Broadcast push
│   │   ├── promo/page.tsx      ← Promo email campaigns
│   │   ├── invite/page.tsx     ← Admin invite system
│   │   ├── analytics/page.tsx  ← Charts + metrics
│   │   └── accept-invite/      ← Invite acceptance flow
│   │
│   └── api/                    ← Backend API routes (Firestore via Admin SDK)
│       ├── pets/               ← GET (realtime client), POST, PATCH, DELETE
│       ├── users/[uid]/        ← terminate, restore
│       ├── adoptions/[id]/     ← status, cancel
│       ├── certifications/     ← POST (issue), [id]/revoke
│       ├── contacts/           ← POST (public), GET, DELETE, [id]/read
│       ├── notifications/      ← POST broadcast
│       ├── admin/invites/      ← GET, POST, [id] DELETE, accept
│       └── promo/              ← GET, POST (batch recipients)
│
├── components/
│   ├── admin/
│   │   ├── DataTable.tsx       ← Reusable table: search + sort + filter + pagination
│   │   └── AdminShared.tsx     ← Topbar, MetricCard, Modal, Badge, Avatar, ActionBtn
│   ├── landing/                ← All public page components
│   └── shared/                 ← Cursor, PetIllustrators, Toaster
│
├── context/
│   └── AuthContext.tsx         ← Firebase auth + realtime user doc listener
│
├── hooks/
│   └── useRealtime.ts          ← onSnapshot hooks for all collections
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts           ← Client-side Firebase (Auth, Firestore, Storage)
│   │   └── admin.ts            ← Server-side Firebase Admin SDK
│   ├── api.ts                  ← All fetch() calls to API routes
│   ├── email.ts                ← EmailJS wrapper for all email types
│   └── apiMiddleware.ts        ← verifyAdmin() + response helpers
│
├── types/index.ts              ← All types matching React Native types.ts
└── utils/index.ts              ← cn(), fmtDate(), statusColor(), etc.
```

---

## 🔥 Realtime Data Flow

```
Firestore Database
      │
      │ onSnapshot listeners (client-side)
      ▼
useRealtime.ts hooks
      │
      │ Provides live data to React state
      ▼
Admin UI components
      │
      │ User actions (approve, terminate, etc.)
      ▼
src/lib/api.ts fetch() calls
      │
      │ Sends Firebase ID token in Authorization header
      ▼
Next.js API Routes (/api/...)
      │
      │ verifyAdmin() checks token + Firestore role
      ▼
Firebase Admin SDK (server-side)
      │
      │ Writes to Firestore with adminDecision fields
      ▼
Firestore Database (updated)
      │
      │ onSnapshot fires automatically
      ▼
Admin UI updates in real time 🎉
```

---

## 📱 Mobile App Integration

The web admin writes to the same Firestore collections the mobile app reads.

**In-app notifications** work automatically:
- Admin issues certificate → API writes to `notifications` collection with `receiverId: adopterId`
- Mobile app's existing `onSnapshot` listener on `notifications` (filtered by current user UID) receives it
- Mobile app shows notification

**No changes needed in the React Native app** — the notification structure matches `NotificationType` exactly.

---

## 🗄 Firestore Collections Used

| Collection      | Purpose |
|----------------|---------|
| `users`         | User accounts (matches AuthContext) |
| `pets`          | Pet listings (matches PetContext) |
| `adoptions`     | Adoption applications (matches AdoptionContext) |
| `certifications`| Issued certificates |
| `notifications` | In-app + broadcast notifications |
| `contacts`      | Contact form submissions |
| `adminInvites`  | Pending/accepted admin invites |
| `promoEmails`   | Promo email history |

---

## 🆕 New Firestore Fields Added by Admin

These fields are added to existing documents when admin takes action:

### users collection (new fields):
```json
{
  "adminStatus": "terminated | active | suspended",
  "adminDecision": "Reason for the decision",
  "adminDecisionBy": "admin-uid",
  "adminDecisionAt": "Timestamp",
  "adminRole": "admin | editor | viewer"
}
```

### pets collection (new fields):
```json
{
  "adminRemoved": true,
  "adminRemovedReason": "Reason",
  "adminRemovedBy": "admin-uid",
  "adminRemovedAt": "Timestamp"
}
```

### adoptions collection (new fields):
```json
{
  "adminDecision": "Status changed to approved by admin",
  "adminDecisionBy": "admin-uid",
  "adminDecisionAt": "Timestamp"
}
```

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From furrever-web directory:
vercel

# Add environment variables in Vercel Dashboard:
# Settings → Environment Variables
# Add all variables from .env.local
# IMPORTANT: FIREBASE_ADMIN_PRIVATE_KEY — paste with real \n characters
```

**Vercel Environment Variables tip for private key:**  
In Vercel dashboard, paste the key exactly as it appears in the JSON file (with real newlines, not `\n`). The code handles both formats.

---

## 🔒 Security Model

1. **Client-side**: Firebase Auth token in every API request
2. **Server-side**: `verifyAdmin()` validates token + checks `role === 'admin'` in Firestore
3. **No hardcoded credentials** — all auth via Firebase
4. **Terminated users** cannot log in (Firebase Auth `disabled: true`)
5. **Firestore Security Rules** (add to Firebase Console):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null; // for adoption lookups
    }
    // Pets — public read, owner write
    match /pets/{petId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Adoptions — participants only
    match /adoptions/{adoptionId} {
      allow read, write: if request.auth != null;
    }
    // Notifications — receiver only
    match /notifications/{notifId} {
      allow read: if request.auth != null && 
        (resource.data.receiverId == request.auth.uid || resource.data.receiverId == 'ALL');
      allow write: if request.auth != null;
    }
    // Certifications — public read
    match /certifications/{certId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📋 Required Files From React Native Project

You only need the Firebase config (already provided) and types (already provided).  
**No other files** from the React Native project are needed. The web app uses the same Firebase project.

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `next 14` | Framework with App Router + API Routes |
| `firebase` | Client-side Firestore onSnapshot (realtime) |
| `firebase-admin` | Server-side Firestore writes via Admin SDK |
| `framer-motion` | Page transitions + scroll animations |
| `gsap` + `ScrollTrigger` | Hero + section scroll reveals |
| `recharts` | Dashboard analytics charts |
| `@emailjs/browser` | Email sending from client |
| `react-hot-toast` | Toast notifications |
| `@tanstack/react-table` | (available, DataTable uses custom impl) |
| `lucide-react` | Icons |
| `clsx` + `tailwind-merge` | className utilities |
| `date-fns` | Date formatting |
| `nanoid` | Unique ID generation |

---

## 🎨 Design System

- **Primary**: `#f4a900` (FurrEver Yellow)
- **Font Display**: Fraunces (serif, italic)
- **Font Body**: Nunito (rounded, friendly)
- **Background**: `#fdf4e3` (warm cream)
- **Custom cursor** with GSAP lerp following
- **Running pet illustrators** in background (4% opacity)
- **Splash screen** with animated running dog SVG

---

*Built with ❤️ for FurrEver — because every pet deserves a forever home 🐾*
