'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CreateTournament() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    matchTime: '',
    entryFee: 0,
    prizePool: 0,
    mode: 'Solo',
    map: 'Bermuda',
    perspective: 'TPP',
    maxParticipants: 48
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/tournaments', {
        ...formData,
        entryFee: Number(formData.entryFee),
        prizePool: Number(formData.prizePool),
        maxParticipants: Number(formData.maxParticipants),
        matchTime: new Date(formData.matchTime).toISOString()
      });
      if (res.success) {
        alert('Tournament created successfully!');
        router.push('/admin/tournaments');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.title}>Create Tournament</h1>
      
      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input 
              type="text" 
              required 
              className={styles.input} 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Match Time</label>
              <input 
                type="datetime-local" 
                required 
                className={styles.input} 
                value={formData.matchTime}
                onChange={e => setFormData({...formData, matchTime: e.target.value})}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Entry Fee (Rs)</label>
              <input 
                type="number" 
                required 
                className={styles.input} 
                value={formData.entryFee}
                onChange={e => setFormData({...formData, entryFee: Number(e.target.value)})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Prize Pool (Rs)</label>
              <input 
                type="number" 
                required 
                className={styles.input} 
                value={formData.prizePool}
                onChange={e => setFormData({...formData, prizePool: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Mode</label>
              <select className={styles.input} value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value as any})}>
                <option value="Solo">Solo</option>
                <option value="Duo">Duo</option>
                <option value="Squad">Squad</option>
                <option value="Clash Squad">Clash Squad</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Map</label>
              <select className={styles.input} value={formData.map} onChange={e => setFormData({...formData, map: e.target.value as any})}>
                <option value="Bermuda">Bermuda</option>
                <option value="Purgatory">Purgatory</option>
                <option value="Kalahari">Kalahari</option>
                <option value="Alpine">Alpine</option>
                <option value="NeXTerra">NeXTerra</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Max Participants</label>
              <input 
                type="number" 
                required 
                className={styles.input} 
                value={formData.maxParticipants}
                onChange={e => setFormData({...formData, maxParticipants: Number(e.target.value)})}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </form>
      </div>
    </div>
  );
}
