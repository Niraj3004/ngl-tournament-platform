# NGL Tournament Platform - Backend

This is the backend for the NGL Free Fire Tournament Platform, built with Node.js, Express, TypeScript, and MongoDB.

## Features Built
- **B1-B3**: Custom OTP Authentication (Email-based) & User Onboarding
- **B4-B5**: Match Creation & Auditing
- **B6**: Match Joining with Atomic Ledger Deductions
- **B7**: Manual Deposits (Receipt Verification) & Payment Codes
- **B8**: Withdrawals (with Fund Locking Architecture)
- **B9**: Refunds, Results & Automated Prize Payouts
- **B10**: Admin Dashboard Metrics & Audit Logs
- **B11**: Notification System
- **B12**: Winston Logging & Global Error Handling

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```
   *Note: Because this platform uses financial transactions (Ledger), your MongoDB must be configured as a Replica Set to support multi-document transactions.*

3. **Development**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Financial Ledger (Important)
All wallet changes are routed through `src/services/ledger.service.ts` using MongoDB sessions and idempotency keys to absolutely guarantee no double-charging or negative balances.
