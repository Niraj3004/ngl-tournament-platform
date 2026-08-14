'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function ReferralsPage() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [stats, setStats] = useState({ totalReferred: 0, totalEarned: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [codeRes, statsRes] = await Promise.all([
          api.get('/referrals/code'),
          api.get('/referrals/stats')
        ]);
        if (codeRes.success) setCode(codeRes.code);
        if (statsRes.success) setStats(statsRes.stats);
      } catch (e) {}
      setLoading(false);
    };
    if (user) load();
  }, [user]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${code}`);
    alert('Referral link copied!');
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <ParticleBackground />
        <div className={`container ${styles.content}`}>
          <h1 className={styles.title}>Refer & Earn</h1>
          {loading ? <p>Loading...</p> : (
            <div className={styles.grid}>
              <div className={styles.card}>
                <h2>Your Referral Code</h2>
                <div className={styles.codeBox}>{code}</div>
                <button onClick={copyLink} className={styles.btn}>Copy Share Link</button>
              </div>
              <div className={styles.card}>
                <h2>Your Stats</h2>
                <p>Total Referred: <strong>{stats.totalReferred}</strong></p>
                <p>Pending: <strong>{stats.pending}</strong></p>
                <p>Total Earned: <strong className={styles.money}>Rs {stats.totalEarned}</strong></p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
