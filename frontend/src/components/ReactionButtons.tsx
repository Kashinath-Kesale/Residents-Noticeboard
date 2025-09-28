import React, { useState } from 'react';
import { addReaction, removeReaction, type ReactionType } from '../services/api';

interface ReactionButtonsProps {
  announcementId: string;
  initialReactions: Record<ReactionType, number>;
}

// Simple button component for reuse
const ReactionButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  isSelected: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, isSelected, children }) => (
  <button onClick={onClick} disabled={disabled} className={`reaction-button ${isSelected ? 'selected' : ''}`}>
    {children}
  </button>
);

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({ announcementId, initialReactions }) => {
  const [counts, setCounts] = useState(initialReactions);
  const [selected, setSelected] = useState<ReactionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // When the component loads, you might want to fetch the user's own reaction state
  // For this exercise, we'll assume they haven't reacted yet.
  
  const handleReactionClick = async (type: ReactionType) => {
    // Store previous state for rollback on error
    const previousSelected = selected;
    const previousCounts = { ...counts };

    setIsLoading(true);

    // --- Optimistic Update ---
    // Update the UI immediately
    if (selected === type) {
      // User is deselecting their reaction
      setSelected(null);
      setCounts(prev => ({ ...prev, [type]: prev[type] - 1 }));
    } else {
      // User is selecting a new or different reaction
      setSelected(type);
      const newCounts = { ...previousCounts, [type]: previousCounts[type] + 1 };
      if (previousSelected) {
        newCounts[previousSelected]--; // Decrement the previously selected reaction
      }
      setCounts(newCounts);
    }
    
    try {
      // --- API Call ---
      if (selected === type) {
        await removeReaction(announcementId);
      } else {
        await addReaction(announcementId, type);
      }
    } catch (error) {
      console.error('Failed to update reaction', error);
      // --- Rollback on Error ---
      setSelected(previousSelected);
      setCounts(previousCounts);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reaction-buttons-container">
      <ReactionButton
        onClick={() => handleReactionClick('up')}
        disabled={isLoading}
        isSelected={selected === 'up'}
      >
        👍 {counts.up}
      </ReactionButton>
      <ReactionButton
        onClick={() => handleReactionClick('down')}
        disabled={isLoading}
        isSelected={selected === 'down'}
      >
        👎 {counts.down}
      </ReactionButton>
      <ReactionButton
        onClick={() => handleReactionClick('heart')}
        disabled={isLoading}
        isSelected={selected === 'heart'}
      >
        ❤️ {counts.heart}
      </ReactionButton>
    </div>
  );
};