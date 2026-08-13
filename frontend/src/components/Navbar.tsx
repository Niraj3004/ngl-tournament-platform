'use client';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>NGL<span className={styles.logoAccent}>FF</span></span>
        </Link>

        {/* Desktop Nav */}
        <ul className={styles.navLinks}>
          <li><Link href="/tournaments" className={styles.navLink}>Tournaments</Link></li>
          <li><Link href="/leaderboard" className={styles.navLink}>Leaderboard</Link></li>
          <li><Link href="/how-it-works" className={styles.navLink}>How It Works</Link></li>
        </ul>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/login" className="btn-secondary">Login</Link>
          <Link href="/register" className="btn-primary">Play Now</Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={menuOpen ? styles.barOpen : styles.bar}></span>
          <span className={menuOpen ? styles.barOpen : styles.bar}></span>
          <span className={menuOpen ? styles.barOpen : styles.bar}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/tournaments" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Tournaments</Link>
          <Link href="/leaderboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Leaderboard</Link>
          <Link href="/how-it-works" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>How It Works</Link>
          <div className={styles.mobileActions}>
            <Link href="/login" className="btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link href="/register" className="btn-primary" onClick={() => setMenuOpen(false)}>Play Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
