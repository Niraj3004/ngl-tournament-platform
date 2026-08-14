'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

// Mock data — will be replaced with API call in real version
const TOURNAMENTS: Record<string, any> = {
  '1': {
    id: '1', title: 'Solo Ranked Championship', mode: 'Solo', entryFee: 50,
    prizePool: 5000, status: 'open', map: 'Bermuda', participants: 38, max: 50,
    game: 'Free Fire', date: '2026-08-16', time: '7:00 PM NPT',
    description: 'The most prestigious solo tournament of the season. Prove your individual skill against Nepal\'s best Free Fire players. Points are calculated by kills + placement. Top 3 players take home the prize money.',
    rules: [
      'Solo mode only — no squad or team assistance',
      'Room ID and password will be shared 15 minutes before match',
      'Players must be in room before the countdown ends',
      'Hacking, emulators, or cheating tools = instant ban',
      'Screenshots of results must be submitted within 10 minutes',
      'Admin decisions are final',
    ],
    prizeDistribution: [
      { rank: 1, label: '🥇 1st Place', amount: 2500, pct: 50 },
      { rank: 2, label: '🥈 2nd Place', amount: 1500, pct: 30 },
      { rank: 3, label: '🥉 3rd Place', amount: 1000, pct: 20 },
    ],
    scoringSystem: [
      { event: 'Booyah (1st Place)', points: 12 },
      { event: '2nd Place', points: 9 },
      { event: '3rd Place', points: 8 },
      { event: '4th Place', points: 7 },
      { event: '5th Place', points: 6 },
      { event: 'Each Kill', points: 1 },
    ],
    organizer: 'NGL Admin Team',
    registeredPlayers: [
      { uid: 'player_001', name: 'SniperKing_FF', kills: 0 },
      { uid: 'player_002', name: 'GodLike_Nepal', kills: 0 },
      { uid: 'player_003', name: 'FF_Legend_NP', kills: 0 },
    ],
  },
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Registration Open',
  registration_closed: 'Registration Closed',
  started: '🔴 Live Now',
  completed: 'Completed',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'badge-green',
  registration_closed: 'badge-yellow',
  started: 'badge-orange',
  completed: '',
};

