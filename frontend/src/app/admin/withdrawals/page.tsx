'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals');
      if (res.success) setWithdrawals(res.withdrawals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleResolve = async (id: string, action: 'paid' | 'refunded') => {
    if (!confirm(`Are you sure you want to mark this withdrawal as ${action}?`)) return;
    try {
      const res = await api.post(`/admin/withdrawals/${id}/resolve`, { action });
      if (res.success) {
        alert(`Withdrawal ${action} successfully!`);
        fetchWithdrawals(); // Refresh list
      }
    } catch (err: any) {
      alert(err.message || 'Failed to process request');
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.title}>Pending Withdrawals</h1>
      
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Player UID</th>
                <th>Details</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{textAlign:'center'}}>Loading...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center', color: 'var(--text-secondary)'}}>No pending withdrawals.</td></tr>
              ) : withdrawals.map(w => (
                <tr key={w._id}>
                  <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td>{w.uid}</td>
                  <td>{w.description}</td>
                  <td className="text-danger" style={{ fontWeight: 'bold' }}>
                    Rs {Math.abs(w.amount).toLocaleString()}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={`btn-primary ${styles.btnSmall}`} 
                        onClick={() => handleResolve(w._id, 'paid')}
                      >
                        Approve
                      </button>
                      <button 
                        className={`btn-secondary ${styles.btnSmall}`} 
                        onClick={() => handleResolve(w._id, 'refunded')}
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
