import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span>⚡</span>
            <span>NGL<span className={styles.accent}>FF</span></span>
          </div>
          <p className={styles.tagline}>The premier Free Fire tournament platform. Play hard. Win big.</p>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Platform</h4>
            <Link href="/tournaments" className={styles.link}>Tournaments</Link>
            <Link href="/leaderboard" className={styles.link}>Leaderboard</Link>
            <Link href="/how-it-works" className={styles.link}>How It Works</Link>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Account</h4>
            <Link href="/login" className={styles.link}>Login</Link>
            <Link href="/register" className={styles.link}>Register</Link>
            <Link href="/wallet" className={styles.link}>Wallet</Link>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Support</h4>
            <Link href="/faq" className={styles.link}>FAQ</Link>
            <Link href="/contact" className={styles.link}>Contact</Link>
            <Link href="/rules" className={styles.link}>Tournament Rules</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} NGL Tournament Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
