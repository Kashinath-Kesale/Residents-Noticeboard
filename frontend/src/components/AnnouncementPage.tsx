import React, { useEffect, useState, useRef } from 'react';
import './AnnouncementPage.css';
import { AddCommentForm } from './AddCommentForm';
import { CommentList } from './CommentList';
import { ReactionButtons } from './ReactionButtons';
import type { ReactionType } from '../services/api';

// Final interface with all engagement data
interface Announcement {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'closed';
  createdAt: string;
  commentCount: number;
  reactions: Record<ReactionType, number>;
  lastActivityAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/announcements';

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const etagRef = useRef<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setError(null);
      const headers: HeadersInit = {};
      if (etagRef.current) {
        headers['If-None-Match'] = etagRef.current;
      }
      
      const res = await fetch(API_URL, { headers });

      if (res.status === 304) {
        return; // Data is already up-to-date
      }

      if (!res.ok) throw new Error('Failed to fetch announcements.');
      
      etagRef.current = res.headers.get('ETag');
      const data = await res.json();
      setAnnouncements(data);

    } catch (err: any) {
      setError(err.message);
    }
  };

  // This useEffect handles the initial fetch and forced refreshes after user actions
  useEffect(() => {
    fetchAnnouncements();
  }, [refreshKey]);

  // --- NEW: useEffect for 5-second polling ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Polling for new data...');
      fetchAnnouncements();
    }, 5000); // Polls every 5 seconds

    // Cleanup function to stop the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []); // Empty array ensures this effect runs only once

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
      
      etagRef.current = null; // Invalidate cache
      setRefreshKey(prevKey => prevKey + 1); // Trigger an immediate refetch
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCreate(false);
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
            
            <div className="engagement-stats">
              <span>💬 {a.commentCount}</span>
              <span>👍 {a.reactions.up}</span>
              <span>👎 {a.reactions.down}</span>
              <span>❤️ {a.reactions.heart}</span>
            </div>

            <div className="card-footer">
              <span>Last active: {new Date(a.lastActivityAt).toLocaleDateString()}</span>
              <ReactionButtons 
                announcementId={a.id} 
                initialReactions={a.reactions} 
              />
            </div>

            <div className="comments-section">
              <AddCommentForm 
                announcementId={a.id} 
                onCommentAdded={() => {
                  etagRef.current = null; // Invalidate cache
                  setRefreshKey(prevKey => prevKey + 1); // Trigger immediate refetch
                }}
              />
              <CommentList 
                announcementId={a.id}
                refreshKey={refreshKey}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}