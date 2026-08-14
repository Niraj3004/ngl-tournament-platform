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
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setEvidenceUrl(data.imageUrl);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err: any) {
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { reason: disputeReason, description: disputeDescription };
      if (evidenceUrl) payload.evidenceUrls = [evidenceUrl];

      const res = await api.post(`/tournaments/${params.id}/dispute`, payload);
      if (res.success) {
        alert('Dispute submitted successfully');
        setShowDispute(false);
        setDisputeReason('');
        setDisputeDescription('');
        setEvidenceUrl('');
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
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#8888aa' }}>Attach Evidence (Screenshot)</label>
                        <input type="file" accept="image/*" onChange={handleUpload} disabled={isUploading} style={{ color: '#fff' }} />
                        {isUploading && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#00c8ff' }}>Uploading...</span>}
                        {evidenceUrl && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff88', fontSize: '0.8rem', textDecoration: 'underline' }}>View Uploaded Image</a>
                          </div>
                        )}
                      </div>

                      <button className={styles.submitBtn} type="submit" disabled={isUploading}>Submit Dispute</button>
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
