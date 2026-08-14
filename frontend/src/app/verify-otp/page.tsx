'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

function OTPForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    // TODO: call api.post('/auth/verify-otp', { email, otp: code })
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.otpRow} onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className={`${styles.otpInput} ${digit ? styles.otpFilled : ''}`}
          />
        ))}
      </div>

      {error && <p className={styles.errorMsg}>⚠ {error}</p>}

      <button
        id="verify-otp-btn"
        type="submit"
        className={`btn-primary ${styles.submitBtn}`}
        disabled={loading}
      >
        {loading ? <><span className={styles.spinner} /> Verifying...</> : 'Verify & Login →'}
      </button>

      <div className={styles.resendRow}>
        <span className={styles.resendText}>Didn&apos;t receive the code?</span>
        <Link href={`/login`} className={styles.resendLink}>Resend OTP</Link>
      </div>
    </form>
  );
}

export default function VerifyOTPPage() {
  return (
    <>
      <Navbar />
      <main className={styles.authPage}>
        <div className={styles.authBg} />
        <div className={`${styles.authContainer} ${styles.centerLayout}`}>
          <div className={styles.authCard}>
            <div className={styles.cardBar} />
            <div className={styles.cardInner}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>🔐</div>
                <h1 className={styles.cardTitle}>Enter OTP</h1>
                <p className={styles.cardSubtitle}>
                  We sent a 6-digit code to your email. Enter it below to log in.
                </p>
              </div>
              <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Loading...</div>}>
                <OTPForm />
              </Suspense>
              <p className={styles.switchText}>
                <Link href="/login" className={styles.switchLink}>← Back to Login</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
