'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import styles from './page.module.css';

export default function DashboardPage() {
  const { user, wallet, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const notifRes = await api.get('/notifications');
          if (notifRes.success) setNotifications(notifRes.notifications);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.post('/notifications/mark-read', { notificationIds: [id] });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-read', { notificationIds: notifications.filter(n => !n.isRead).map(n => n._id) });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading || loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Loading dashboard...</div>;
  if (!user) return null;

  return (
    <>
      <div className="scanlines" />
      <ParticleBackground />
      <Navbar />

      <main className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>PLAYER <span className="glow-orange">DASHBOARD</span></h1>
            <p className={styles.subtitle}>Welcome back, {user.fullname || 'Champion'}</p>
          </div>

          <div className={styles.grid}>
            {/* Left Column: Stats & Actions */}
            <div className={styles.leftCol}>
              <div className={`glass-card ${styles.card}`}>
                <h3 className={styles.cardTitle}>Wallet Summary</h3>
                <div className={styles.walletBox}>
                  <div className={styles.walletRow}>
                    <span>Available Balance</span>
                    <span className={styles.walletVal}>Rs {wallet?.availableBalance || 0}</span>
                  </div>
                  <div className={styles.walletRow}>
                    <span>Locked Balance</span>
                    <span className={styles.walletVal} style={{ color: 'var(--text-secondary)' }}>Rs {wallet?.lockedBalance || 0}</span>
                  </div>
                  <div className={styles.divider} />
                  <div className={styles.walletRow}>
                    <span>Total Equity</span>
                    <span className={`${styles.walletVal} glow-yellow`}>
                      Rs {(wallet?.availableBalance || 0) + (wallet?.lockedBalance || 0)}
                    </span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Link href="/wallet" className="btn-primary" style={{ textAlign: 'center' }}>Manage Wallet</Link>
                  <Link href="/tournaments" className="btn-secondary" style={{ textAlign: 'center' }}>Find Matches</Link>
                  <Link href="/referrals" className="btn-secondary" style={{ textAlign: 'center' }}>Refer & Earn</Link>
                  <Link href="/support" className="btn-secondary" style={{ textAlign: 'center' }}>Help & Support</Link>
                </div>
              </div>
            </div>

            {/* Right Column: Notifications */}
            <div className={styles.rightCol}>
              <div className={`glass-card ${styles.card}`}>
                <div className={styles.cardHeaderRow}>
                  <h3 className={styles.cardTitle} style={{ margin: 0 }}>Recent Notifications</h3>
                  {notifications.some(n => !n.isRead) && (
                    <button onClick={handleMarkAllRead} className={styles.markReadBtn}>Mark all as read</button>
                  )}
                </div>
                
                <div className={styles.notifList}>
                  {notifications.length === 0 ? (
                    <div className={styles.emptyNotif}>You have no new notifications.</div>
                  ) : (
                    notifications.map((n) => (
                      <motion.div 
                        key={n._id} 
                        className={`${styles.notifItem} ${n.isRead ? styles.notifRead : styles.notifUnread}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className={styles.notifIcon}>
                          {n.type === 'wallet' ? '💰' : n.type === 'tournament' ? '🏆' : '🔔'}
                        </div>
                        <div className={styles.notifContent}>
                          <p className={styles.notifMessage}>{n.message}</p>
                          <span className={styles.notifTime}>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        {!n.isRead && (
                          <button 
                            className={styles.readDot} 
                            onClick={() => handleMarkAsRead(n._id)}
                            title="Mark as read"
                          />
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
