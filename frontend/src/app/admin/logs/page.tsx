'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/system-logs?page=${p}&limit=20`);
      if (res.success) {
        setLogs(res.logs);
        setTotalPages(res.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <div className={styles.adminPage}>
      <h1 className={styles.title}>System Audit Logs</h1>
      
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Admin UID</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{textAlign:'center'}}>Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} style={{textAlign:'center', color: 'var(--text-secondary)'}}>No logs found.</td></tr>
              ) : logs.map(log => (
                <tr key={log._id}>
                  <td style={{whiteSpace: 'nowrap'}}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.adminUid}</td>
                  <td>
                    <span className="badge badge-orange">{log.action}</span>
                  </td>
                  <td>
                    <pre className={styles.logDetails}>{JSON.stringify(log.details, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.pagination}>
        <button 
          className="btn-secondary" 
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          &larr; Previous
        </button>
        <span>Page {page} of {totalPages || 1}</span>
        <button 
          className="btn-secondary" 
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(p => p + 1)}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
