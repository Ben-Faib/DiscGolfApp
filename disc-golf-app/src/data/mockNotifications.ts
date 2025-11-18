import { Notification, RenameRequest } from './types';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'join_request',
    title: 'New Join Request',
    message: 'Lisa Putt wants to join your group "Ace Hunters"',
    read: false,
    createdAt: '2025-01-14T10:00:00Z',
    actionUrl: '/groups/1',
    actionData: { groupId: '1', requestId: '1' },
  },
  {
    id: '2',
    userId: '1',
    type: 'event_update',
    title: 'Event Updated',
    message: 'Spring Championship 2025 time has been changed to 09:00',
    read: false,
    createdAt: '2025-01-13T14:00:00Z',
    actionUrl: '/events/1',
  },
  {
    id: '3',
    userId: '1',
    type: 'scorecard_review',
    title: 'Scorecard Approved',
    message: 'Your scorecard for Thursday Night League - Week 1 has been approved',
    read: true,
    createdAt: '2025-02-15T21:00:00Z',
    actionUrl: '/scorecards/1',
  },
  {
    id: '4',
    userId: '7',
    type: 'invite',
    title: 'Group Invitation',
    message: 'John Player invited you to join "Weekend Warriors"',
    read: false,
    createdAt: '2025-01-12T13:30:00Z',
    actionUrl: '/groups/6',
    actionData: { groupId: '6', inviteId: 'inv1' },
  },
  {
    id: '5',
    userId: '2',
    type: 'scorecard_review',
    title: 'Scorecard Pending Review',
    message: 'David Chain submitted a scorecard for Thursday Night League - Week 1',
    read: false,
    createdAt: '2025-02-15T20:40:00Z',
    actionUrl: '/organizer/scorecards/4',
  },
  {
    id: '6',
    userId: '3',
    type: 'group_update',
    title: 'Group Rename Request',
    message: 'Sarah Organizer requested to rename group "Ace Hunters" to "Disc Destroyers"',
    read: false,
    createdAt: '2025-01-15T09:00:00Z',
    actionUrl: '/head-organizer/rename-requests/1',
  },
  {
    id: '7',
    userId: '4',
    type: 'event_update',
    title: 'New Event Request',
    message: 'John Player requested to create a new event "Memorial Day Tournament"',
    read: false,
    createdAt: '2025-01-14T16:00:00Z',
    actionUrl: '/admin/events/6',
  },
  {
    id: '8',
    userId: '10',
    type: 'scorecard_review',
    title: 'Scorecard Rejected',
    message: 'Your scorecard for Thursday Night League - Week 1 was rejected',
    read: false,
    createdAt: '2025-02-15T21:15:00Z',
    actionUrl: '/scorecards/7',
  },
  {
    id: '9',
    userId: '5',
    type: 'event_update',
    title: 'Event Registration Open',
    message: 'Registration is now open for Fall Classic',
    read: true,
    createdAt: '2025-01-10T10:00:00Z',
    actionUrl: '/events/4',
  },
];

export const mockRenameRequests: RenameRequest[] = [
  {
    id: '1',
    groupId: '1',
    requestedBy: '2',
    newName: 'Disc Destroyers',
    status: 'pending',
    createdAt: '2025-01-15T09:00:00Z',
  },
  {
    id: '2',
    groupId: '2',
    requestedBy: '8',
    newName: 'Link Legends',
    status: 'approved',
    createdAt: '2025-01-10T11:00:00Z',
  },
];

export const getNotificationsByUserId = (userId: string): Notification[] => {
  return mockNotifications.filter(notif => notif.userId === userId);
};

export const getUnreadNotifications = (userId: string): Notification[] => {
  return mockNotifications.filter(notif => notif.userId === userId && !notif.read);
};

export const getPendingRenameRequests = (): RenameRequest[] => {
  return mockRenameRequests.filter(req => req.status === 'pending');
};

export const getRenameRequestById = (id: string): RenameRequest | undefined => {
  return mockRenameRequests.find(req => req.id === id);
};

