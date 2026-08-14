'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function WalletPage() {
  const { user, wallet, refreshMe } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'deposit' | 'withdraw' | 'redeem'>('history');
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await api.get('/wallet/transactions');
          if (res.success) setTransactions(res.transactions);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab]);
  
  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('esewa');
  const [depositTransactionId, setDepositTransactionId] = useState('');
  const [depositReceiptUrl, setDepositReceiptUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('khalti');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Redeem Form State
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('ngl_token') || localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setDepositReceiptUrl(data.imageUrl);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err: any) {
      alert('Error uploading image');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositTransactionId || !depositReceiptUrl) {
      alert('Transaction ID and Receipt Screenshot are required.');
      return;
    }
    setDepositLoading(true);
    try {
      const res = await api.post('/deposits', { 
        amount: depositAmount, 
        transactionId: depositTransactionId, 
        receiptUrl: depositReceiptUrl 
      });
      if (res.success) {
        alert('Deposit request submitted! Please wait for admin approval.');
        setDepositAmount('');
        setDepositTransactionId('');
        setDepositReceiptUrl('');
        refreshMe();
        setActiveTab('history');
      }
    } catch (err: any) {
      alert(err.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    try {
      const res = await api.post('/wallet/withdraw', { amount: withdrawAmount, method: withdrawMethod, account: withdrawAccount });
      if (res.success) {
        alert('Withdrawal request submitted! Pending admin approval.');
        setWithdrawAmount('');
        setWithdrawAccount('');
        refreshMe();
        setActiveTab('history');
      }
    } catch (err: any) {
      alert(err.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemLoading(true);
    try {
      const res = await api.post('/payment-codes/redeem', { code: redeemCode });
      if (res.success) {
        alert(res.message || 'Code redeemed successfully!');
        setRedeemCode('');
        refreshMe();
        setActiveTab('history');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to redeem code');
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className={styles.page}>
        
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className="container">
            <div className={styles.headerFlex}>
              <div>
                <p className={styles.breadcrumb}>
                  <Link href="/">Home</Link> / <Link href="/dashboard">Dashboard</Link> / Wallet
                </p>
                <h1 className={styles.pageTitle}>
                  YOUR <span className="glow-orange">WALLET</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.layout}>
            
            {/* Left Column: Balance & Navigation */}
            <aside className={styles.sidebar}>
              {/* Balance Card */}
              <div className={styles.balanceCard}>
                <div className={styles.balanceCardBar} />
                <div className={styles.balanceCardInner}>
                  <span className={styles.balanceLabel}>Current Balance</span>
                  <div className={styles.balanceAmount}>
                    <span className={styles.currency}>Rs</span>
                    {wallet?.availableBalance.toLocaleString() || 0}
                  </div>
                  <div className={styles.balanceActions}>
                    <button 
                      className={`btn-primary ${styles.actionBtn}`} 
                      onClick={() => setActiveTab('deposit')}
                    >
                      ➕ Add Funds
                    </button>
                    <button 
                      className={`btn-secondary ${styles.actionBtn}`} 
                      onClick={() => setActiveTab('withdraw')}
                    >
                      💸 Withdraw
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Menu */}
              <div className={styles.sideMenu}>
                <button 
                  className={`${styles.menuBtn} ${activeTab === 'history' ? styles.menuBtnActive : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  📜 Transaction History
                </button>
                <button 
                  className={`${styles.menuBtn} ${activeTab === 'deposit' ? styles.menuBtnActive : ''}`}
                  onClick={() => setActiveTab('deposit')}
                >
                  ➕ Deposit Funds
                </button>
                <button 
                  className={`${styles.menuBtn} ${activeTab === 'withdraw' ? styles.menuBtnActive : ''}`}
                  onClick={() => setActiveTab('withdraw')}
                >
                  💸 Withdraw Funds
                </button>
                <button 
                  className={`${styles.menuBtn} ${activeTab === 'redeem' ? styles.menuBtnActive : ''}`}
                  onClick={() => setActiveTab('redeem')}
                >
                  🎟️ Redeem Code
                </button>
              </div>
            </aside>

            {/* Right Column: Content Area */}
            <div className={styles.mainContent}>
              
              {/* ── HISTORY TAB ── */}
              {activeTab === 'history' && (
                <div className={styles.contentCard}>
                  <div className={styles.contentCardBar} />
                  <div className={styles.contentCardInner}>
                    <h2 className={styles.sectionTitle}>Transaction History</h2>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th className={styles.textRight}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadingHistory ? (
                            <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
                          ) : transactions.length === 0 ? (
                            <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>No transactions found.</td></tr>
                          ) : transactions.map(tx => (
                            <tr key={tx._id}>
                              <td className={styles.tdDate}>
                                {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className={styles.tdDesc}>
                                <div className={styles.txType}>
                                  {tx.type.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className={styles.txRef}>{tx.description}</div>
                              </td>
                              <td>
                                <span className={`badge ${
                                  tx.amount < 0 && tx.type === 'withdrawal' && !tx.description.includes('Resolved') ? 'badge-yellow' : 'badge-green'
                                }`}>
                                  Completed
                                </span>
                              </td>
                              <td className={`${styles.textRight} ${styles.tdAmount} ${tx.amount > 0 ? styles.textSuccess : styles.textDanger}`}>
                                {tx.amount > 0 ? '+' : ''}Rs {Math.abs(tx.amount).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── DEPOSIT TAB ── */}
              {activeTab === 'deposit' && (
                <div className={styles.contentCard}>
                  <div className={styles.contentCardBar} />
                  <div className={styles.contentCardInner}>
                    <h2 className={styles.sectionTitle}>Deposit Funds</h2>
                    <p className={styles.sectionSub}>Add funds to your wallet to enter tournaments.</p>

                    <form className={styles.form} onSubmit={handleDeposit}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Amount (Rs)</label>
                        <input 
                          type="number" 
                          className={styles.input} 
                          placeholder="e.g. 500" 
                          min="100"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          required 
                        />
                        <p className={styles.hint}>Minimum deposit amount is Rs 100.</p>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Payment Method</label>
                        <div className={styles.paymentMethods}>
                          {['esewa', 'khalti', 'imepay'].map(method => (
                            <label key={method} className={`${styles.paymentCard} ${depositMethod === method ? styles.paymentCardActive : ''}`}>
                              <input 
                                type="radio" 
                                name="depositMethod" 
                                value={method} 
                                checked={depositMethod === method}
                                onChange={(e) => setDepositMethod(e.target.value)}
                                className={styles.hiddenRadio}
                              />
                              <span className={styles.methodName}>{method.toUpperCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(255,100,0,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(255,100,0,0.2)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Payment Details</h4>
                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          Please send exactly <strong>Rs {depositAmount || '0'}</strong> to the following {depositMethod.toUpperCase()} number:
                        </p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', color: '#fff' }}>98XXXXXXXX</p>
                        <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem' }}>* Or scan the QR code within your app.</p>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Transaction ID / Remarks</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          placeholder="Enter your payment Transaction ID" 
                          value={depositTransactionId}
                          onChange={(e) => setDepositTransactionId(e.target.value)}
                          required 
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Upload Receipt Screenshot</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleReceiptUpload} 
                          disabled={isUploadingReceipt} 
                          style={{ color: '#fff', fontSize: '0.9rem' }} 
                        />
                        {isUploadingReceipt && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#00c8ff' }}>Uploading...</span>}
                        {depositReceiptUrl && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <a href={depositReceiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff88', fontSize: '0.8rem', textDecoration: 'underline' }}>View Uploaded Screenshot</a>
                          </div>
                        )}
                      </div>

                      <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={depositLoading || isUploadingReceipt}>
                        {depositLoading ? <><span className={styles.spinner}/> Submitting...</> : 'Submit Deposit Request →'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── WITHDRAW TAB ── */}
              {activeTab === 'withdraw' && (
                <div className={styles.contentCard}>
                  <div className={styles.contentCardBar} />
                  <div className={styles.contentCardInner}>
                    <h2 className={styles.sectionTitle}>Withdraw Funds</h2>
                    <p className={styles.sectionSub}>Request a payout of your tournament winnings.</p>
                    
                    <div className={styles.alertBox}>
                      <strong>Available to withdraw:</strong> Rs {wallet?.availableBalance.toLocaleString() || 0}
                    </div>

                    <form className={styles.form} onSubmit={handleWithdraw}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Withdraw Amount (Rs)</label>
                        <input 
                          type="number" 
                          className={styles.input} 
                          placeholder="e.g. 1000" 
                          min="500"
                          max={wallet?.availableBalance || 0}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          required 
                        />
                        <p className={styles.hint}>Minimum withdrawal is Rs 500.</p>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Transfer To</label>
                        <div className={styles.paymentMethods}>
                          {['esewa', 'khalti', 'bank'].map(method => (
                            <label key={method} className={`${styles.paymentCard} ${withdrawMethod === method ? styles.paymentCardActive : ''}`}>
                              <input 
                                type="radio" 
                                name="withdrawMethod" 
                                value={method} 
                                checked={withdrawMethod === method}
                                onChange={(e) => setWithdrawMethod(e.target.value)}
                                className={styles.hiddenRadio}
                              />
                              <span className={styles.methodName}>{method === 'bank' ? 'Bank Transfer' : method.toUpperCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Account ID / Number</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          placeholder={withdrawMethod === 'bank' ? "Account Number" : "Mobile Number / ID"}
                          value={withdrawAccount}
                          onChange={(e) => setWithdrawAccount(e.target.value)}
                          required 
                        />
                      </div>

                      <button type="submit" className="btn-primary" disabled={withdrawLoading}>
                        {withdrawLoading ? 'Processing...' : 'Submit Withdrawal'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── REDEEM TAB ── */}
              {activeTab === 'redeem' && (
                <div className={styles.contentCard}>
                  <div className={styles.contentCardBar} />
                  <div className={styles.contentCardInner}>
                    <h2 className={styles.sectionTitle}>Redeem Payment Code</h2>
                    <p className={styles.sectionSub}>Enter a 16-character NGL code to instantly add funds to your wallet.</p>

                    <form className={styles.form} onSubmit={handleRedeem}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Payment Code</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          placeholder="NGL-XXXX..." 
                          value={redeemCode}
                          onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                          required 
                        />
                      </div>
                      <button type="submit" className="btn-primary" disabled={redeemLoading}>
                        {redeemLoading ? 'Verifying...' : 'Redeem Code'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
