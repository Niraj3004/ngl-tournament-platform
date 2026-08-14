'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

// Mock Data
const MOCK_BALANCE = 2450;
const MOCK_TRANSACTIONS = [
  { id: 'tx_01', type: 'deposit', amount: 1000, date: '2026-08-14T10:00:00Z', status: 'completed', ref: 'eSewa' },
  { id: 'tx_02', type: 'tournament_entry', amount: -50, date: '2026-08-13T14:30:00Z', status: 'completed', ref: 'Solo Ranked Championship' },
  { id: 'tx_03', type: 'prize', amount: 1500, date: '2026-08-12T20:15:00Z', status: 'completed', ref: 'Weekend Squad Royale' },
  { id: 'tx_04', type: 'withdrawal', amount: -500, date: '2026-08-10T09:00:00Z', status: 'pending', ref: 'Khalti Wallet' },
  { id: 'tx_05', type: 'deposit', amount: 500, date: '2026-08-05T11:20:00Z', status: 'completed', ref: 'ConnectIPS' },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'deposit' | 'withdraw'>('history');
  
  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('esewa');
  const [depositLoading, setDepositLoading] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('khalti');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositLoading(true);
    setTimeout(() => {
      setDepositLoading(false);
      alert('Redirecting to payment gateway...');
      setDepositAmount('');
    }, 1000);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setTimeout(() => {
      setWithdrawLoading(false);
      alert('Withdrawal request submitted! Pending admin approval.');
      setWithdrawAmount('');
      setWithdrawAccount('');
      setActiveTab('history');
    }, 1500);
  };

  return (
    <>
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
                    {MOCK_BALANCE.toLocaleString()}
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
                          {MOCK_TRANSACTIONS.map(tx => (
                            <tr key={tx.id}>
                              <td className={styles.tdDate}>
                                {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className={styles.tdDesc}>
                                <div className={styles.txType}>
                                  {tx.type.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className={styles.txRef}>{tx.ref}</div>
                              </td>
                              <td>
                                <span className={`badge ${
                                  tx.status === 'completed' ? 'badge-green' : 
                                  tx.status === 'pending' ? 'badge-yellow' : 'badge-orange'
                                }`}>
                                  {tx.status}
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

                      <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={depositLoading}>
                        {depositLoading ? <><span className={styles.spinner}/> Processing...</> : 'Proceed to Payment →'}
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
                      <strong>Available to withdraw:</strong> Rs {MOCK_BALANCE.toLocaleString()}
                    </div>

                    <form className={styles.form} onSubmit={handleWithdraw}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Withdraw Amount (Rs)</label>
                        <input 
                          type="number" 
                          className={styles.input} 
                          placeholder="e.g. 1000" 
                          min="500"
                          max={MOCK_BALANCE}
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

                      <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={withdrawLoading}>
                        {withdrawLoading ? <><span className={styles.spinner}/> Submitting...</> : 'Request Withdrawal →'}
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
    </>
  );
}
