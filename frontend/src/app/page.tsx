'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import styles from './page.module.css';

const TOURNAMENTS = [
  { id: '1', title: 'Solo Ranked Championship', mode: 'Solo', entryFee: 50, prizePool: 5000, status: 'open', map: 'Bermuda', participants: 38, max: 50, game: 'Free Fire' },
  { id: '2', title: 'Duo Clash Tournament', mode: 'Duo', entryFee: 100, prizePool: 12000, status: 'open', map: 'Kalahari', participants: 18, max: 25, game: 'Free Fire' },
  { id: '3', title: 'Squad War Season 4', mode: 'Squad', entryFee: 200, prizePool: 50000, status: 'open', map: 'Purgatory', participants: 6, max: 12, game: 'Free Fire' },
];

const STATS = [
  { icon: '👥', value: '5,000+', label: 'Active Players' },
  { icon: '🏆', value: '350+', label: 'Tournaments' },
  { icon: '💰', value: 'Rs 8L+', label: 'Prizes Paid' },
  { icon: '⚡', value: '100%', label: 'Payout Rate' },
];

const STEPS = [
  { icon: '👤', num: '01', title: 'Register', desc: 'Create your account and complete your Free Fire player profile in 60 seconds.' },
  { icon: '💳', num: '02', title: 'Add Funds', desc: 'Deposit via eSewa, Khalti or payment codes. Funds are secured by our ledger system.' },
  { icon: '🎮', num: '03', title: 'Join & Play', desc: 'Register for any open tournament. Get room ID and password on match day.' },
  { icon: '🏆', num: '04', title: 'Win Prizes', desc: 'Top ranked players get automatic prize payouts straight to their wallet.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <>
      <div className="scanlines" />
      <ParticleBackground />
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* ── HERO ── */}
        <section ref={heroRef} className={styles.hero}>
          {/* Parallax BG */}
          <motion.div className={styles.heroBg} style={{ y: imgY, scale: imgScale }}>
            <Image src="/hero-banner.jpg" alt="Battle Zone" fill priority style={{ objectFit: 'cover' }} />
            <div className={styles.heroBgOverlay} />
          </motion.div>

          {/* Animated Grid Lines */}
          <div className={styles.heroGrid} />

          {/* Corner Brackets */}
          <div className={`${styles.corner} ${styles.cornerTL}`} />
          <div className={`${styles.corner} ${styles.cornerTR}`} />
          <div className={`${styles.corner} ${styles.cornerBL}`} />
          <div className={`${styles.corner} ${styles.cornerBR}`} />

          {/* Content */}
          <motion.div className={`container ${styles.heroContent}`} style={{ y: heroTextY, opacity: heroOpacity }}>
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} custom={0} className={styles.heroPreTitle}>
                <span className="badge badge-orange">🔴 LIVE SEASON 4</span>
                <span className="badge badge-blue">📍 NEPAL</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className={styles.heroTitle}>
                <span className={styles.heroLine1}>BATTLE.</span>
                <span className={styles.heroLine2}>
                  SURVIVE.{' '}
                  <span className="glow-orange">WIN.</span>
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className={styles.heroSubtitle}>
                Nepal&apos;s most competitive Free Fire tournament platform.
                Real prize pools. Real glory. Zero BS.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className={styles.heroActions}>
                <Link href="/tournaments" className="btn-primary">
                  🎯 Enter Tournament
                </Link>
                <Link href="/how-it-works" className="btn-secondary">
                  How It Works
                </Link>
              </motion.div>

              {/* Stats Row */}
              <motion.div variants={stagger} className={styles.heroStats}>
                {STATS.map((s, i) => (
                  <motion.div key={s.label} variants={fadeUp} custom={4 + i} className={styles.heroStat}>
                    <span className={styles.heroStatIcon}>{s.icon}</span>
                    <span className={styles.heroStatVal}>{s.value}</span>
                    <span className={styles.heroStatLabel}>{s.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Bottom gradient fade */}
          <div className={styles.heroFade} />
        </section>

        {/* ── TOURNAMENT CARDS ── */}
        <section className={styles.section}>
          <div className="container">
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <span className="badge badge-orange" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>🔥 HOT NOW</span>
                <h2 className={`section-title ${styles.sectionTitle}`}>
                  LIVE <span className="glow-orange">TOURNAMENTS</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Slots fill fast. Register before it&apos;s too late.
                </p>
              </div>
              <Link href="/tournaments" className="btn-secondary">View All →</Link>
            </motion.div>

            <motion.div
              className={styles.tournamentGrid}
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              {TOURNAMENTS.map((t, i) => (
                <motion.div
                  key={t.id}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ scale: 1.02, rotateY: 2 }}
                  style={{ transformPerspective: 1000 }}
                >
                  <Link href={`/tournaments/${t.id}`} className={`glass-card ${styles.tCard}`}>
                    {/* Top accent bar */}
                    <div className={styles.tCardBar} />

                    <div className={styles.tCardHeader}>
                      <span className="badge badge-orange">{t.game}</span>
                      <span className="badge badge-green">● OPEN</span>
                    </div>

                    <h3 className={styles.tCardTitle}>{t.title}</h3>

                    <div className={styles.tCardMeta}>
                      <span>🎯 {t.mode}</span>
                      <span>📍 {t.map}</span>
                    </div>

                    <div className={styles.tCardDivider} />

                    <div className={styles.tCardStats}>
                      <div className={styles.tCardStat}>
                        <span className={styles.tStatLabel}>Entry Fee</span>
                        <span className={styles.tStatVal}>Rs {t.entryFee}</span>
                      </div>
                      <div className={styles.tCardStatDivider} />
                      <div className={styles.tCardStat}>
                        <span className={styles.tStatLabel}>Prize Pool</span>
                        <span className={`${styles.tStatVal} glow-yellow`}>
                          Rs {t.prizePool.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Slot progress */}
                    <div className={styles.slotWrap}>
                      <div className={styles.slotBarBg}>
                        <motion.div
                          className={styles.slotBarFill}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(t.participants / t.max) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.15 }}
                        />
                      </div>
                      <span className={styles.slotText}>{t.participants}/{t.max} Slots</span>
                    </div>

                    <div className={`btn-primary ${styles.tCardBtn}`}>
                      Register Now →
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className={`${styles.section} ${styles.howSection}`}>
          <div className="container">
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>SIMPLE PROCESS</span>
                <h2 className={`section-title ${styles.sectionTitle}`}>
                  HOW IT <span className="glow-blue">WORKS</span>
                </h2>
              </div>
            </motion.div>

            <div className={styles.stepsGrid}>
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  className={`glass-card ${styles.stepCard}`}
                  initial={{ opacity: 0, y: 50, rotateX: 15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
                  whileHover={{ scale: 1.03, rotateY: 3, translateZ: 20 }}
                  style={{ transformPerspective: 800, transformStyle: 'preserve-3d' }}
                >
                  <div className={styles.stepNum}>{step.num}</div>
                  <div className={styles.stepIcon}>{step.icon}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && <div className={styles.connector} />}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.ctaSection}>
          <div className="container">
            <motion.div
              className={styles.ctaBanner}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {/* Animated glow orbs */}
              <motion.div
                className={styles.ctaOrb1}
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className={styles.ctaOrb2}
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3.5, repeat: Infinity }}
              />
              <div className={styles.ctaContent}>
                <motion.h2
                  className={styles.ctaTitle}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  READY TO BECOME<br />
                  <span className="glow-orange">CHAMPION?</span>
                </motion.h2>
                <motion.p
                  className={styles.ctaSub}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                >
                  Thousands compete every week. Your moment starts now.
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <Link href="/register" className="btn-primary">
                    ⚡ Create Free Account
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
