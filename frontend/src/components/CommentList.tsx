import React, { useState, useEffect, useCallback } from 'react';
import { getComments } from '../services/api';

interface Comment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

interface CommentListProps {
  announcementId: string;
  refreshKey: number;
}

const PAGE_LIMIT = 5; // How many comments to load per page

export const CommentList: React.FC<CommentListProps> = ({ announcementId, refreshKey }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchComments = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await getComments(announcementId, { cursor, limit: PAGE_LIMIT });
      const newComments = response.data;

      setComments(prev => isInitialLoad ? newComments : [...prev, ...newComments]);
      
      if (newComments.length < PAGE_LIMIT) {
        setHasMore(false);
      } else {
        setCursor(newComments[newComments.length - 1].id);
      }
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [announcementId, cursor]);

  useEffect(() => {
    // Reset and fetch initially or when a new comment is added (via refreshKey)
    setComments([]);
    setCursor(undefined);
    setHasMore(true);
    fetchComments(true);
  }, [announcementId, refreshKey]);

  if (isLoading) return <p>Loading comments...</p>;

  return (
    <div className="comments-list">
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <strong>{comment.authorName}</strong>
            <p>{comment.text}</p>
            <small>{new Date(comment.createdAt).toLocaleString()}</small>
          </div>
        ))
      )}
      {hasMore && (
        <button onClick={() => fetchComments()} disabled={isLoadingMore} className="load-more-button">
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};