import { Event } from './types';

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Spring Championship 2025',
    description: 'Annual spring disc golf championship at Riverside Park. 18 holes of challenging play with prizes for top finishers.',
    location: 'Riverside Park, Portland, OR',
    date: '2025-03-15',
    time: '09:00',
    numberOfHoles: 18,
    imageUrl: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800',
    organizers: ['2', '8'],
    headOrganizers: ['3'],
    participants: ['1', '5', '6', '7', '9', '10'],
    status: 'upcoming',
    createdBy: '3',
    requestStatus: 'approved',
  },
  {
    id: '2',
    name: 'Summer League Week 3',
    description: 'Weekly summer league play. Casual format, all skill levels welcome!',
    location: 'Mountain View Disc Golf Course',
    date: '2025-07-10',
    time: '18:00',
    numberOfHoles: 18,
    organizers: ['2'],
    headOrganizers: ['3'],
    participants: ['1', '5', '6', '9'],
    status: 'upcoming',
    createdBy: '2',
    requestStatus: 'approved',
  },
  {
    id: '3',
    name: 'Ace Race Fundraiser',
    description: 'Fundraiser event with ace race format. All proceeds go to local youth disc golf programs.',
    location: 'Lakeside Park',
    date: '2025-08-20',
    time: '10:00',
    numberOfHoles: 9,
    imageUrl: 'https://images.unsplash.com/photo-1598901515879-ee5c9b2f2e5f?w=800',
    organizers: ['8'],
    headOrganizers: ['3'],
    participants: ['1', '5', '6', '7', '9', '10'],
    status: 'upcoming',
    createdBy: '3',
    requestStatus: 'approved',
  },
  {
    id: '4',
    name: 'Fall Classic',
    description: 'Competitive tournament with multiple divisions.',
    location: 'Timber Ridge Course',
    date: '2025-10-05',
    time: '08:00',
    numberOfHoles: 18,
    organizers: ['2'],
    headOrganizers: ['3'],
    participants: [],
    status: 'upcoming',
    createdBy: '3',
    requestStatus: 'approved',
  },
  {
    id: '5',
    name: 'Winter Ice Bowl',
    description: 'Cold weather charity tournament. Bring warm clothes!',
    location: 'Highland Park',
    date: '2026-01-15',
    time: '11:00',
    numberOfHoles: 18,
    organizers: ['8'],
    headOrganizers: ['3'],
    participants: ['1', '5'],
    status: 'upcoming',
    createdBy: '8',
    requestStatus: 'approved',
  },
  {
    id: '6',
    name: 'Memorial Day Tournament',
    description: 'Special holiday event with BBQ and awards ceremony.',
    location: 'Veterans Memorial Park',
    date: '2025-05-26',
    time: '09:00',
    numberOfHoles: 18,
    organizers: [],
    headOrganizers: [],
    participants: [],
    status: 'upcoming',
    createdBy: '1',
    requestStatus: 'pending',
  },
  {
    id: '7',
    name: 'Thursday Night League - Week 1',
    description: 'First week of our weekly league! New players welcome.',
    location: 'City Park',
    date: '2025-02-15',
    time: '17:30',
    numberOfHoles: 18,
    organizers: ['2'],
    headOrganizers: ['3'],
    participants: ['1', '5', '6', '7', '9', '10'],
    status: 'completed',
    createdBy: '2',
    requestStatus: 'approved',
  },
];

export const getEventById = (id: string): Event | undefined => {
  return mockEvents.find(event => event.id === id);
};

export const getUpcomingEvents = (): Event[] => {
  return mockEvents.filter(event => event.status === 'upcoming' && event.requestStatus === 'approved');
};

export const getCompletedEvents = (): Event[] => {
  return mockEvents.filter(event => event.status === 'completed');
};

export const getPendingEventRequests = (): Event[] => {
  return mockEvents.filter(event => event.requestStatus === 'pending');
};

