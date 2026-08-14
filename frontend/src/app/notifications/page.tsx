'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.success) {
          setNotifications(res.notifications);
          const unread = res.notifications.filter((n: any) => !n.isRead).map((n: any) => n._id);
          if (unread.length > 0) {
            await api.post('/notifications/mark-read', { notificationIds: unread });
          }
        }
      } catch (e) {}
      setLoading(false);
    };
    if (user) fetchNotifs();
  }, [user]);

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <ParticleBackground />
        <div className={`container ${styles.content}`}>
          <h1 className={styles.title}>Notifications</h1>
          {loading ? <p>Loading...</p> : (
            <div className={styles.list}>
              {notifications.map((n) => (
                <div key={n._id} className={`${styles.notifCard} ${!n.isRead ? styles.unread : ''}`}>
                  <p>{n.message}</p>
                  <small>{new Date(n.createdAt).toLocaleString()}</small>
                </div>
              ))}
              {notifications.length === 0 && <p>No notifications.</p>}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
