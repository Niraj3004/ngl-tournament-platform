'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <motion.div
            className={styles.logoIcon}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🎯
          </motion.div>
          <span className={styles.logoText}>
            NGL<span className={styles.logoAccent}>FF</span>
          </span>
          <span className={styles.logoBadge}>BATTLE</span>
        </Link>

        {/* Desktop Nav */}
        <ul className={styles.navLinks}>
          {['Tournaments', 'Leaderboard', 'How It Works'].map((item) => (
            <li key={item}>
              <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`} className={styles.navLink}>
                {item}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/login" className="btn-secondary">Login</Link>
          <Link href="/register" className="btn-primary">⚡ Play Now</Link>
        </div>

        {/* Mobile Toggle */}
        <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} className={styles.bar} />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className={styles.bar} />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} className={styles.bar} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {['Tournaments', 'Leaderboard', 'How It Works'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  {item}
                </Link>
              </motion.div>
            ))}
            <div className={styles.mobileActions}>
              <Link href="/login" className="btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="btn-primary" onClick={() => setMenuOpen(false)}>⚡ Play Now</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
