'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from '../page.module.css';

export default function AdminSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/config', true).then(res => {
      if (res.success) setConfig(res.config);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.post('/admin/config', config);
      if (res.success) alert('Settings saved successfully');
    } catch (e: any) {
      alert(e.message || 'Error saving settings');
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 className={styles.title}>System Settings</h1>
      <div className={styles.card} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={config?.realMoneyFeaturesEnabled} onChange={e => setConfig({...config, realMoneyFeaturesEnabled: e.target.checked})} />
            Enable Real Money Features
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={config?.maintenanceMode} onChange={e => setConfig({...config, maintenanceMode: e.target.checked})} />
            Maintenance Mode
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={config?.tournamentJoiningEnabled} onChange={e => setConfig({...config, tournamentJoiningEnabled: e.target.checked})} />
            Enable Tournament Joining
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Min Withdrawal (Rs)</label>
          <input type="number" value={config?.minWithdrawal || ''} onChange={e => setConfig({...config, minWithdrawal: Number(e.target.value)})} style={{ padding: '8px', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)', color: 'white', borderRadius: '4px' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Max Withdrawal (Rs)</label>
          <input type="number" value={config?.maxWithdrawal || ''} onChange={e => setConfig({...config, maxWithdrawal: Number(e.target.value)})} style={{ padding: '8px', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)', color: 'white', borderRadius: '4px' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Referral Bonus (Rs)</label>
          <input type="number" value={config?.referralBonus || ''} onChange={e => setConfig({...config, referralBonus: Number(e.target.value)})} style={{ padding: '8px', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)', color: 'white', borderRadius: '4px' }} />
        </div>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Support Links</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>WhatsApp</label>
          <input type="text" value={config?.supportLinks?.whatsapp || ''} onChange={e => setConfig({...config, supportLinks: {...config.supportLinks, whatsapp: e.target.value}})} style={{ padding: '8px', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)', color: 'white', borderRadius: '4px' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Discord</label>
          <input type="text" value={config?.supportLinks?.discord || ''} onChange={e => setConfig({...config, supportLinks: {...config.supportLinks, discord: e.target.value}})} style={{ padding: '8px', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)', color: 'white', borderRadius: '4px' }} />
        </div>

        <button onClick={handleSave} className="btn-primary" style={{ marginTop: '1rem' }}>Save Settings</button>
      </div>
    </div>
  );
}
