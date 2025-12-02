import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../utils/api';
import type { EventLimitFilter } from '../utils/api';

// Current player ID - fetched from database on load
export const CURRENT_PLAYER_ID = 13;

// Re-export for convenience
export type { EventLimitFilter } from '../utils/api';

interface DataContextType {
  // Current player (fetched from backend)
  player: api.Player | null;
  
  // Data from API
  events: api.Event[];
  players: api.Player[];
  leaderboard: api.LeaderboardEntry[];
  playerHistory: api.PlayerHistory[];
  playerScorecards: api.PlayerScorecard[];
  
  // Stats data
  hotRounds: api.HotRound[];
  podiumStats: api.PodiumStats[];
  topCards: api.TopCard[];
  holeDifficulty: api.HoleDifficulty[];
  basketStats: api.BasketStats[];
  
  // Event filter for stats
  statsEventFilter: EventLimitFilter;
  setStatsEventFilter: (filter: EventLimitFilter) => void;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Refresh functions
  refreshEvents: () => Promise<void>;
  refreshLeaderboard: (division?: string) => Promise<void>;
  refreshPlayerHistory: () => Promise<void>;
  refreshPlayerScorecards: () => Promise<void>;
  refreshPlayers: () => Promise<void>;
  refreshAllStats: (eventLimit?: EventLimitFilter) => Promise<void>;
  refreshHotRounds: (eventLimit?: EventLimitFilter) => Promise<void>;
  refreshPodiumStats: (eventLimit?: EventLimitFilter) => Promise<void>;
  refreshTopCards: (eventLimit?: EventLimitFilter) => Promise<void>;
  refreshHoleDifficulty: (eventLimit?: EventLimitFilter) => Promise<void>;
  refreshBasketStats: (eventLimit?: EventLimitFilter) => Promise<void>;
  
  // Scorecard functions
  createNewScorecard: (eventId: number) => Promise<number | null>;
  addMembersToScorecard: (scorecardId: number, playerIds: number[]) => Promise<boolean>;
  submitHoleScores: (
    scorecardId: number,
    holeNumber: number,
    scores: { playerId: number; strokes: number }[]
  ) => Promise<boolean>;
  
  // Get scorecard details
  getScorecard: (scorecardId: number) => Promise<api.ScorecardDetail | null>;
  getEventLayout: (eventId: number) => Promise<api.EventLayout[]>;
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
  const [player, setPlayer] = useState<api.Player | null>(null);
  const [events, setEvents] = useState<api.Event[]>([]);
  const [players, setPlayers] = useState<api.Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<api.LeaderboardEntry[]>([]);
  const [playerHistory, setPlayerHistory] = useState<api.PlayerHistory[]>([]);
  const [playerScorecards, setPlayerScorecards] = useState<api.PlayerScorecard[]>([]);
  
  // Stats data
  const [hotRounds, setHotRounds] = useState<api.HotRound[]>([]);
  const [podiumStats, setPodiumStats] = useState<api.PodiumStats[]>([]);
  const [topCards, setTopCards] = useState<api.TopCard[]>([]);
  const [holeDifficulty, setHoleDifficulty] = useState<api.HoleDifficulty[]>([]);
  const [basketStats, setBasketStats] = useState<api.BasketStats[]>([]);
  
  // Event filter for stats - defaults to 'latest' (most recent event)
  const [statsEventFilter, setStatsEventFilter] = useState<EventLimitFilter>('latest');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Default to 'latest' for stats on initial load
      const defaultFilter: EventLimitFilter = 'latest';
      
      const [
        playerData,
        eventsData,
        playersData,
        leaderboardData,
        historyData,
        scorecardsData,
        hotRoundsData,
        podiumStatsData,
        topCardsData,
        holeDifficultyData,
        basketStatsData,
      ] = await Promise.all([
        api.getPlayer(CURRENT_PLAYER_ID),
        api.getEvents(),
        api.getPlayers(),
        api.getLeaderboard(undefined, defaultFilter),
        api.getPlayerHistory(CURRENT_PLAYER_ID),
        api.getPlayerScorecards(CURRENT_PLAYER_ID),
        api.getHotRounds(defaultFilter),
        api.getPodiumStats(defaultFilter),
        api.getTopCards(defaultFilter),
        api.getHoleDifficulty(defaultFilter),
        api.getBasketStats(defaultFilter),
      ]);
      
