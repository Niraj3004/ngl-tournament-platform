'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from '../page.module.css';

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/admin/support', true);
        if (res.success) setTickets(res.tickets);
      } catch (err) {}
      setLoading(false);
    };
    fetchTickets();
  }, []);

  const handleReply = async (id: string) => {
    const msg = prompt(`Enter reply message:`);
    if (!msg) return;
    const shouldClose = confirm('Do you want to close this ticket?');
    try {
      const res = await api.post(`/admin/support/${id}/reply`, { 
        message: msg, 
        status: shouldClose ? 'closed' : 'open' 
      });
      if (res.success) {
        setTickets(tickets.map(t => t._id === id ? res.ticket : t));
      }
    } catch (e: any) {
      alert(e.message || 'Error replying to ticket');
    }
  };

  const handleClose = async (id: string) => {
    try {
      const res = await api.post(`/admin/support/${id}/reply`, { status: 'closed' });
      if (res.success) {
        setTickets(tickets.map(t => t._id === id ? res.ticket : t));
      }
    } catch (e: any) {
      alert(e.message || 'Error closing ticket');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 className={styles.title}>Support Tickets</h1>
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          {loading ? <p>Loading...</p> : (
            <table className={styles.table}>
              <thead>
                <tr><th>Date</th><th>Category</th><th>Subject</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t._id}>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>{t.category}</td>
                    <td>{t.subject}</td>
                    <td><span className={styles.statusBadge}>{t.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => alert(JSON.stringify(t.messages, null, 2))} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>View Msgs</button>
                        {t.status !== 'closed' && (
                          <>
                            <button onClick={() => handleReply(t._id)} style={{ background: '#2196f3', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Reply</button>
                            <button onClick={() => handleClose(t._id)} style={{ background: '#f44336', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                          </>
                        )}
                      </div>
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
