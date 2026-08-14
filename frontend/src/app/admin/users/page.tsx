'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for adjusting balance
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.success) setUsers(res.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      const res = await api.post(`/admin/users/${selectedUser.uid}/balance`, { 
        amount: Number(adjustAmount), 
        reason: adjustReason 
      });
      if (res.success) {
        alert('Balance adjusted successfully!');
        setIsModalOpen(false);
        setAdjustAmount('');
        setAdjustReason('');
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to adjust balance');
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.title}>User Management</h1>
      
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User / Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Balances (Avail / Locked)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{textAlign:'center'}}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center', color: 'var(--text-secondary)'}}>No users found.</td></tr>
              ) : users.map(u => (
                <tr key={u.uid}>
                  <td>
                    <strong>{u.displayName || 'No Name'}</strong><br/>
                    <small style={{color:'var(--text-secondary)'}}>{u.email}</small>
                  </td>
                  <td>{u.role.toUpperCase()}</td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-orange'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    Rs {u.availableBalance.toLocaleString()} / Rs {u.lockedBalance.toLocaleString()}
                  </td>
                  <td>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      onClick={() => {
                        setSelectedUser(u);
                        setIsModalOpen(true);
                      }}
                    >
                      Adjust Balance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Adjust Balance for {selectedUser?.displayName || selectedUser?.email}</h2>
            <form onSubmit={handleAdjustBalance}>
              <div className={styles.formGroup}>
                <label>Amount (Use negative for deduction)</label>
                <input 
                  type="number" 
                  required 
                  value={adjustAmount} 
                  onChange={(e) => setAdjustAmount(e.target.value)} 
                  className={styles.input}
                  placeholder="e.g. 500 or -200"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Reason / Description</label>
                <input 
                  type="text" 
                  required 
                  value={adjustReason} 
                  onChange={(e) => setAdjustReason(e.target.value)} 
                  className={styles.input}
                  placeholder="e.g. Winner Bonus"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
