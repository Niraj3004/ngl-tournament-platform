'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import styles from './page.module.css';

export default function TournamentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [match, setMatch] = useState<any>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [participantData, setParticipantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [gameId, setGameId] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchDetails = async () => {
    try {
      // Pass 'false' for requireAuth if the user is not logged in, 
      // but api.get sends the token if it exists anyway.
      const res = await api.get(`/tournaments/${params.id}`, false);
      if (res.success) {
        setMatch(res.match);
        setHasJoined(res.hasJoined);
        setParticipantData(res.participantData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [params.id, user]); // Refetch if auth state changes

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login first to join tournaments.');
      router.push('/login');
      return;
    }
    
    setJoining(true);
    try {
      const res = await api.post(`/tournaments/${match._id}/join`, { gameId });
      if (res.success) {
        alert('Successfully joined the tournament! Entry fee deducted.');
        setIsJoinModalOpen(false);
        fetchDetails(); // Refresh to get updated joined status
      }
    } catch (err: any) {
      alert(err.message || 'Failed to join tournament. Check your wallet balance.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Loading details...</div>;
  if (!match) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Tournament not found.</div>;

  return (
    <>
      <div className="scanlines" />
      <ParticleBackground />
      <Navbar />

      <main className={styles.page}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link href="/tournaments">← Back to Tournaments</Link>
          </div>

          <div className={styles.grid}>
            {/* Main Content */}
            <div className={styles.mainContent}>
              <div className={`glass-card ${styles.card}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.badges}>
                    <span className="badge badge-orange">{match.mode}</span>
                    <span className="badge badge-green">{match.status.toUpperCase()}</span>
                  </div>
                </div>

                <h1 className={styles.title}>{match.title}</h1>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailBox}>
                    <span className={styles.detailLabel}>Match Time</span>
                    <span className={styles.detailValue}>
                      {new Date(match.matchTime).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.detailBox}>
                    <span className={styles.detailLabel}>Map</span>
                    <span className={styles.detailValue}>{match.map}</span>
                  </div>
                  <div className={styles.detailBox}>
                    <span className={styles.detailLabel}>Perspective</span>
                    <span className={styles.detailValue}>{match.perspective || 'TPP'}</span>
                  </div>
                </div>

                {/* Secure Room Reveal Section */}
                {hasJoined ? (
                  <div className={styles.joinedSection}>
                    <h3 className={styles.joinedTitle}>✅ You are registered!</h3>
                    
                    {match.status === 'room_revealed' && match.roomDetails ? (
                      <div className={styles.roomDetailsCard}>
                        <h4 style={{ color: 'var(--primary-orange)', margin: '0 0 1rem 0' }}>🔐 Secure Room Details</h4>
                        <div className={styles.roomInfo}>
                          <div>
                            <span className={styles.detailLabel}>Room ID</span>
                            <span className={styles.secretValue}>{match.roomDetails.roomId}</span>
                          </div>
                          <div>
                            <span className={styles.detailLabel}>Password</span>
                            <span className={styles.secretValue}>{match.roomDetails.roomPassword}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: 0 }}>
                          Do not share these details. Enter the custom room immediately.
                        </p>
                      </div>
                    ) : (
                      <div className={styles.waitingCard}>
                        <p>Waiting for admin to reveal room details...</p>
                        <small>Room details will appear here shortly before the match starts.</small>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Sidebar / CTA */}
            <div className={styles.sidebar}>
              <div className={`glass-card ${styles.ctaCard}`}>
                <h3 className={styles.ctaTitle}>Tournament Registration</h3>
                
                <div className={styles.financials}>
                  <div className={styles.finRow}>
                    <span>Entry Fee</span>
                    <span style={{ fontWeight: 'bold' }}>Rs {match.entryFee}</span>
                  </div>
                  <div className={styles.finDivider} />
                  <div className={styles.finRow}>
                    <span>Prize Pool</span>
                    <span className="glow-yellow" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                      Rs {match.prizePool.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className={styles.slots}>
                  <div className={styles.slotHeader}>
                    <span>Slots Filled</span>
                    <span>{match.participantCount} / {match.maxParticipants}</span>
                  </div>
                  <div className={styles.slotBg}>
                    <div 
                      className={styles.slotFill} 
                      style={{ width: `${(match.participantCount / match.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>

                {!hasJoined && match.status === 'open' && (
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
                    onClick={() => {
                      if (!user) {
                        alert('Please login first to join tournaments.');
                        router.push('/login');
                        return;
                      }
                      setIsJoinModalOpen(true);
                    }}
                  >
                    JOIN NOW (Rs {match.entryFee})
                  </button>
                )}

                {hasJoined && (
                  <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', cursor: 'default' }} disabled>
                    REGISTERED
                  </button>
                )}

                {!hasJoined && match.status !== 'open' && (
                  <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', cursor: 'not-allowed' }} disabled>
                    REGISTRATION CLOSED
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Join Modal */}
        {isJoinModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Join Tournament</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                You are about to join <strong>{match.title}</strong>. 
                <br/>Entry Fee: <strong>Rs {match.entryFee}</strong> will be deducted from your wallet.
              </p>
              <form onSubmit={handleJoin}>
                <div className={styles.formGroup}>
                  <label>Your Free Fire In-Game ID (UID)</label>
                  <input 
                    type="text" 
                    required 
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className={styles.input}
                    placeholder="e.g. 1234567890"
                  />
                  <small style={{ color: 'var(--primary-orange)' }}>Must exactly match your in-game ID to claim prizes.</small>
                </div>
                
                <div className={styles.modalActions}>
                  <button type="button" className="btn-secondary" onClick={() => setIsJoinModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={joining}>
                    {joining ? 'Processing...' : 'Confirm Payment & Join'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
