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
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
        setAttachmentUrl(data.imageUrl);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err: any) {
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { category, subject, description };
      if (attachmentUrl) payload.attachments = [attachmentUrl];

      const res = await api.post('/support', payload);
      if (res.success) {
        setTickets([res.ticket, ...tickets]);
        setSubject('');
        setDescription('');
        setAttachmentUrl('');
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
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#8888aa' }}>Attach Evidence (Screenshot/Image)</label>
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={isUploading} style={{ color: '#fff' }} />
                  {isUploading && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#00c8ff' }}>Uploading...</span>}
                  {attachmentUrl && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff88', fontSize: '0.8rem', textDecoration: 'underline' }}>View Uploaded Image</a>
                    </div>
                  )}
                </div>
                <button type="submit" className={styles.submitBtn} disabled={isUploading}>Submit Ticket</button>
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
