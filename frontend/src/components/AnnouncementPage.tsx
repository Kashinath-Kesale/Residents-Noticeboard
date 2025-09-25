import React, { useEffect, useState } from 'react';
import './AnnouncementPage.css'; // Import the new stylesheet

interface Announcement {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'closed';
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/announcements';

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCloseId, setLoadingCloseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch announcements.');
      const data = await res.json();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoadingCreate(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error('Failed to create announcement.');
      setTitle('');
      setDescription('');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleClose = async (id: string) => {
    setLoadingCloseId(id);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      if (!res.ok) throw new Error('Failed to close announcement.');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCloseId(null);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Residents Noticeboard</h1>
      </header>

      <form onSubmit={handleSubmit} className="noticeboard-form">
        <input
          type="text"
          placeholder="Title (required)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loadingCreate}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loadingCreate}
          rows={3}
        />
        <button type="submit" disabled={loadingCreate || !title.trim()}>
          {loadingCreate ? 'Saving...' : 'Create Announcement'}
        </button>
      </form>

      {error && <div className="error-message">Error: {error}</div>}

      <ul className="announcement-list">
        {announcements.map((a) => (
          <li key={a.id} className="announcement-card" data-status={a.status}>
            <div className="card-header">
              <h3>{a.title}</h3>
              <span className="status-badge">{a.status}</span>
            </div>
            {a.description && <p>{a.description}</p>}
            <div className="card-footer">
              <span>Posted: {new Date(a.createdAt).toLocaleDateString()}</span>
              {a.status === 'active' && (
                <button
                  className="close-button"
                  onClick={() => handleClose(a.id)}
                  disabled={loadingCloseId === a.id}
                >
                  {loadingCloseId === a.id ? '...' : 'Close'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}