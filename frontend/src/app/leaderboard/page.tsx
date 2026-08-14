'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [filter, setFilter] = useState('all-time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLB = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/leaderboard?filter=${filter}`, false);
        if (res.success) setLeaderboard(res.leaderboard);
      } catch (e) {}
      setLoading(false);
    };
    fetchLB();
  }, [filter]);

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <ParticleBackground />
        <div className={`container ${styles.content}`}>
          <h1 className={styles.title}>Global Leaderboard</h1>
          <div className={styles.filters}>
            {['today', 'week', 'month', 'all-time'].map(f => (
              <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
          {loading ? <p>Loading...</p> : (
            <table className={styles.table}>
              <thead><tr><th>Rank</th><th>Player</th><th>Kills</th><th>Points</th><th>Prize Won</th></tr></thead>
              <tbody>
                {leaderboard.map((lb, i) => (
                  <tr key={lb._id}>
                    <td>#{i + 1}</td>
                    <td>{lb.displayName || lb.gameId}</td>
                    <td>{lb.totalKills}</td>
                    <td>{lb.totalPoints}</td>
                    <td>Rs {lb.totalPrizeWon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
