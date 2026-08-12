# NGL (Nepal Gaming League) - Tournament Platform 🎮

A modern, high-performance web platform designed to host, manage, and scale Free Fire esports tournaments. This full-stack application strictly separates the Player and Admin experiences, ensuring military-grade security for wallet transactions using MongoDB's ACID compliant multi-document transactions, secure match credentials, and role management.

## 🚀 Features

### 🛡️ Secure Authentication & RBAC (JWT)
* **Player Portal:** Public-facing registration and login strictly for players. New users default to the `player` role.
* **Admin Portal:** Hidden, isolated login (`/admin/login`). No public sign-up for admins.
* **Role Elevation:** Admins can securely promote other users to admin status from the dashboard.
* **Token Management:** Secure HTTP-only cookies and JSON Web Tokens (JWT) for session management.

### 🕹️ Player Experience
* **Dashboard:** Real-time wallet balance, statistics (Kills, Wins, Points), and upcoming matches.
* **Tournament Lobby:** Browse upcoming, ongoing, and completed matches.
* **Secure Room Reveal:** Match Room ID and Password unlock dynamically based on server-time and participant verification.
* **Wallet System:** Deposit via payment codes, request withdrawals, and track transaction history.

### ⚙️ Admin Operations
* **Tournament Management:** Create matches, set prize pools, configure entry fees, and manage participants.
* **Result Engine:** Enter player kills and placements to automatically calculate points and distribute wallet prizes.
* **Financial Ledger:** Approve/reject withdrawals, generate manual payment codes, and view immutable audit logs.
* **User Management:** Search users (by `fullname`, UID, etc.), view detailed activity, and suspend/restore accounts.

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS (Dark/Gaming Theme), Framer Motion (3D/Parallax Effects)
* **State Management:** TanStack Query (React Query), Zustand
* **Forms & Validation:** React Hook Form, Zod

### Backend (Server)
* **Runtime & Framework:** Node.js, Express.js, TypeScript
* **Database:** MongoDB (using Mongoose ODM)
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **Security:** Helmet, Express Rate Limit, CORS

## 📂 Project Structure

```text
ngl-tournament-platform/
├── backend/                       # Node.js & Express API
│   ├── src/
│   │   ├── config/                # Database connection & env variables
│   │   ├── controllers/           # Route logic (Auth, Match, Wallet)
│   │   ├── middlewares/           # JWT verification, Role checks (isAdmin)
│   │   ├── models/                # Mongoose Schemas (User, Match, Wallet)
│   │   ├── routes/                # Express API routes
│   │   ├── services/              # Business logic (Atomic MongoDB transactions)
│   │   └── server.ts              # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # React & Vite Web Application
│   ├── src/
│   │   ├── assets/                # Static assets, branding (Logo, 3D elements)
│   │   ├── components/            # Reusable UI Design System (Cards, Buttons, Modals)
│   │   ├── features/              # Domain-driven modules (admin, auth, player)
│   │   ├── hooks/                 # Custom React hooks (useAuth, useWallet)
│   │   ├── routes/                # Protected route guards
│   │   ├── types/                 # Shared TS interfaces
│   │   └── App.tsx                
│   ├── tailwind.config.js         # NGL Brand Colors
│   └── package.json
└── README.md
