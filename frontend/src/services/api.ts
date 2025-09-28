import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export type ReactionType = 'up' | 'down' | 'heart';

export const getComments = (announcementId: string, params?: { cursor?: string; limit?: number }) => {
  return apiClient.get(`/announcements/${announcementId}/comments`, { params });
};

export const addComment = (announcementId: string, data: { authorName: string; text: string }) => {
  return apiClient.post(`/announcements/${announcementId}/comments`, data);
};

// --- Reaction Functions ---

const MOCK_USER_ID = 'user-123'; // Hardcoded for interview purposes

export const addReaction = (announcementId: string, type: ReactionType) => {
  return apiClient.post(`/announcements/${announcementId}/reactions`, { type }, {
    headers: {
      'x-user-id': MOCK_USER_ID,
    },
  });
};

export const removeReaction = (announcementId: string) => {
  return apiClient.delete(`/announcements/${announcementId}/reactions`, {
    headers: {
      'x-user-id': MOCK_USER_ID,
    },
  });
};

export default apiClient;