export default function TournamentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const t = TOURNAMENTS[id];
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'prizes' | 'players'>('overview');

  if (!t) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <div className="container">
            <div className={styles.notFound}>
              <div className={styles.notFoundIcon}>🔍</div>
              <h2 className={styles.notFoundTitle}>Tournament Not Found</h2>
              <Link href="/tournaments" className="btn-primary">← Back to Tournaments</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const slotsLeft = t.max - t.participants;
  const slotPct = (t.participants / t.max) * 100;

  const handleJoin = async () => {
    setJoining(true);
    // TODO: api.post(`/tournaments/${t.id}/join`, {})
    setTimeout(() => { setJoining(false); setJoined(true); }, 1400);
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        {/* ── Hero Banner ── */}
        <div className={styles.banner}>
          <div className={styles.bannerOverlay} />
          <div className="container">
            <div className={styles.bannerInner}>
              <div className={styles.bannerLeft}>
                <p className={styles.breadcrumb}>
                  <Link href="/">Home</Link> / <Link href="/tournaments">Tournaments</Link> / {t.title}
                </p>
                <div className={styles.bannerBadges}>
                  <span className={`badge badge-orange`}>{t.game}</span>
                  <span className={`badge badge-blue`}>{t.mode}</span>
                  <span className={`badge ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                </div>
                <h1 className={styles.bannerTitle}>{t.title}</h1>
                <div className={styles.bannerMeta}>
                  <span>📍 {t.map}</span>
                  <span>📅 {t.date}</span>
                  <span>⏰ {t.time}</span>
                  <span>👤 {t.organizer}</span>
                </div>
              </div>
              {/* Prize + Join Box */}
              <div className={styles.joinBox}>
                <div className={styles.joinBoxBar} />
                <div className={styles.joinBoxInner}>
                  <div className={styles.prizeDisplay}>
                    <span className={styles.prizeLabel}>Total Prize Pool</span>
                    <span className={styles.prizeValue}>Rs {t.prizePool.toLocaleString()}</span>
                  </div>

                  <div className={styles.joinDivider} />

                  <div className={styles.joinDetails}>
                    <div className={styles.joinDetailRow}>
                      <span className={styles.joinDetailLabel}>Entry Fee</span>
                      <span className={styles.joinDetailVal}>Rs {t.entryFee}</span>
                    </div>
                    <div className={styles.joinDetailRow}>
                      <span className={styles.joinDetailLabel}>Mode</span>
                      <span className={styles.joinDetailVal}>{t.mode}</span>
                    </div>
                    <div className={styles.joinDetailRow}>
                      <span className={styles.joinDetailLabel}>Slots Left</span>
                      <span className={`${styles.joinDetailVal} ${slotsLeft < 5 ? styles.slotsUrgent : ''}`}>
                        {slotsLeft} / {t.max}
                      </span>
                    </div>
                  </div>

                  {/* Slot bar */}
                  <div className={styles.slotBarWrap}>
                    <div className={styles.slotBarBg}>
                      <div className={styles.slotBarFill} style={{ width: `${slotPct}%` }} />
                    </div>
                    <span className={styles.slotText}>{t.participants}/{t.max} players registered</span>
                  </div>

                  {/* Join / Joined Button */}
                  {t.status === 'open' && !joined && (
                    <button
                      id="join-tournament-btn"
                      className={`btn-primary ${styles.joinBtn}`}
                      onClick={handleJoin}
                      disabled={joining}
                    >
                      {joining ? <><span className={styles.spinner} /> Registering...</> : `⚡ Join for Rs ${t.entryFee}`}
                    </button>
                  )}
                  {joined && (
                    <div className={styles.joinedSuccess}>
                      ✅ You are registered! Room details will be sent 15 min before match.
                    </div>
                  )}
                  {t.status !== 'open' && !joined && (
                    <div className={styles.closedMsg}>
                      Registration is {t.status === 'started' ? 'closed — match is live' : STATUS_LABELS[t.status].toLowerCase()}
                    </div>
                  )}

                  <p className={styles.joinNote}>
                    💳 Entry fee will be deducted from your wallet balance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabsWrap}>
          <div className="container">
            <div className={styles.tabs}>
              {(['overview', 'rules', 'prizes', 'players'] as const).map(tab => (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="container">
          <div className={styles.tabContent}>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className={styles.section}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardBar} />
                    <div className={styles.infoCardInner}>
                      <h3 className={styles.infoCardTitle}>📋 About This Tournament</h3>
                      <p className={styles.infoCardText}>{t.description}</p>
                    </div>
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.infoCardBar} />
                    <div className={styles.infoCardInner}>
                      <h3 className={styles.infoCardTitle}>🎯 Scoring System</h3>
                      <div className={styles.scoringTable}>
                        {t.scoringSystem.map((s: any) => (
                          <div key={s.event} className={styles.scoringRow}>
                            <span className={styles.scoringEvent}>{s.event}</span>
                            <span className={styles.scoringPoints}>+{s.points} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.infoCardBar} />
                    <div className={styles.infoCardInner}>
                      <h3 className={styles.infoCardTitle}>⏱ Schedule</h3>
                      <div className={styles.scheduleList}>
                        <div className={styles.scheduleRow}>
                          <span className={styles.scheduleLabel}>Registration Closes</span>
                          <span className={styles.scheduleVal}>{t.date} · 6:30 PM</span>
                        </div>
                        <div className={styles.scheduleRow}>
                          <span className={styles.scheduleLabel}>Room ID Shared</span>
                          <span className={styles.scheduleVal}>{t.date} · 6:45 PM</span>
                        </div>
                        <div className={styles.scheduleRow}>
                          <span className={styles.scheduleLabel}>Match Starts</span>
                          <span className={styles.scheduleVal}>{t.date} · {t.time}</span>
                        </div>
                        <div className={styles.scheduleRow}>
                          <span className={styles.scheduleLabel}>Results Published</span>
                          <span className={styles.scheduleVal}>Within 30 min after match</span>
                        </div>
                        <div className={styles.scheduleRow}>
                          <span className={styles.scheduleLabel}>Prizes Credited</span>
                          <span className={`${styles.scheduleVal} glow-orange`}>Instantly after results</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RULES */}
            {activeTab === 'rules' && (
              <div className={styles.section}>
                <div className={styles.infoCard}>
                  <div className={styles.infoCardBar} />
                  <div className={styles.infoCardInner}>
                    <h3 className={styles.infoCardTitle}>📜 Tournament Rules</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                      All players must adhere to these rules. Violations may result in disqualification or permanent ban.
                    </p>
                    <ol className={styles.rulesList}>
                      {t.rules.map((rule: string, i: number) => (
                        <li key={i} className={styles.ruleItem}>
                          <span className={styles.ruleNum}>{String(i + 1).padStart(2, '0')}</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* PRIZES */}
            {activeTab === 'prizes' && (
              <div className={styles.section}>
                <div className={styles.infoCard}>
                  <div className={styles.infoCardBar} />
                  <div className={styles.infoCardInner}>
                    <h3 className={styles.infoCardTitle}>🏆 Prize Distribution</h3>
                    <div className={styles.prizeTable}>
                      <div className={styles.prizeTableHeader}>
                        <span>Rank</span>
                        <span>Prize Amount</span>
                        <span>Share</span>
                      </div>
                      {t.prizeDistribution.map((p: any) => (
                        <div key={p.rank} className={`${styles.prizeTableRow} ${p.rank === 1 ? styles.prizeTopRow : ''}`}>
                          <span className={styles.prizeRank}>{p.label}</span>
                          <span className={styles.prizeAmt}>Rs {p.amount.toLocaleString()}</span>
                          <span className={styles.prizePct}>{p.pct}%</span>
                        </div>
                      ))}
                      <div className={styles.prizeTotal}>
                        <span>Total Pool</span>
                        <span className="glow-orange">Rs {t.prizePool.toLocaleString()}</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <p className={styles.prizeNote}>
                      ⚡ Prizes are automatically credited to winner wallets immediately after results are published by the admin.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PLAYERS */}
            {activeTab === 'players' && (
              <div className={styles.section}>
                <div className={styles.infoCard}>
                  <div className={styles.infoCardBar} />
                  <div className={styles.infoCardInner}>
                    <h3 className={styles.infoCardTitle}>👥 Registered Players ({t.participants}/{t.max})</h3>
                    <div className={styles.playersTable}>
                      <div className={styles.playersHeader}>
                        <span>#</span>
                        <span>Player</span>
                        <span>Status</span>
                      </div>
                      {t.registeredPlayers.map((p: any, i: number) => (
                        <div key={p.uid} className={styles.playerRow}>
                          <span className={styles.playerNum}>{i + 1}</span>
                          <span className={styles.playerName}>{p.name}</span>
                          <span className="badge badge-green">Registered</span>
                        </div>
                      ))}
                      {/* Remaining empty slots */}
                      {Array.from({ length: Math.min(slotsLeft, 5) }).map((_, i) => (
                        <div key={`empty-${i}`} className={`${styles.playerRow} ${styles.playerRowEmpty}`}>
                          <span className={styles.playerNum}>{t.registeredPlayers.length + i + 1}</span>
                          <span className={styles.playerName}>Waiting for player...</span>
                          <span className="badge">Open</span>
                        </div>
                      ))}
                    </div>
                    {slotsLeft > 5 && (
                      <p className={styles.moreSlots}>+ {slotsLeft - 5} more open slots</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
