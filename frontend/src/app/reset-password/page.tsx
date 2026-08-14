'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/lib/api';
import styles from '../login/page.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (res.success) {
        setMessage(res.message || 'Password reset successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
              <h1 className={styles.title}>Reset Password</h1>
              <p className={styles.subtitle}>Enter the OTP sent to your email and a new password.</p>
            </div>

            {error && <div className={styles.alertError}>{error}</div>}
            {message && <div className={styles.alertSuccess}>{message}</div>}

            <form className={styles.form} onSubmit={handleReset}>
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

              <div className={styles.inputGroup}>
                <label className={styles.label}>OTP Code</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.icon}>🔑</span>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.icon}>🔒</span>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner}></span> : 'Reset Password'}
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
