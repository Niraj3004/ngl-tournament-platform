'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/support');
        if (res.success) setTickets(res.tickets);
      } catch (e) {}
      setLoading(false);
    };
    if (user) fetchTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/support', { category, subject, description });
      if (res.success) {
        setTickets([res.ticket, ...tickets]);
        setSubject('');
        setDescription('');
        alert('Support ticket created successfully');
      }
    } catch (e: any) {
      alert(e.message || 'Error creating ticket');
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
        <ParticleBackground />
        <div className={`container ${styles.content}`}>
          <h1 className={styles.title}>Help & Support</h1>
          <div className={styles.grid}>
            <div className={styles.formCard}>
              <h2>Create Ticket</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <select className={styles.input} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="general">General Inquiry</option>
                  <option value="payment">Payment Issue</option>
                  <option value="tournament">Tournament Issue</option>
                  <option value="report">Report Player</option>
                </select>
                <input className={styles.input} required placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
                <textarea className={styles.textarea} required placeholder="Describe your issue..." value={description} onChange={e => setDescription(e.target.value)} />
                <button type="submit" className={styles.submitBtn}>Submit Ticket</button>
              </form>
            </div>
            
            <div className={styles.ticketsCard}>
              <h2>Your Tickets</h2>
              {loading ? <p>Loading...</p> : (
                <div className={styles.list}>
                  {tickets.map(t => (
                    <div key={t._id} className={styles.ticket}>
                      <div className={styles.ticketHeader}>
                        <strong>{t.subject}</strong>
                        <span className={styles.badge}>{t.status}</span>
                      </div>
                      <p>{t.description}</p>
                    </div>
                  ))}
                  {tickets.length === 0 && <p>You have no support tickets.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
