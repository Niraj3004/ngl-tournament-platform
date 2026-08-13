import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

// Mock data — will be replaced with API data in F3
const MOCK_TOURNAMENTS = [
  { id: '1', title: 'Solo Ranked Championship', mode: 'Solo', entryFee: 50, prizePool: 5000, status: 'open', map: 'Bermuda', participants: 38, maxParticipants: 50 },
  { id: '2', title: 'Duo Clash Tournament', mode: 'Duo', entryFee: 100, prizePool: 12000, status: 'open', map: 'Kalahari', participants: 18, maxParticipants: 25 },
  { id: '3', title: 'Squad Battle Royale', mode: 'Squad', entryFee: 200, prizePool: 25000, status: 'open', map: 'Purgatory', participants: 6, maxParticipants: 12 },
];

const STATS = [
  { label: 'Active Players', value: '5,000+' },
  { label: 'Tournaments Hosted', value: '350+' },
  { label: 'Total Prizes Paid', value: 'Rs 8L+' },
  { label: 'Success Rate', value: '100%' },
];

const STEPS = [
  { icon: '👤', step: '01', title: 'Create Account', desc: 'Register in 60 seconds. Verify your email and complete your player profile.' },
  { icon: '💰', step: '02', title: 'Add Funds', desc: 'Deposit via eSewa, Khalti or payment codes. Funds are credited instantly.' },
  { icon: '🏆', step: '03', title: 'Join Tournament', desc: 'Browse open tournaments, pay the entry fee, and get the room details.' },
  { icon: '🎯', step: '04', title: 'Play & Win', desc: 'Compete, get ranked by kills + placement, and prizes auto-deposit to your wallet.' },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className={`${styles.hero} grid-bg`}>
          <div className={styles.heroGlow} />
          <div className={`container ${styles.heroContent}`}>
            <div className={styles.heroBadge}>
              <span className="badge badge-orange">🔴 Live Tournaments</span>
            </div>
            <h1 className={styles.heroTitle}>
              DOMINATE THE<br />
              <span className="glow-text-orange">FREE FIRE</span><br />
              BATTLEFIELD
            </h1>
            <p className={styles.heroSubtitle}>
              Join Nepal&apos;s most competitive Free Fire platform. Real tournaments. Real prize pools. Real glory.
            </p>
            <div className={styles.heroActions}>
              <Link href="/tournaments" className="btn-primary">
                Browse Tournaments →
              </Link>
              <Link href="/how-it-works" className="btn-secondary">
                How It Works
              </Link>
            </div>
            <div className={styles.heroStats}>
              {STATS.map((s) => (
                <div key={s.label} className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{s.value}</span>
                  <span className={styles.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LIVE TOURNAMENTS */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionBadge}><span className="badge badge-blue">Featured</span></p>
                <h2 className="section-title">LIVE <span className="glow-text-orange">TOURNAMENTS</span></h2>
                <p className="section-subtitle">Register before slots fill up. Entry fees are locked with our secure ledger.</p>
              </div>
              <Link href="/tournaments" className="btn-secondary">View All →</Link>
            </div>
            <div className={styles.tournamentGrid}>
              {MOCK_TOURNAMENTS.map((t) => (
                <div key={t.id} className={`glass-card ${styles.tournamentCard}`}>
                  <div className={styles.cardHeader}>
                    <span className="badge badge-orange">{t.mode}</span>
                    <span className={`badge badge-green`}>OPEN</span>
                  </div>
                  <h3 className={styles.cardTitle}>{t.title}</h3>
                  <p className={styles.cardMap}>📍 {t.map}</p>
                  <div className={styles.cardStats}>
                    <div>
                      <span className={styles.statLabel}>Entry Fee</span>
                      <span className={styles.statValue}>Rs {t.entryFee}</span>
                    </div>
                    <div>
                      <span className={styles.statLabel}>Prize Pool</span>
                      <span className={`${styles.statValue} glow-text-orange`}>Rs {t.prizePool.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={styles.cardSlots}>
                    <div className={styles.slotBar}>
                      <div
                        className={styles.slotFill}
                        style={{ width: `${(t.participants / t.maxParticipants) * 100}%` }}
                      />
                    </div>
                    <span className={styles.slotText}>{t.participants}/{t.maxParticipants} Slots</span>
                  </div>
                  <Link href={`/tournaments/${t.id}`} className={`btn-primary ${styles.cardBtn}`}>
                    Register Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={`${styles.section} ${styles.howSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionBadge}><span className="badge badge-blue">Simple Process</span></p>
                <h2 className="section-title">HOW IT <span className="glow-text-blue">WORKS</span></h2>
                <p className="section-subtitle">From zero to earning in 4 simple steps.</p>
              </div>
            </div>
            <div className={styles.stepsGrid}>
              {STEPS.map((step) => (
                <div key={step.step} className={`glass-card ${styles.stepCard}`}>
                  <div className={styles.stepNumber}>{step.step}</div>
                  <div className={styles.stepIcon}>{step.icon}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBanner}>
              <div className={styles.ctaGlow} />
              <h2 className={styles.ctaTitle}>READY TO BECOME A <span className="glow-text-orange">CHAMPION?</span></h2>
              <p className={styles.ctaSubtitle}>Thousands of players compete every week. Your moment starts now.</p>
              <Link href="/register" className="btn-primary">
                Create Free Account →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
