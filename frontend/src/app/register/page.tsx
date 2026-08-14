'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', gameId: '', password: '', referralCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Redirect if already logged in
  if (user && typeof window !== 'undefined') {
    router.push('/dashboard');
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.gameId || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/send-otp', { email: form.email }, false);
      if (res.success) {
        sessionStorage.setItem('pendingRegistration', JSON.stringify(form));
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
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

          {/* Info Panel */}
          <div className={styles.infoPanel}>
            <h2 className={styles.infoPanelTitle}>
              START YOUR <span className="glow-orange">JOURNEY</span>
            </h2>
            <p className={styles.infoPanelText}>
              Create your account and compete in Free Fire tournaments for real prize pools.
            </p>
            <div className={styles.perks}>
              {[
                { icon: '🎯', text: 'Access to all open tournaments' },
                { icon: '💰', text: 'Secure wallet with instant payouts' },
                { icon: '🏆', text: 'Live leaderboard rankings' },
                { icon: '⚡', text: 'Passwordless OTP login' },
              ].map(p => (
                <div key={p.text} className={styles.perk}>
                  <span className={styles.perkIcon}>{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card */}
          <div className={styles.authCard}>
            <div className={styles.cardBar} />
            <div className={styles.cardInner}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>⚡</div>
                <h1 className={styles.cardTitle}>Create Account</h1>
                <p className={styles.cardSubtitle}>Join thousands of players competing for prizes</p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="name">
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={styles.input}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="reg-email">
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className={styles.input}
                    placeholder="yourname@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="gameId">
                    Free Fire UID <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="gameId"
                    name="gameId"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. 123456789"
                    value={form.gameId}
                    onChange={handleChange}
                    required
                  />
                  <p className={styles.fieldHint}>Find your UID in your Free Fire profile</p>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="password">
                    Password <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className={styles.input}
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="referralCode">
                    Referral Code <span className={styles.optional}>(Optional)</span>
                  </label>
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    className={styles.input}
                    placeholder="Enter referral code"
                    value={form.referralCode}
                    onChange={handleChange}
                  />
                </div>

                {error && <p className={styles.errorMsg}>⚠ {error}</p>}

                <button
                  id="register-btn"
                  type="submit"
                  className={`btn-primary ${styles.submitBtn}`}
                  disabled={loading}
                >
                  {loading ? <><span className={styles.spinner} /> Creating Account...</> : 'Create Account & Get OTP →'}
                </button>
              </form>

              <div className={styles.divider}><span>OR</span></div>

              <p className={styles.switchText}>
                Already have an account?{' '}
                <Link href="/login" className={styles.switchLink}>Login here</Link>
              </p>

              <p className={styles.termsText}>
                By registering, you agree to our{' '}
                <Link href="/rules" className={styles.termsLink}>Tournament Rules</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
