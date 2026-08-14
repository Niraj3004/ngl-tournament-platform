'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import styles from '../page.module.css'; // We'll put CSS in results folder

export default function ResultsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/tournaments/${params.id}/results`, false);
        if (res.success) {
          setMatch(res.match);
          setResults(res.results);
        }
      } catch (err) {}
      setLoading(false);
    };
    fetchResults();
  }, [params.id]);

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post(`/tournaments/${params.id}/dispute`, {
        reason: disputeReason, description: disputeDescription
      });
      if (res.success) {
        alert('Dispute submitted successfully');
        setShowDispute(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting dispute');
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <ParticleBackground />
        <div className={`container ${styles.content}`}>
          <h1 className={styles.title}>Match Results</h1>
          {loading ? <p>Loading...</p> : match ? (
            <div>
              <h2>{match.title}</h2>
              <table className={styles.table}>
                <thead>
                  <tr><th>Rank</th><th>Game ID</th><th>Kills</th><th>Points</th><th>Prize</th></tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r._id}>
                      <td>#{i + 1}</td><td>{r.gameId}</td><td>{r.kills}</td><td>{r.points}</td><td>{r.prizeWon ? `Rs ${r.prizeWon}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {user && match.status === 'completed' && (
                <div style={{ marginTop: '2rem' }}>
                  <button className={styles.btn} onClick={() => setShowDispute(!showDispute)}>Dispute Result</button>
                  {showDispute && (
                    <form onSubmit={handleSubmitDispute} className={styles.form}>
                      <input className={styles.input} required placeholder="Reason" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
                      <textarea className={styles.input} required placeholder="Description" value={disputeDescription} onChange={e => setDisputeDescription(e.target.value)} />
                      <button className={styles.submitBtn} type="submit">Submit</button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : <p>Match not found</p>}
        </div>
      </div>
      <Footer />
    </>
  );
}
