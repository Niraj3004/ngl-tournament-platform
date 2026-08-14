'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/lib/api';
import styles from './page.module.css';

const MODES = ['All', 'Solo', 'Duo', 'Squad', 'Clash Squad'];
const STATUSES = ['All', 'open', 'registration_closed', 'room_revealed', 'started', 'completed'];

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  registration_closed: 'Reg. Closed',
  room_revealed: 'Room Revealed',
  started: 'Live Now',
  completed: 'Ended',
};

const STATUS_CLASS: Record<string, string> = {
  open: 'badge-green',
  registration_closed: 'badge-yellow',
  room_revealed: 'badge-blue',
  started: 'badge-orange',
  completed: '',
};

export default function TournamentsPage() {
  const [modeFilter, setModeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get('/tournaments', false);
        if (res.success) {
          // Filter out cancelled tournaments
          setTournaments(res.matches.filter((m: any) => m.status !== 'cancelled'));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filtered = tournaments.filter(t => {
    if (modeFilter !== 'All' && t.mode !== modeFilter) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeTournaments = tournaments.filter(t => ['open', 'room_revealed', 'started'].includes(t.status)).length;
  const totalPrizePool = tournaments.reduce((acc, t) => acc + (t.prizePool || 0), 0);

  return (
    <>
      <div className="scanlines" />
      <ParticleBackground />
      <Navbar />
      <main className={styles.page}>
        <div className={styles.pageHeader}>
          <div className="container">
            <div className={styles.pageHeaderInner}>
              <div>
                <p className={styles.breadcrumb}>
                  <Link href="/">Home</Link> / Tournaments
                </p>
                <h1 className={styles.pageTitle}>
                  ALL <span className="glow-orange">TOURNAMENTS</span>
                </h1>
                <p className={styles.pageSubtitle}>
                  {filtered.length} tournament{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.filterCard}>
                <div className={styles.filterCardBar} />
                <div className={styles.filterCardInner}>
                  <h3 className={styles.filterTitle}>🔍 Search</h3>
                  <input
                    id="tournament-search"
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.filterCard}>
                <div className={styles.filterCardBar} />
                <div className={styles.filterCardInner}>
                  <h3 className={styles.filterTitle}>🎯 Game Mode</h3>
                  <div className={styles.filterOptions}>
                    {MODES.map(m => (
                      <button
                        key={m}
                        className={`${styles.filterBtn} ${modeFilter === m ? styles.filterBtnActive : ''}`}
                        onClick={() => setModeFilter(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.filterCard}>
                <div className={styles.filterCardBar} />
                <div className={styles.filterCardInner}>
                  <h3 className={styles.filterTitle}>📡 Status</h3>
                  <div className={styles.filterOptions}>
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        className={`${styles.filterBtn} ${statusFilter === s ? styles.filterBtnActive : ''}`}
                        onClick={() => setStatusFilter(s)}
                      >
                        {s === 'All' ? 'All' : STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.filterCard}>
                <div className={styles.filterCardBar} />
                <div className={styles.filterCardInner}>
                  <h3 className={styles.filterTitle}>📊 Platform Stats</h3>
                  <div className={styles.sideStats}>
                    <div className={styles.sideStat}>
                      <span className={styles.sideStatVal}>{activeTournaments}</span>
                      <span className={styles.sideStatLabel}>Active Tournaments</span>
                    </div>
                    <div className={styles.sideStat}>
                      <span className={`${styles.sideStatVal} glow-orange`}>Rs {totalPrizePool.toLocaleString()}</span>
                      <span className={styles.sideStatLabel}>Total Prize Pool</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className={styles.main}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading tournaments...</div>
              ) : filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <h3 className={styles.emptyTitle}>No Tournaments Found</h3>
                  <p className={styles.emptyText}>Try adjusting your filters</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {filtered.map(t => (
                    <Link key={t._id} href={`/tournaments/${t._id}`} className={`glass-card ${styles.tCard}`}>
                      <div className={styles.tCardBar} />
                      <div className={styles.tCardBody}>
                        <div className={styles.tCardTop}>
                          <div className={styles.tCardBadges}>
                            <span className={`badge badge-orange`}>{t.mode}</span>
                            <span className={`badge ${STATUS_CLASS[t.status] || ''}`}>
                              {t.status === 'started' ? '🔴 ' : ''}{STATUS_LABELS[t.status] || t.status}
                            </span>
                          </div>
                          <span className={styles.tCardPrize}>
                            Rs {t.prizePool.toLocaleString()}
                          </span>
                        </div>

                        <h2 className={styles.tCardTitle}>{t.title}</h2>

                        <div className={styles.tCardMeta}>
                          <span>📍 {t.map}</span>
                          <span>📅 {new Date(t.matchTime).toLocaleDateString()}</span>
                          <span>⏰ {new Date(t.matchTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>

                        <div className={styles.tCardDivider} />

                        <div className={styles.tCardFooter}>
                          <div className={styles.tCardFeeBox}>
                            <span className={styles.tCardFeeLabel}>Entry</span>
                            <span className={styles.tCardFeeVal}>Rs {t.entryFee}</span>
                          </div>

                          <div className={styles.slotWrap}>
                            <div className={styles.slotBarBg}>
                              <div
                                className={styles.slotBarFill}
                                style={{ width: `${(t.participantCount / t.maxParticipants) * 100}%` }}
                              />
                            </div>
                            <span className={styles.slotText}>{t.participantCount}/{t.maxParticipants} Slots</span>
                          </div>

                          <div className={`${styles.viewBtn} ${t.status === 'open' ? styles.viewBtnOpen : styles.viewBtnClosed}`}>
                            {t.status === 'open' ? 'Register →' : 'View Details →'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
