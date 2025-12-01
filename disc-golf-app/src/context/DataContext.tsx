import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../utils/api';

// Demo player - hardcoded for simplified demo (Player 1 from database)
export const DEMO_PLAYER: api.Player = {
  PlayerID: 1,
  FirstName: 'Mike',
  LastName: 'Anderson',
  Email: 'mike.anderson@email.com',
  SkillDivision: 'Advanced',
};

interface DataContextType {
  // Demo player
  player: api.Player;
  
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
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Refresh functions
  refreshEvents: () => Promise<void>;
  refreshLeaderboard: (division?: string) => Promise<void>;
  refreshPlayerHistory: () => Promise<void>;
  refreshPlayerScorecards: () => Promise<void>;
  refreshPlayers: () => Promise<void>;
  refreshHotRounds: () => Promise<void>;
  refreshPodiumStats: () => Promise<void>;
  refreshTopCards: () => Promise<void>;
  refreshHoleDifficulty: () => Promise<void>;
  refreshBasketStats: () => Promise<void>;
  
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
      const [
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
        api.getEvents(),
        api.getPlayers(),
        api.getLeaderboard(),
        api.getPlayerHistory(DEMO_PLAYER.PlayerID),
        api.getPlayerScorecards(DEMO_PLAYER.PlayerID),
        api.getHotRounds(),
        api.getPodiumStats(),
        api.getTopCards(),
        api.getHoleDifficulty(),
        api.getBasketStats(),
      ]);
      
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
      const data = await api.getLeaderboard(division);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to refresh leaderboard:', err);
    }
  };

  const refreshPlayerHistory = async () => {
    try {
      const data = await api.getPlayerHistory(DEMO_PLAYER.PlayerID);
      setPlayerHistory(data);
    } catch (err) {
      console.error('Failed to refresh player history:', err);
    }
  };

  const refreshPlayerScorecards = async () => {
    try {
      const data = await api.getPlayerScorecards(DEMO_PLAYER.PlayerID);
      setPlayerScorecards(data);
    } catch (err) {
      console.error('Failed to refresh player scorecards:', err);
    }
  };

  const refreshHotRounds = async () => {
    try {
      const data = await api.getHotRounds();
      setHotRounds(data);
    } catch (err) {
      console.error('Failed to refresh hot rounds:', err);
    }
  };

  const refreshPodiumStats = async () => {
    try {
      const data = await api.getPodiumStats();
      setPodiumStats(data);
    } catch (err) {
      console.error('Failed to refresh podium stats:', err);
    }
  };

  const refreshTopCards = async () => {
    try {
      const data = await api.getTopCards();
      setTopCards(data);
    } catch (err) {
      console.error('Failed to refresh top cards:', err);
    }
  };

  const refreshHoleDifficulty = async () => {
    try {
      const data = await api.getHoleDifficulty();
      setHoleDifficulty(data);
    } catch (err) {
      console.error('Failed to refresh hole difficulty:', err);
    }
  };

  const refreshBasketStats = async () => {
    try {
      const data = await api.getBasketStats();
      setBasketStats(data);
    } catch (err) {
      console.error('Failed to refresh basket stats:', err);
    }
  };

  const createNewScorecard = async (eventId: number): Promise<number | null> => {
    try {
      const result = await api.createScorecard({
        eventId,
        createdByPlayerId: DEMO_PLAYER.PlayerID,
      });
      await refreshPlayerScorecards();
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
      // Pad scores array to 4 players
      const paddedScores = [...scores];
      while (paddedScores.length < 4) {
        paddedScores.push({ playerId: scores[0]?.playerId || 1, strokes: 0 });
      }
      
      await api.insertHoleScores(scorecardId, {
        holeNumber,
        player1Id: paddedScores[0].playerId,
        player1Score: paddedScores[0].strokes,
        player2Id: paddedScores[1].playerId,
        player2Score: paddedScores[1].strokes,
        player3Id: paddedScores[2].playerId,
        player3Score: paddedScores[2].strokes,
        player4Id: paddedScores[3].playerId,
        player4Score: paddedScores[3].strokes,
      });
      
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
    player: DEMO_PLAYER,
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
    loading,
    error,
    refreshEvents,
    refreshPlayers,
    refreshLeaderboard,
    refreshPlayerHistory,
    refreshPlayerScorecards,
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
