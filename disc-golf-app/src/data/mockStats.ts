import { PlayerStats, GroupStats } from './types';

export const mockPlayerStats: PlayerStats[] = [
  {
    userId: '1',
    averageScore: 68,
    bestScore: 62,
    worstScore: 75,
    totalEvents: 12,
    totalRounds: 15,
    holesPlayed: 270,
    averagePerHole: 3.78,
  },
  {
    userId: '1',
    eventId: '7',
    averageScore: 68,
    bestScore: 68,
    worstScore: 68,
    totalEvents: 1,
    totalRounds: 1,
    holesPlayed: 18,
    averagePerHole: 3.78,
  },
  {
    userId: '5',
    averageScore: 66,
    bestScore: 60,
    worstScore: 72,
    totalEvents: 15,
    totalRounds: 18,
    holesPlayed: 324,
    averagePerHole: 3.67,
  },
  {
    userId: '6',
    averageScore: 70,
    bestScore: 65,
    worstScore: 78,
    totalEvents: 10,
    totalRounds: 12,
    holesPlayed: 216,
    averagePerHole: 3.89,
  },
  {
    userId: '7',
    averageScore: 75,
    bestScore: 70,
    worstScore: 82,
    totalEvents: 8,
    totalRounds: 10,
    holesPlayed: 180,
    averagePerHole: 4.17,
  },
  {
    userId: '9',
    averageScore: 64,
    bestScore: 58,
    worstScore: 70,
    totalEvents: 20,
    totalRounds: 25,
    holesPlayed: 450,
    averagePerHole: 3.56,
  },
  {
    userId: '10',
    averageScore: 80,
    bestScore: 75,
    worstScore: 88,
    totalEvents: 5,
    totalRounds: 6,
    holesPlayed: 108,
    averagePerHole: 4.44,
  },
];

export const mockGroupStats: GroupStats[] = [
  {
    groupId: '1',
    averageScore: 68.67,
    totalRounds: 12,
    bestRound: 62,
    members: ['1', '5', '6'],
  },
  {
    groupId: '1',
    eventId: '7',
    averageScore: 68,
    totalRounds: 1,
    bestRound: 68,
    members: ['1', '5', '6'],
  },
  {
    groupId: '2',
    averageScore: 74.67,
    totalRounds: 8,
    bestRound: 64,
    members: ['7', '9', '10'],
  },
  {
    groupId: '3',
    averageScore: 67,
    totalRounds: 3,
    bestRound: 65,
    members: ['5', '1'],
  },
  {
    groupId: '6',
    averageScore: 70,
    totalRounds: 2,
    bestRound: 68,
    members: ['1', '5', '6', '7'],
  },
];

export const getPlayerStats = (userId: string, eventId?: string): PlayerStats | undefined => {
  if (eventId) {
    return mockPlayerStats.find(stat => stat.userId === userId && stat.eventId === eventId);
  }
  return mockPlayerStats.find(stat => stat.userId === userId && !stat.eventId);
};

export const getGroupStats = (groupId: string, eventId?: string): GroupStats | undefined => {
  if (eventId) {
    return mockGroupStats.find(stat => stat.groupId === groupId && stat.eventId === eventId);
  }
  return mockGroupStats.find(stat => stat.groupId === groupId && !stat.eventId);
};

export const getAllPlayerStats = (userId: string): PlayerStats[] => {
  return mockPlayerStats.filter(stat => stat.userId === userId);
};

