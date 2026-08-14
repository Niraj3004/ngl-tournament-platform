'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

const LIFECYCLE_STAGES = ['open', 'registration_closed', 'room_revealed', 'started', 'completed', 'cancelled'];

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
    try {
      const res = await api.get('/tournaments', false);
      if (res.success) setTournaments(res.tournaments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleChangeLifecycle = async (matchId: string, newState: string) => {
    if (!confirm(`Are you sure you want to change the status to ${newState}?`)) return;
    try {
      const res = await api.post(`/tournaments/${matchId}/lifecycle`, { targetState: newState });
      if (res.success) {
        alert('Status updated successfully');
        fetchTournaments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.title}>Tournament Management</h1>
      
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Slots</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{textAlign:'center'}}>Loading...</td></tr>
              ) : tournaments.map(t => (
                <tr key={t.matchId}>
                  <td><strong>{t.title}</strong><br/><small style={{color:'var(--text-secondary)'}}>{t.matchId}</small></td>
                  <td>{t.mode}</td>
                  <td>
                    <span className={`badge ${t.lifecycle === 'completed' ? 'badge-green' : t.lifecycle === 'open' ? 'badge-blue' : 'badge-orange'}`}>
                      {t.lifecycle}
                    </span>
                  </td>
                  <td>{t.currentParticipants} / {t.maxParticipants}</td>
                  <td>
                    <select 
                      className={styles.select}
                      value={t.lifecycle}
                      onChange={(e) => handleChangeLifecycle(t.matchId, e.target.value)}
                    >
                      {LIFECYCLE_STAGES.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
