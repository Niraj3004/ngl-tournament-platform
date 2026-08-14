'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { loginUser, user } = useAuth();

  if (user && typeof window !== 'undefined') {
    router.push('/dashboard');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/login', { email, password }, false);
      if (res.success && res.token) {
        loginUser(res.token, res.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
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
                  Enter your email and password to access your account
                </p>
              </div>

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

                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      className={styles.input}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && <p className={styles.errorMsg} style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>⚠ {error}</p>}

                  <button
                    id="send-otp-btn"
                    type="submit"
                    className={`btn-primary ${styles.submitBtn}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className={styles.spinner} /> Logging in...</>
                    ) : (
                      'Login →'
                    )}
                  </button>
                </form>

              <div className={styles.divider}><span>OR</span></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <p>
                  <Link href="/forgot-password" className={styles.switchLink}>Forgot Password?</Link>
                </p>
                <p>
                  Don&apos;t have an account? <Link href="/register" className={styles.switchLink}>Create one</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Side info panel */}
          <div className={styles.infoPanel}>
            <h2 className={styles.infoPanelTitle}>
              JOIN THE <span className="glow-orange">BATTLE</span>
            </h2>
            <p className={styles.infoPanelText}>
              Secure login with your password. Access your wallet, enter tournaments, and win big!
            </p>
            <div className={styles.infoBullets}>
              {['Fast login', 'Secure & encrypted', 'Wallet protected'].map(b => (
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
