import { createContext, useContext, useState, ReactNode } from 'react';
import {
  Event,
  Group,
  Scorecard,
  Notification,
  JoinRequest,
  RenameRequest,
  mockEvents,
  mockGroups,
  mockScorecards,
  mockNotifications,
  mockJoinRequests,
  mockRenameRequests,
} from '../data';

interface DataContextType {
  events: Event[];
  groups: Group[];
  scorecards: Scorecard[];
  notifications: Notification[];
  joinRequests: JoinRequest[];
  renameRequests: RenameRequest[];
  updateEvent: (id: string, updates: Partial<Event>) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  updateScorecard: (id: string, updates: Partial<Scorecard>) => void;
  markNotificationAsRead: (id: string) => void;
  updateJoinRequest: (id: string, status: 'accepted' | 'rejected') => void;
  updateRenameRequest: (id: string, status: 'approved' | 'rejected') => void;
  addEvent: (event: Event) => void;
  addGroup: (group: Group) => void;
  addScorecard: (scorecard: Scorecard) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [scorecards, setScorecards] = useState<Scorecard[]>(mockScorecards);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(mockJoinRequests);
  const [renameRequests, setRenameRequests] = useState<RenameRequest[]>(mockRenameRequests);

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prev =>
      prev.map(event => (event.id === id ? { ...event, ...updates } : event))
    );
  };

  const updateGroup = (id: string, updates: Partial<Group>) => {
    setGroups(prev =>
      prev.map(group => (group.id === id ? { ...group, ...updates } : group))
    );
  };

  const updateScorecard = (id: string, updates: Partial<Scorecard>) => {
    setScorecards(prev =>
      prev.map(scorecard => (scorecard.id === id ? { ...scorecard, ...updates } : scorecard))
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const updateJoinRequest = (id: string, status: 'accepted' | 'rejected') => {
    setJoinRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status } : req))
    );
  };

  const updateRenameRequest = (id: string, status: 'approved' | 'rejected') => {
    setRenameRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status } : req))
    );
  };

  const addEvent = (event: Event) => {
    setEvents(prev => [...prev, event]);
  };

  const addGroup = (group: Group) => {
    setGroups(prev => [...prev, group]);
  };

  const addScorecard = (scorecard: Scorecard) => {
    setScorecards(prev => [...prev, scorecard]);
  };

  const value: DataContextType = {
    events,
    groups,
    scorecards,
    notifications,
    joinRequests,
    renameRequests,
    updateEvent,
    updateGroup,
    updateScorecard,
    markNotificationAsRead,
    updateJoinRequest,
    updateRenameRequest,
    addEvent,
    addGroup,
    addScorecard,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

