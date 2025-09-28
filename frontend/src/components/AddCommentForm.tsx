import React, { useState } from 'react';
// Import the new function
import { addComment } from '../services/api'; 

interface AddCommentFormProps {
  announcementId: string;
  onCommentAdded: () => void;
}

export const AddCommentForm: React.FC<AddCommentFormProps> = ({ announcementId, onCommentAdded }) => {
  const [authorName, setAuthorName] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !text.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      // Use the real API call now
      await addComment(announcementId, { authorName, text });
      
      // Clear the form on success
      setAuthorName('');
      setText('');
      
      // Notify the parent component to refetch the data
      onCommentAdded();
    } catch (err) {
      setError('Failed to submit comment. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <h4>Add a Comment</h4>
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Your Name"
        disabled={isLoading}
        required
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
        disabled={isLoading}
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Comment'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
};