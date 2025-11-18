// User Roles
export type UserRole = 'player' | 'organizer' | 'head_organizer' | 'admin';

// User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

// Event Interface
export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  time: string;
  numberOfHoles: number;
  imageUrl?: string;
  organizers: string[]; // User IDs
  headOrganizers: string[]; // User IDs
  participants: string[]; // User IDs
  status: 'upcoming' | 'ongoing' | 'completed';
  createdBy: string; // User ID
  requestStatus?: 'pending' | 'approved' | 'rejected';
}

// Group Interface
export interface Group {
  id: string;
  name: string;
  ownerId: string; // User ID
  members: string[]; // User IDs
  eventId?: string; // Optional, groups exist outside events
  createdAt: string;
}

// Join Request Interface
export interface JoinRequest {
  id: string;
  groupId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// Scorecard Interface
export interface Scorecard {
  id: string;
  userId: string;
  eventId: string;
  groupId: string;
  scores: number[]; // Scores for each hole
  totalScore: number;
  submittedAt?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewedBy?: string; // Organizer ID
  notes?: string;
}

// Stats Interface
export interface PlayerStats {
  userId: string;
  eventId?: string; // If undefined, it's aggregated stats
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalEvents: number;
  totalRounds: number;
  holesPlayed: number;
  averagePerHole: number;
}

// Group Stats Interface
export interface GroupStats {
  groupId: string;
  eventId?: string;
  averageScore: number;
  totalRounds: number;
  bestRound: number;
  members: string[]; // User IDs
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: 'invite' | 'join_request' | 'scorecard_review' | 'event_update' | 'group_update';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionData?: any;
}

// Rename Request Interface
export interface RenameRequest {
  id: string;
  groupId: string;
  requestedBy: string; // Organizer ID
  newName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

