'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Tournaments', path: '/admin/tournaments', icon: '🏆' },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: '💸' },
    { name: 'System Logs', path: '/admin/logs', icon: '📜' },
  ];

  return (
    <ProtectedRoute adminOnly={true}>
      <Navbar />
      <div className={styles.adminContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Admin Panel</h2>
          </div>
          <nav className={styles.sidebarNav}>
            {navItems.map(item => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
      <Footer />
    </ProtectedRoute>
  );
}
