'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from '../page.module.css';

export default function AdminPaymentCodes() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const res = await api.get('/payment-codes', true);
        if (res.success) setCodes(res.codes);
      } catch (err) {}
      setLoading(false);
    };
    fetchCodes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/payment-codes/generate', { 
        amount: Number(amount), 
        expiresAt 
      });
      if (res.success) {
        setCodes([res.paymentCode, ...codes]);
        setAmount('');
        setExpiresAt('');
        alert(`Code generated: ${res.paymentCode.code}`);
      }
    } catch (e: any) {
      alert(e.message || 'Error generating code');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 className={styles.title}>Payment Codes</h1>
      
      <div className={styles.card} style={{ marginBottom: '20px', maxWidth: '500px' }}>
        <h2>Generate New Code</h2>
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
          <input 
            type="number" 
            placeholder="Amount (Rs)" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            required 
            style={{ padding: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)', color: 'white', borderRadius: '4px' }} 
          />
          <input 
            type="datetime-local" 
            value={expiresAt} 
            onChange={e => setExpiresAt(e.target.value)} 
            required 
            style={{ padding: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)', color: 'white', borderRadius: '4px' }} 
          />
          <button type="submit" className="btn-primary">Generate</button>
        </form>
      </div>

      <div className={styles.card}>
        <h2>Existing Codes</h2>
        <div className={styles.tableWrap}>
          {loading ? <p>Loading...</p> : (
            <table className={styles.table}>
              <thead>
                <tr><th>Code</th><th>Amount</th><th>Status</th><th>Expires At</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.code}</strong></td>
                    <td>Rs {c.amount}</td>
                    <td>
                      <span className={styles.statusBadge} style={{ 
                        background: c.isRedeemed ? '#f44336' : (new Date(c.expiresAt) < new Date() ? '#9e9e9e' : '#4caf50') 
                      }}>
                        {c.isRedeemed ? 'Redeemed' : (new Date(c.expiresAt) < new Date() ? 'Expired' : 'Active')}
                      </span>
                    </td>
                    <td>{new Date(c.expiresAt).toLocaleString()}</td>
                    <td>
                      <button onClick={() => copyCode(c.code)} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>Copy</button>
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
