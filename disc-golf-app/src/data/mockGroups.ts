import { Group, JoinRequest } from './types';

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Ace Hunters',
    ownerId: '1',
    members: ['1', '5', '6'],
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Chain Breakers',
    ownerId: '7',
    members: ['7', '9', '10'],
    createdAt: '2024-11-15T14:30:00Z',
  },
  {
    id: '3',
    name: 'Disc Dynasty',
    ownerId: '5',
    members: ['5', '1'],
    eventId: '1',
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: '4',
    name: 'Birdie Squad',
    ownerId: '6',
    members: ['6', '9'],
    eventId: '2',
    createdAt: '2025-01-05T16:00:00Z',
  },
  {
    id: '5',
    name: 'Putting Pros',
    ownerId: '10',
    members: ['10'],
    createdAt: '2024-10-20T11:00:00Z',
  },
  {
    id: '6',
    name: 'Weekend Warriors',
    ownerId: '1',
    members: ['1', '5', '6', '7'],
    eventId: '3',
    createdAt: '2025-01-12T13:00:00Z',
  },
];

export const mockJoinRequests: JoinRequest[] = [
  {
    id: '1',
    groupId: '1',
    userId: '7',
    status: 'pending',
    createdAt: '2025-01-14T10:00:00Z',
  },
  {
    id: '2',
    groupId: '2',
    userId: '6',
    status: 'pending',
    createdAt: '2025-01-13T15:30:00Z',
  },
  {
    id: '3',
    groupId: '5',
    userId: '9',
    status: 'accepted',
    createdAt: '2025-01-10T12:00:00Z',
  },
];

export const getGroupById = (id: string): Group | undefined => {
  return mockGroups.find(group => group.id === id);
};

export const getGroupsByUserId = (userId: string): Group[] => {
  return mockGroups.filter(group => group.members.includes(userId));
};

export const getGroupsByOwnerId = (ownerId: string): Group[] => {
  return mockGroups.filter(group => group.ownerId === ownerId);
};

export const getGroupsByEventId = (eventId: string): Group[] => {
  return mockGroups.filter(group => group.eventId === eventId);
};

export const getJoinRequestsByGroupId = (groupId: string): JoinRequest[] => {
  return mockJoinRequests.filter(req => req.groupId === groupId && req.status === 'pending');
};

export const getJoinRequestsByUserId = (userId: string): JoinRequest[] => {
  return mockJoinRequests.filter(req => req.userId === userId);
};

