'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.success) {
          setMetrics(res.metrics);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className={styles.loading}>Loading Dashboard...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      <p className={styles.pageSub}>Welcome to the NGL Admin Panel</p>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Users</span>
            <span className={styles.statValue}>{metrics?.totalUsers || 0}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Revenue</span>
            <span className={`${styles.statValue} glow-orange`}>Rs {metrics?.totalRevenue?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Tournaments</span>
            <span className={styles.statValue}>{metrics?.activeTournaments || 0}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pending Deposits</span>
            <span className={`${styles.statValue} ${metrics?.pendingDeposits > 0 ? 'text-yellow' : ''}`}>
              {metrics?.pendingDeposits || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
