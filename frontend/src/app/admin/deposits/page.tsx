'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = async () => {
    try {
      const res = await api.get('/admin/deposits');
      if (res.success) setDeposits(res.deposits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleResolve = async (id: string, action: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this deposit as ${action}?`)) return;
    try {
      const res = await api.post(`/admin/deposits/${id}/resolve`, { action });
      if (res.success) {
        alert(`Deposit ${action} successfully!`);
        fetchDeposits();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to process request');
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.title}>Pending Deposits</h1>
      
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Player UID</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{textAlign:'center'}}>Loading...</td></tr>
              ) : deposits.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center', color: 'var(--text-secondary)'}}>No pending deposits.</td></tr>
              ) : deposits.map(d => (
                <tr key={d._id}>
                  <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td>{d.uid}</td>
                  <td>{d.transactionId}</td>
                  <td className="text-success" style={{ fontWeight: 'bold' }}>
                    Rs {d.amount.toLocaleString()}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={`btn-primary ${styles.btnSmall}`} 
                        onClick={() => handleResolve(d._id, 'approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className={`btn-secondary ${styles.btnSmall}`} 
                        onClick={() => handleResolve(d._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
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
