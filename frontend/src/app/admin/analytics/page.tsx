'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../page.module.css';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics', true);
        if (res.success) setData(res.analytics);
      } catch (err) {}
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 className={styles.title}>Analytics & Finance</h1>
      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.card}>
            <h2>Users Joined (Last 30 Days)</h2>
            <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.usersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.card}>
            <h2>Platform Revenue (Last 30 Days)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Note: Positive revenue means entry fees exceeded prizes given out on that day.</p>
            <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
