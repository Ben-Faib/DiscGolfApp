import { Scorecard } from './types';

export const mockScorecards: Scorecard[] = [
  {
    id: '1',
    userId: '1',
    eventId: '7',
    groupId: '1',
    scores: [3, 4, 3, 5, 4, 3, 4, 3, 4, 3, 4, 5, 3, 4, 3, 4, 5, 4],
    totalScore: 68,
    submittedAt: '2025-02-15T20:30:00Z',
    status: 'approved',
    reviewedBy: '2',
  },
  {
    id: '2',
    userId: '5',
    eventId: '7',
    groupId: '1',
    scores: [4, 4, 3, 4, 5, 3, 4, 3, 3, 4, 4, 4, 3, 5, 3, 4, 4, 4],
    totalScore: 68,
    submittedAt: '2025-02-15T20:35:00Z',
    status: 'approved',
    reviewedBy: '2',
  },
  {
    id: '3',
    userId: '6',
    eventId: '7',
    groupId: '1',
    scores: [3, 5, 4, 4, 4, 3, 5, 3, 4, 3, 4, 5, 3, 4, 3, 4, 4, 3],
    totalScore: 68,
    submittedAt: '2025-02-15T20:32:00Z',
    status: 'approved',
    reviewedBy: '2',
  },
  {
    id: '4',
    userId: '7',
    eventId: '7',
    groupId: '2',
    scores: [4, 4, 4, 5, 5, 4, 4, 4, 4, 4, 5, 5, 4, 4, 4, 5, 5, 4],
    totalScore: 78,
    submittedAt: '2025-02-15T20:40:00Z',
    status: 'submitted',
  },
  {
    id: '5',
    userId: '9',
    eventId: '7',
    groupId: '2',
    scores: [3, 4, 3, 4, 4, 3, 4, 3, 3, 4, 4, 4, 3, 4, 3, 4, 4, 3],
    totalScore: 64,
    submittedAt: '2025-02-15T20:38:00Z',
    status: 'approved',
    reviewedBy: '2',
  },
  {
    id: '6',
    userId: '1',
    eventId: '1',
    groupId: '3',
    scores: [3, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalScore: 10,
    status: 'draft',
  },
  {
    id: '7',
    userId: '10',
    eventId: '7',
    groupId: '2',
    scores: [4, 5, 4, 5, 5, 4, 5, 4, 4, 5, 5, 5, 4, 5, 4, 5, 5, 4],
    totalScore: 82,
    submittedAt: '2025-02-15T20:42:00Z',
    status: 'rejected',
    reviewedBy: '2',
    notes: 'Scores appear inconsistent with video review. Please resubmit.',
  },
];

export const getScorecardById = (id: string): Scorecard | undefined => {
  return mockScorecards.find(scorecard => scorecard.id === id);
};

export const getScorecardsByUserId = (userId: string): Scorecard[] => {
  return mockScorecards.filter(scorecard => scorecard.userId === userId);
};

export const getScorecardsByEventId = (eventId: string): Scorecard[] => {
  return mockScorecards.filter(scorecard => scorecard.eventId === eventId);
};

export const getPendingScorecards = (): Scorecard[] => {
  return mockScorecards.filter(scorecard => scorecard.status === 'submitted');
};

export const getScorecardsByGroupId = (groupId: string): Scorecard[] => {
  return mockScorecards.filter(scorecard => scorecard.groupId === groupId);
};

