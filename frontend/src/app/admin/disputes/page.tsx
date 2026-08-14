'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from '../page.module.css';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await api.get('/admin/disputes', true);
        if (res.success) setDisputes(res.disputes);
      } catch (err) {}
      setLoading(false);
    };
    fetchDisputes();
  }, []);

  const handleResolve = async (id: string, status: string) => {
    const msg = prompt(`Enter resolution message for marking as ${status}:`);
    if (msg === null) return;
    try {
      const res = await api.post(`/admin/disputes/${id}/resolve`, { status, resolutionMessage: msg });
      if (res.success) {
        setDisputes(disputes.map(d => d._id === id ? res.dispute : d));
      }
    } catch (e: any) {
      alert(e.message || 'Error resolving dispute');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 className={styles.title}>Disputes</h1>
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          {loading ? <p>Loading...</p> : (
            <table className={styles.table}>
              <thead>
                <tr><th>Date</th><th>Match</th><th>Player UID</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d._id}>
                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td>{d.matchId?.title || 'Unknown'}</td>
                    <td>{d.uid}</td>
                    <td>
                      <strong>{d.reason}</strong><br/>
                      <small>{d.description}</small>
                    </td>
                    <td><span className={styles.statusBadge}>{d.status}</span></td>
                    <td>
                      {d.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleResolve(d._id, 'resolved')} style={{ background: '#4caf50', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Resolve</button>
                          <button onClick={() => handleResolve(d._id, 'rejected')} style={{ background: '#f44336', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
