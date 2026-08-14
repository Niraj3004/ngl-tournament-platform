'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const ALL_TOURNAMENTS = [
  { id: '1', title: 'Solo Ranked Championship', mode: 'Solo', entryFee: 50, prizePool: 5000, status: 'open', map: 'Bermuda', participants: 38, max: 50, game: 'Free Fire', date: '2026-08-16', time: '7:00 PM', kills: true },
  { id: '2', title: 'Duo Clash Tournament', mode: 'Duo', entryFee: 100, prizePool: 12000, status: 'open', map: 'Kalahari', participants: 18, max: 25, game: 'Free Fire', date: '2026-08-17', time: '6:00 PM', kills: true },
  { id: '3', title: 'Squad War Season 4', mode: 'Squad', entryFee: 200, prizePool: 50000, status: 'open', map: 'Purgatory', participants: 6, max: 12, game: 'Free Fire', date: '2026-08-18', time: '8:00 PM', kills: true },
  { id: '4', title: 'Solo Sprint — Daily', mode: 'Solo', entryFee: 20, prizePool: 1000, status: 'registration_closed', map: 'Bermuda', participants: 50, max: 50, game: 'Free Fire', date: '2026-08-14', time: '5:00 PM', kills: false },
  { id: '5', title: 'Elite Duo Showdown', mode: 'Duo', entryFee: 300, prizePool: 30000, status: 'started', map: 'Alpine', participants: 24, max: 24, game: 'Free Fire', date: '2026-08-14', time: '3:00 PM', kills: true },
  { id: '6', title: 'Weekend Squad Royale', mode: 'Squad', entryFee: 500, prizePool: 100000, status: 'open', map: 'Bermuda Remastered', participants: 4, max: 12, game: 'Free Fire', date: '2026-08-20', time: '8:00 PM', kills: true },
];

const MODES = ['All', 'Solo', 'Duo', 'Squad'];
const STATUSES = ['All', 'open', 'registration_closed', 'started', 'completed'];

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  registration_closed: 'Reg. Closed',
  started: 'Live Now',
  completed: 'Ended',
};

const STATUS_CLASS: Record<string, string> = {
  open: 'badge-green',
  registration_closed: 'badge-yellow',
  started: 'badge-orange',
  completed: '',
};

export default function TournamentsPage() {
  const [modeFilter, setModeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = ALL_TOURNAMENTS.filter(t => {
    if (modeFilter !== 'All' && t.mode !== modeFilter) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        {/* Page Header */}
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
            {/* Sidebar Filters */}
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
                        id={`mode-filter-${m.toLowerCase()}`}
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
                        id={`status-filter-${s}`}
                        className={`${styles.filterBtn} ${statusFilter === s ? styles.filterBtnActive : ''}`}
                        onClick={() => setStatusFilter(s)}
                      >
                        {s === 'All' ? 'All' : STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className={styles.filterCard}>
                <div className={styles.filterCardBar} />
                <div className={styles.filterCardInner}>
                  <h3 className={styles.filterTitle}>📊 Platform Stats</h3>
                  <div className={styles.sideStats}>
                    <div className={styles.sideStat}>
                      <span className={styles.sideStatVal}>6</span>
                      <span className={styles.sideStatLabel}>Active Tournaments</span>
                    </div>
                    <div className={styles.sideStat}>
                      <span className={`${styles.sideStatVal} glow-orange`}>Rs 1.98L+</span>
                      <span className={styles.sideStatLabel}>Total Prize Pool</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Grid */}
            <div className={styles.main}>
              {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <h3 className={styles.emptyTitle}>No Tournaments Found</h3>
                  <p className={styles.emptyText}>Try adjusting your filters</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {filtered.map(t => (
                    <Link key={t.id} href={`/tournaments/${t.id}`} className={`glass-card ${styles.tCard}`}>
                      <div className={styles.tCardBar} />
                      <div className={styles.tCardBody}>
                        <div className={styles.tCardTop}>
                          <div className={styles.tCardBadges}>
                            <span className={`badge badge-orange`}>{t.mode}</span>
                            <span className={`badge ${STATUS_CLASS[t.status] || ''}`}>
                              {t.status === 'started' ? '🔴 ' : ''}{STATUS_LABELS[t.status]}
                            </span>
                          </div>
                          <span className={styles.tCardPrize}>
                            Rs {t.prizePool.toLocaleString()}
                          </span>
                        </div>

                        <h2 className={styles.tCardTitle}>{t.title}</h2>

                        <div className={styles.tCardMeta}>
                          <span>📍 {t.map}</span>
                          <span>📅 {t.date}</span>
                          <span>⏰ {t.time}</span>
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
                                style={{ width: `${(t.participants / t.max) * 100}%` }}
                              />
                            </div>
                            <span className={styles.slotText}>{t.participants}/{t.max} Slots</span>
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
