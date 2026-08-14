'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

const LIFECYCLE_STAGES = ['open', 'registration_closed', 'room_revealed', 'started', 'completed', 'cancelled'];

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [roomData, setRoomData] = useState({ roomId: '', roomPassword: '' });

  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [prizeData, setPrizeData] = useState([{ uid: '', amount: '' }]);

  const fetchTournaments = async () => {
    try {
      const res = await api.get('/tournaments', false);
      if (res.success) setTournaments(res.matches || []);
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;
    try {
      const res = await api.put(`/tournaments/${selectedTournament.matchId}`, {
        roomDetails: {
          roomId: roomData.roomId,
          roomPassword: roomData.roomPassword
        }
      });
      if (res.success) {
        alert('Room details updated!');
        setIsEditModalOpen(false);
        fetchTournaments(); // Refresh list to get potentially updated data (though roomDetails is excluded in list, we might want it for display, but list excludes it. That's fine.)
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    }
  };

  const handlePrizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;
    try {
      const formattedPrizes = prizeData.filter(p => p.uid && p.amount).map(p => ({
        uid: p.uid,
        amount: Number(p.amount)
      }));
      const res = await api.post(`/tournaments/${selectedTournament.matchId}/prizes`, { prizes: formattedPrizes });
      if (res.success) {
        alert('Prizes distributed successfully!');
        setIsPrizeModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to distribute prizes');
    }
  };

  return (
    <div className={styles.adminPage}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>Tournament Management</h1>
        <a href="/admin/tournaments/create" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Create Tournament
        </a>
      </div>
      
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select 
                        className={styles.select}
                        value={t.lifecycle}
                        onChange={(e) => handleChangeLifecycle(t.matchId, e.target.value)}
                      >
                        {LIFECYCLE_STAGES.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        onClick={() => {
                          setSelectedTournament(t);
                          setRoomData({ roomId: '', roomPassword: '' }); // Reset or prefill if fetched
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit Room
                      </button>
                      {t.lifecycle === 'completed' && (
                        <button 
                          className="btn-primary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                          onClick={() => {
                            setSelectedTournament(t);
                            setPrizeData([{ uid: '', amount: '' }]);
                            setIsPrizeModalOpen(true);
                          }}
                        >
                          Prizes
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Room Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Update Room Details</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label>Room ID</label>
                <input 
                  type="text" 
                  required 
                  value={roomData.roomId} 
                  onChange={(e) => setRoomData({...roomData, roomId: e.target.value})} 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Room Password</label>
                <input 
                  type="text" 
                  required 
                  value={roomData.roomPassword} 
                  onChange={(e) => setRoomData({...roomData, roomPassword: e.target.value})} 
                  className={styles.input}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribute Prizes Modal */}
      {isPrizeModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '600px' }}>
            <h2>Distribute Prizes for {selectedTournament?.title}</h2>
            <form onSubmit={handlePrizeSubmit}>
              {prizeData.map((prize, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Player UID</label>
                    <input 
                      type="text" 
                      required 
                      value={prize.uid} 
                      onChange={(e) => {
                        const newData = [...prizeData];
                        newData[idx].uid = e.target.value;
                        setPrizeData(newData);
                      }} 
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Amount (Rs)</label>
                    <input 
                      type="number" 
                      required 
                      value={prize.amount} 
                      onChange={(e) => {
                        const newData = [...prizeData];
                        newData[idx].amount = e.target.value;
                        setPrizeData(newData);
                      }} 
                      className={styles.input}
                    />
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setPrizeData([...prizeData, { uid: '', amount: '' }])}
                style={{ marginBottom: '1.5rem' }}
              >
                + Add Another Winner
              </button>

              <div className={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => setIsPrizeModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Distribute Prizes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
