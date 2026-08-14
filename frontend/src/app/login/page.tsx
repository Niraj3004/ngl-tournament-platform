'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: call api.post('/auth/request-otp', { email })
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <>
      <Navbar />
      <main className={styles.authPage}>
        <div className={styles.authBg} />
        <div className={styles.authContainer}>
          {/* Card */}
          <div className={styles.authCard}>
            {/* Top bar */}
            <div className={styles.cardBar} />

            <div className={styles.cardInner}>
              {/* Logo / Title */}
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>🎯</div>
                <h1 className={styles.cardTitle}>Welcome Back</h1>
                <p className={styles.cardSubtitle}>
                  Enter your email to receive a one-time login code
                </p>
              </div>

              {!sent ? (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      className={styles.input}
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <button
                    id="send-otp-btn"
                    type="submit"
                    className={`btn-primary ${styles.submitBtn}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className={styles.spinner} /> Sending Code...</>
                    ) : (
                      'Send Login Code →'
                    )}
                  </button>
                </form>
              ) : (
                <div className={styles.successBox}>
                  <div className={styles.successIcon}>✅</div>
                  <h3 className={styles.successTitle}>Code Sent!</h3>
                  <p className={styles.successText}>
                    Check your inbox at <strong>{email}</strong> for the 6-digit OTP.
                  </p>
                  <Link href={`/verify-otp?email=${encodeURIComponent(email)}`} className={`btn-primary ${styles.submitBtn}`}>
                    Enter OTP →
                  </Link>
                </div>
              )}

              <div className={styles.divider}><span>OR</span></div>

              <p className={styles.switchText}>
                Don&apos;t have an account?{' '}
                <Link href="/register" className={styles.switchLink}>Create one free</Link>
              </p>
            </div>
          </div>

          {/* Side info panel */}
          <div className={styles.infoPanel}>
            <h2 className={styles.infoPanelTitle}>
              JOIN THE <span className="glow-orange">BATTLE</span>
            </h2>
            <p className={styles.infoPanelText}>
              Secure, passwordless login. No passwords to forget, no security risks.
            </p>
            <div className={styles.infoBullets}>
              {['No password needed', 'Instant OTP login', 'Secure & encrypted', 'Wallet protected'].map(b => (
                <div key={b} className={styles.infoBullet}>
                  <span className={styles.bulletDot} />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
