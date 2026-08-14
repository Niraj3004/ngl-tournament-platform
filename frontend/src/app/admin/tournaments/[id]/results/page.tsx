'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from '../../../page.module.css'; // use admin page styles

export default function AdminTournamentResultsEntry() {
  const params = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for result entries
  const [results, setResults] = useState<{ [uid: string]: { kills: number, placement: number } }>({});

  useEffect(() => {
    const fetchMatchAndParticipants = async () => {
      try {
        const [matchRes, partRes] = await Promise.all([
          api.get(`/tournaments/${params.id}`, false),
          api.get(`/tournaments/${params.id}/participants`, true)
        ]);
        
        if (matchRes.success) setMatch(matchRes.match);
        if (partRes.success) {
          setParticipants(partRes.participants);
          // Initialize results state
          const initialResults: any = {};
          partRes.participants.forEach((p: any) => {
            initialResults[p.uid] = { kills: 0, placement: 0 };
          });
          setResults(initialResults);
        }
      } catch (err) {}
      setLoading(false);
    };
    fetchMatchAndParticipants();
  }, [params.id]);

  const handleResultChange = (uid: string, field: 'kills' | 'placement', value: number) => {
    setResults(prev => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        [field]: value
      }
    }));
  };

  const handleSaveResults = async () => {
    try {
      // Loop through all participants and enter results
      for (const p of participants) {
        const resData = results[p.uid];
        if (resData.kills > 0 || resData.placement > 0) {
           await api.post(`/tournaments/${params.id}/results`, {
             uid: p.uid,
             kills: resData.kills,
             placement: resData.placement
           }, true);
        }
      }
      alert('Results saved successfully!');
    } catch (e: any) {
      alert(e.message || 'Error saving some results');
    }
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish? This will lock the results and calculate points/prizes.')) return;
    try {
      const res = await api.post(`/tournaments/${params.id}/results/publish`, {}, true);
      if (res.success) {
        alert('Results published and prizes distributed!');
        router.push('/admin/tournaments');
      }
    } catch (e: any) {
      alert(e.message || 'Error publishing results');
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => router.back()} className="btn-secondary" style={{ marginBottom: '20px' }}>&larr; Back</button>
      <h1 className={styles.title}>Results Entry: {match?.title}</h1>
      
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Player UID</th>
                <th>Game ID</th>
                <th>Kills</th>
                <th>Placement</th>
              </tr>
            </thead>
            <tbody>
              {participants.map(p => (
                <tr key={p._id}>
                  <td>{p.uid}</td>
                  <td>{p.gameId}</td>
                  <td>
                    <input 
                      type="number" 
                      min="0"
                      value={results[p.uid]?.kills || 0} 
                      onChange={e => handleResultChange(p.uid, 'kills', Number(e.target.value))}
                      style={{ padding: '5px', width: '80px', background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)', color: 'white', borderRadius: '4px' }}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      min="0"
                      value={results[p.uid]?.placement || 0} 
                      onChange={e => handleResultChange(p.uid, 'placement', Number(e.target.value))}
                      style={{ padding: '5px', width: '80px', background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)', color: 'white', borderRadius: '4px' }}
                    />
                  </td>
                </tr>
              ))}
              {participants.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center' }}>No participants found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {participants.length > 0 && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={handleSaveResults} className="btn-secondary">Save Draft Results</button>
            <button onClick={handlePublish} className="btn-primary">Publish Results</button>
          </div>
        )}
      </div>
    </div>
  );
}
