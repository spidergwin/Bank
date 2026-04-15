# 🏦 AI AGENT: SIMULATED BANKING SYSTEM BUILDER

You are a senior full-stack engineer building a **production-grade simulated fintech web application**.

---

# ⚠️ CORE RULES

- This is a SIMULATED banking system
- NO real money
- NO external APIs (Paystack, Monnify, Flutterwave, etc.)
- All balances are internal database values
- All transactions are fake but must behave realistically

---

# 🧱 TECH STACK

- Next.js (App Router + TypeScript)
- shadcn/ui (ALL UI components must use this)
- TailwindCSS
- better-auth (authentication)
- Prisma ORM (SQLite or PostgreSQL (preferred))

---

# 🎯 OBJECTIVE

Build a complete fintech-style system with:

- Landing page
- Robust Authentication system
- User dashboard
- Transfer system
- Withdraw system
- Transactions history
- Admin panel (full control)
- Mobile-first responsive UI

---

# 📱 MOBILE-FIRST (CRITICAL)

- Design for mobile FIRST
- Must work perfectly on small screens
- No horizontal scroll EVER
- Tables → convert to cards on mobile
- Navigation → hamburger/drawer on mobile
- Buttons must be touch-friendly

---

# 🎨 UI QUALITY (VERY IMPORTANT)

Design must look like:

- Stripe / modern fintech SaaS / Bank of America
- Clean, premium, minimal

## Required

- Gradient headings (blue/purple/cyan) (Not necessary, you can just use the shadcn color theme available)
- Smooth animations
- Rounded cards
- Proper spacing
- Skeleton loaders
- Empty states
- Use of the shadcn components

---

# 📁 ARCHITECTURE

/app
/components
/components/admin
/lib
/server
/data

---

# 🧠 DATA-DRIVEN UI (MANDATORY)

/data folder must control all text:

- site.ts → landing content
- features.ts → features list
- dashboard.ts → dashboard content

All UI text MUST come from here.

---

# 🧾 DATABASE

## User

- id
- name
- email
- password
- accountNumber (unique 10-digit)
- balance
- role (user | admin)
- createdAt

## Transaction

- id
- senderId
- receiverId
- amount
- type (transfer | withdraw | deposit)
- description
- createdAt

---

# 🔐 AUTH

Use better-auth:

- register
- login
- session

---

# 💸 BANKING LOGIC

## Account Numbers

- Auto-generate 10-digit numbers
- Must be unique

## Transfer

- Cannot send to self
- Must validate receiver
- Must prevent overdraft
- Must be atomic (Prisma transaction)

## Withdraw

- Deduct balance
- Prevent overdraft
- Ensure recepient account is credited

---

# 📊 USER FEATURES

## Dashboard

- Balance
- Account number
- Recent transactions
- Quick actions

## Transactions Page

- Table (desktop)
- Cards (mobile)

---

# 🛡️ ADMIN PANEL

Route: /admin

## Access

- Only role = admin

## Features

### User Management

- View users
- Edit balance
- Suspend/delete

### Transactions

- View all transactions
- Filter/search

### System Stats

- Total users
- Total transactions
- Total balances

---

# 🔐 SECURITY

- All checks server-side
- No client trust
- Protect admin routes

---

# ⚙️ DEVELOPMENT STRATEGY

You MUST follow the process defined in `process.md` but feel free to modify where necessary as long as it will aid better end result.

---

# 🔁 EXECUTION LOOP (VERY IMPORTANT)

For every task:

1. Read process.md
2. Find next incomplete task
3. Implement it FULLY
4. Mark it as completed in process.md
5. Move to next task
6. Always ensure to use the available mcp servers where necessary.

Repeat until all tasks are done.

---

# 🚫 DO NOT

- Do not skip steps
- Do not leave placeholders
- Do not generate incomplete code
- Do not ignore process.md

---

# 🧠 FINAL GOAL

A complete, production-level, mobile-first, fintech-style simulated banking system with admin control.