      setPlayer(playerData);
      setEvents(eventsData);
      setPlayers(playersData);
      setLeaderboard(leaderboardData);
      setPlayerHistory(historyData);
      setPlayerScorecards(scorecardsData);
      setHotRounds(hotRoundsData);
      setPodiumStats(podiumStatsData);
      setTopCards(topCardsData);
      setHoleDifficulty(holeDifficultyData);
      setBasketStats(basketStatsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to refresh events:', err);
    }
  };

  const refreshPlayers = async () => {
    try {
      const data = await api.getPlayers();
      setPlayers(data);
    } catch (err) {
      console.error('Failed to refresh players:', err);
    }
  };

  const refreshLeaderboard = async (division?: string) => {
    try {
      const data = await api.getLeaderboard(division, statsEventFilter);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to refresh leaderboard:', err);
    }
  };

  const refreshPlayerHistory = async () => {
    try {
      const data = await api.getPlayerHistory(CURRENT_PLAYER_ID);
      setPlayerHistory(data);
    } catch (err) {
      console.error('Failed to refresh player history:', err);
    }
  };

  const refreshPlayerScorecards = async () => {
    try {
      const data = await api.getPlayerScorecards(CURRENT_PLAYER_ID);
      setPlayerScorecards(data);
    } catch (err) {
      console.error('Failed to refresh player scorecards:', err);
    }
  };

  const refreshHotRounds = async (eventLimit?: EventLimitFilter) => {
    try {
      const filter = eventLimit ?? statsEventFilter;
      const data = await api.getHotRounds(filter);
      setHotRounds(data);
    } catch (err) {
      console.error('Failed to refresh hot rounds:', err);
    }
  };

  const refreshPodiumStats = async (eventLimit?: EventLimitFilter) => {
    try {
      const filter = eventLimit ?? statsEventFilter;
      const data = await api.getPodiumStats(filter);
      setPodiumStats(data);
    } catch (err) {
      console.error('Failed to refresh podium stats:', err);
    }
  };

  const refreshTopCards = async (eventLimit?: EventLimitFilter) => {
    try {
      const filter = eventLimit ?? statsEventFilter;
      const data = await api.getTopCards(filter);
      setTopCards(data);
    } catch (err) {
      console.error('Failed to refresh top cards:', err);
    }
  };

  const refreshHoleDifficulty = async (eventLimit?: EventLimitFilter) => {
    try {
      const filter = eventLimit ?? statsEventFilter;
      const data = await api.getHoleDifficulty(filter);
      setHoleDifficulty(data);
    } catch (err) {
      console.error('Failed to refresh hole difficulty:', err);
    }
  };

  const refreshBasketStats = async (eventLimit?: EventLimitFilter) => {
    try {
      const filter = eventLimit ?? statsEventFilter;
      const data = await api.getBasketStats(filter);
      setBasketStats(data);
    } catch (err) {
      console.error('Failed to refresh basket stats:', err);
    }
  };

  // Refresh all stats with a specific event filter
  const refreshAllStats = async (eventLimit?: EventLimitFilter) => {
    const filter = eventLimit ?? statsEventFilter;
    try {
      const [
        leaderboardData,
        hotRoundsData,
        podiumStatsData,
        topCardsData,
        holeDifficultyData,
        basketStatsData,
      ] = await Promise.all([
        api.getLeaderboard(undefined, filter),
        api.getHotRounds(filter),
        api.getPodiumStats(filter),
        api.getTopCards(filter),
        api.getHoleDifficulty(filter),
        api.getBasketStats(filter),
      ]);
      
      setLeaderboard(leaderboardData);
      setHotRounds(hotRoundsData);
      setPodiumStats(podiumStatsData);
      setTopCards(topCardsData);
      setHoleDifficulty(holeDifficultyData);
      setBasketStats(basketStatsData);
    } catch (err) {
      console.error('Failed to refresh all stats:', err);
    }
  };

  const createNewScorecard = async (eventId: number): Promise<number | null> => {
    try {
      const result = await api.createScorecard({
        eventId,
        createdByPlayerId: CURRENT_PLAYER_ID,
      });
      // Don't refresh here - members haven't been added yet, so the scorecard
      // won't appear in the player's list until addMembersToScorecard is called
      return result.NewScorecardID;
    } catch (err) {
      console.error('Failed to create scorecard:', err);
      return null;
    }
  };

  const addMembersToScorecard = async (scorecardId: number, playerIds: number[]): Promise<boolean> => {
    try {
      await api.addScorecardMembers(scorecardId, {
        player1Id: playerIds[0],
        player2Id: playerIds[1],
        player3Id: playerIds[2],
        player4Id: playerIds[3],
      });
      return true;
    } catch (err) {
      console.error('Failed to add members:', err);
      return false;
    }
  };

  const submitHoleScores = async (
    scorecardId: number,
    holeNumber: number,
    scores: { playerId: number; strokes: number }[]
  ): Promise<boolean> => {
    try {
      // Build request with only the players that exist (minimum 2, maximum 4)
      const requestData: api.InsertHoleScoresData = {
        holeNumber,
        player1Id: scores[0].playerId,
        player1Score: scores[0].strokes,
        player2Id: scores[1].playerId,
        player2Score: scores[1].strokes,
      };
      
      // Only include player 3 if they exist
      if (scores[2]) {
        requestData.player3Id = scores[2].playerId;
        requestData.player3Score = scores[2].strokes;
      }
      
      // Only include player 4 if they exist
      if (scores[3]) {
        requestData.player4Id = scores[3].playerId;
        requestData.player4Score = scores[3].strokes;
      }
      
      await api.insertHoleScores(scorecardId, requestData);
      
      await refreshPlayerScorecards();
      await refreshLeaderboard();
      return true;
    } catch (err) {
      console.error('Failed to submit scores:', err);
      return false;
    }
  };

  const getScorecard = async (scorecardId: number): Promise<api.ScorecardDetail | null> => {
    try {
      return await api.getScorecard(scorecardId);
    } catch (err) {
      console.error('Failed to get scorecard:', err);
      return null;
    }
  };

  const getEventLayout = async (eventId: number): Promise<api.EventLayout[]> => {
    try {
      return await api.getEventLayout(eventId);
    } catch (err) {
      console.error('Failed to get event layout:', err);
      return [];
    }
  };

  const value: DataContextType = {
    player,
    events,
    players,
    leaderboard,
    playerHistory,
    playerScorecards,
    hotRounds,
    podiumStats,
    topCards,
    holeDifficulty,
    basketStats,
    statsEventFilter,
    setStatsEventFilter,
    loading,
    error,
    refreshEvents,
    refreshPlayers,
    refreshLeaderboard,
    refreshPlayerHistory,
    refreshPlayerScorecards,
    refreshAllStats,
    refreshHotRounds,
    refreshPodiumStats,
    refreshTopCards,
    refreshHoleDifficulty,
    refreshBasketStats,
    createNewScorecard,
    addMembersToScorecard,
    submitHoleScores,
    getScorecard,
    getEventLayout,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
