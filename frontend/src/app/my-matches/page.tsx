'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import styles from './page.module.css';

type Tab = 'upcoming' | 'ongoing' | 'completed';

export default function MyMatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchMatches = async () => {
        try {
          const res = await api.get('/tournaments/my');
          if (res.success) {
            setMatches(res.matches || []);
          }
        } catch (error) {
          console.error('Failed to fetch matches', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMatches();
    }
  }, [user]);

  // Update timer every second for room reveal countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  if (authLoading || loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Loading matches...</div>;
  if (!user) return null;

  // Filter matches based on status
  const upcomingMatches = matches.filter(m => ['open', 'registration_closed', 'room_revealed'].includes(m.match.status));
  const ongoingMatches = matches.filter(m => m.match.status === 'started');
  const completedMatches = matches.filter(m => ['completed', 'cancelled', 'refunded'].includes(m.match.status));

  const getFilteredMatches = () => {
    if (activeTab === 'upcoming') return upcomingMatches;
    if (activeTab === 'ongoing') return ongoingMatches;
    return completedMatches;
  };

  const currentMatches = getFilteredMatches();

  return (
    <>
      <div className="scanlines" />
      <ParticleBackground />
      <Navbar />

      <main className={styles.page}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>MY <span className="glow-orange">MATCHES</span></h1>
            <p className={styles.subtitle}>Track your tournament history and room details</p>
          </div>

          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming ({upcomingMatches.length})
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'ongoing' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('ongoing')}
              >
                Ongoing ({ongoingMatches.length})
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed ({completedMatches.length})
              </button>
            </div>
          </div>

          <div className={styles.matchList}>
            {currentMatches.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏆</div>
                <h3>No matches found</h3>
                <p>You haven't joined any {activeTab} matches yet.</p>
                <button className="btn-primary" onClick={() => router.push('/tournaments')} style={{ marginTop: '1rem' }}>
                  Find a Match
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {currentMatches.map((m) => {
                  const match = m.match;
                  const participant = m.participant;
                  const revealTime = new Date(match.revealTime).getTime();
                  const isRevealTimePassed = now >= revealTime;

                  return (
                    <motion.div 
                      key={match._id}
                      className={`glass-card ${styles.matchCard}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <div className={styles.matchHeader}>
                        <div>
                          <h3 className={styles.matchTitle}>{match.title}</h3>
                          <div className={styles.matchMeta}>
                            <span>{new Date(match.matchTime).toLocaleString()}</span>
                            <span className={styles.dot}>•</span>
                            <span>{match.mode}</span>
                            <span className={styles.dot}>•</span>
                            <span>{match.map}</span>
                          </div>
                        </div>
                        <div className={styles.statusBadge} data-status={match.status}>
                          {match.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>

                      <div className={styles.participantInfo}>
                        <div className={styles.infoGroup}>
                          <span className={styles.infoLabel}>Game ID:</span>
                          <span className={styles.infoValue}>{participant.gameId}</span>
                        </div>
                        <div className={styles.infoGroup}>
                          <span className={styles.infoLabel}>Status:</span>
                          <span className={styles.infoValue} data-status={participant.status}>{participant.status.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Room Reveal Section for Upcoming/Ongoing Matches */}
                      {participant.status === 'joined' && (activeTab === 'upcoming' || activeTab === 'ongoing') && (
                        <div className={styles.roomPanel}>
                          <h4 className={styles.roomPanelTitle}>Room Details</h4>
                          
                          {isRevealTimePassed && match.roomDetails ? (
                            <div className={styles.roomDetails}>
                              <div className={styles.roomDetailItem}>
                                <div>
                                  <span className={styles.detailLabel}>Room ID</span>
                                  <span className={styles.detailValue}>{match.roomDetails.roomId}</span>
                                </div>
                                <button className={styles.copyBtn} onClick={() => handleCopy(match.roomDetails.roomId)}>
                                  COPY
                                </button>
                              </div>
                              <div className={styles.roomDetailItem}>
                                <div>
                                  <span className={styles.detailLabel}>Password</span>
                                  <span className={styles.detailValue}>{match.roomDetails.password || 'No Password'}</span>
                                </div>
                                <button className={styles.copyBtn} onClick={() => handleCopy(match.roomDetails.password || '')}>
                                  COPY
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className={styles.lockedPanel}>
                              <div className={styles.lockedIcon}>🔒</div>
                              <p className={styles.lockedText}>Room details will be revealed at:</p>
                              <p className={styles.revealTimeText}>{new Date(match.revealTime).toLocaleString()}</p>
                              {!isRevealTimePassed && (
                                <div className={styles.countdown}>
                                  Unlocks in: {Math.max(0, Math.floor((revealTime - now) / 60000))} mins
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Results Section for Completed Matches */}
                      {activeTab === 'completed' && (
                        <div className={styles.resultsPanel}>
                          <div className={styles.resultItem}>
                            <span className={styles.resultLabel}>Kills</span>
                            <span className={styles.resultValue}>{participant.kills || 0}</span>
                          </div>
                          <div className={styles.resultItem}>
                            <span className={styles.resultLabel}>Placement</span>
                            <span className={styles.resultValue}>{participant.placement ? `#${participant.placement}` : '-'}</span>
                          </div>
                          <div className={styles.resultItem}>
                            <span className={styles.resultLabel}>Prize Won</span>
                            <span className={`${styles.resultValue} glow-yellow`}>Rs {participant.prizeWon || 0}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
