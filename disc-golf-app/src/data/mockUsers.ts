import { User } from './types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.player@example.com',
    name: 'John Player',
    role: 'player',
  },
  {
    id: '2',
    email: 'sarah.organizer@example.com',
    name: 'Sarah Organizer',
    role: 'organizer',
  },
  {
    id: '3',
    email: 'mike.head@example.com',
    name: 'Mike Head',
    role: 'head_organizer',
  },
  {
    id: '4',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '5',
    email: 'emma.disc@example.com',
    name: 'Emma Disc',
    role: 'player',
  },
  {
    id: '6',
    email: 'alex.throw@example.com',
    name: 'Alex Throw',
    role: 'player',
  },
  {
    id: '7',
    email: 'lisa.putt@example.com',
    name: 'Lisa Putt',
    role: 'player',
  },
  {
    id: '8',
    email: 'david.chain@example.com',
    name: 'David Chain',
    role: 'organizer',
  },
  {
    id: '9',
    email: 'rachel.ace@example.com',
    name: 'Rachel Ace',
    role: 'player',
  },
  {
    id: '10',
    email: 'tom.birdie@example.com',
    name: 'Tom Birdie',
    role: 'player',
  },
];

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUsersByIds = (ids: string[]): User[] => {
  return mockUsers.filter(user => ids.includes(user.id));
};

export const getUsersByRole = (role: string): User[] => {
  return mockUsers.filter(user => user.role === role);
};

