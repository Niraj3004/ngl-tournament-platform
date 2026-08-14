'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/lib/api';
import styles from '../login/page.module.css'; // Reusing login styles

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        setMessage(res.message || 'OTP sent to your email.');
        // Redirect to reset password after 2 seconds
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.authWrapper}>
        <ParticleBackground />
        
        <div className={styles.authContainer}>
          <div className={styles.authBox}>
            <div className={styles.authHeader}>
              <h1 className={styles.title}>Forgot Password</h1>
              <p className={styles.subtitle}>Enter your email to receive a reset OTP.</p>
            </div>

            {error && <div className={styles.alertError}>{error}</div>}
            {message && <div className={styles.alertSuccess}>{message}</div>}

            <form className={styles.form} onSubmit={handleForgot}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.icon}>✉️</span>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner}></span> : 'Send OTP'}
              </button>
            </form>

            <div className={styles.authFooter}>
              Remembered your password? <Link href="/login">Login here</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
