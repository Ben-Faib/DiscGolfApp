import { useState, useMemo, useEffect, useRef } from 'react';
import { useData, EventLimitFilter } from '../context/DataContext';
import { 
  Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Loader2, 
  Flame, Target, Users, Mountain, Circle,
  ChevronDown, Calendar, Hash, Filter, ChevronUp, X, Eye, BarChart3, ArrowUpDown, Search
} from 'lucide-react';
import { getEventImageByName } from '../utils/eventImages';
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonLeaderboardRow } from '../components/Skeleton';
import * as api from '../utils/api';

type TabType = 'leaderboard' | 'hotRounds' | 'podium' | 'topCards' | 'holeDifficulty' | 'basketStats';

// Event filter options
const EVENT_FILTER_OPTIONS: { value: EventLimitFilter; label: string }[] = [
  { value: 'latest', label: 'Most Recent Event' },
  { value: 3, label: 'Last 3 Events' },
  { value: 5, label: 'Last 5 Events' },
  { value: 10, label: 'Last 10 Events' },
  { value: 'all', label: 'All Events' },
];

// Helper to safely format numbers (handles strings from DB)
const formatNumber = (value: number | string | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0' : num.toFixed(decimals);
};

// Helper to safely get number for calculations (handles strings from DB)
const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

const StatsPage = () => {
  const { 
    player, 
    leaderboard, 
    playerHistory, 
    hotRounds,
    podiumStats,
    topCards,
    holeDifficulty,
    basketStats,
    statsEventFilter,
    setStatsEventFilter,
    refreshAllStats,
    loading, 
    error, 
    refreshLeaderboard 
  } = useData();
  
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  
  // Card details modal state
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [cardDetails, setCardDetails] = useState<api.CardDetails | null>(null);
  const [cardDetailsLoading, setCardDetailsLoading] = useState(false);
  const [showCompareScores, setShowCompareScores] = useState(false);
  
  // Global search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [filterMinScore, setFilterMinScore] = useState<number | ''>('');
  const [filterHeatLevel, setFilterHeatLevel] = useState<number | 'all'>('all');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      // Close search suggestions when clicking outside
      if (searchInputRef.current && !searchInputRef.current.parentElement?.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate search suggestions from player and event names
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions: { type: 'player' | 'event'; value: string }[] = [];
    const seen = new Set<string>();
    
    // Get player names from leaderboard (most complete list)
    leaderboard.forEach(entry => {
      const fullName = `${entry.FirstName} ${entry.LastName}`;
      if (fullName.toLowerCase().includes(query) && !seen.has(fullName)) {
        suggestions.push({ type: 'player', value: fullName });
        seen.add(fullName);
      }
    });
    
    // Get player names from hot rounds and podium stats
    hotRounds.forEach(r => {
      if (r.PlayerName.toLowerCase().includes(query) && !seen.has(r.PlayerName)) {
        suggestions.push({ type: 'player', value: r.PlayerName });
        seen.add(r.PlayerName);
      }
    });
    
    podiumStats.forEach(s => {
      if (s.PlayerName.toLowerCase().includes(query) && !seen.has(s.PlayerName)) {
        suggestions.push({ type: 'player', value: s.PlayerName });
        seen.add(s.PlayerName);
      }
    });
    
    // Get player names from top cards
    topCards.forEach(c => {
      c.Players.split(', ').forEach(playerName => {
        if (playerName.toLowerCase().includes(query) && !seen.has(playerName)) {
          suggestions.push({ type: 'player', value: playerName });
          seen.add(playerName);
        }
      });
    });
    
    // Get event names
    topCards.forEach(c => {
      if (c.EventName.toLowerCase().includes(query) && !seen.has(c.EventName)) {
        suggestions.push({ type: 'event', value: c.EventName });
        seen.add(c.EventName);
      }
    });
    
    hotRounds.forEach(r => {
      if (r.EventName.toLowerCase().includes(query) && !seen.has(r.EventName)) {
        suggestions.push({ type: 'event', value: r.EventName });
        seen.add(r.EventName);
      }
    });
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }, [searchQuery, leaderboard, hotRounds, podiumStats, topCards]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
  };

  // Handle event filter change
  const handleEventFilterChange = async (filter: EventLimitFilter) => {
    setStatsEventFilter(filter);
    setIsFilterOpen(false);
    setIsRefreshing(true);
    try {
      await refreshAllStats(filter);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get the current filter label
  const currentFilterLabel = EVENT_FILTER_OPTIONS.find(opt => opt.value === statsEventFilter)?.label || 'Most Recent Event';

  // Fetch card details for drill-down
  const fetchCardDetails = async (scorecardId: number, compareToPlayer: boolean = false) => {
    setSelectedCardId(scorecardId);
    setCardDetailsLoading(true);
    setShowCompareScores(compareToPlayer);
    try {
      const details = await api.getCardDetails(
        scorecardId, 
        compareToPlayer ? player.PlayerID : undefined
      );
      setCardDetails(details);
    } catch (err) {
      console.error('Failed to fetch card details:', err);
      setCardDetails(null);
    } finally {
      setCardDetailsLoading(false);
    }
  };

  const closeCardDetails = () => {
    setSelectedCardId(null);
    setCardDetails(null);
    setShowCompareScores(false);
  };

  const toggleCompareScores = async () => {
    if (selectedCardId && cardDetails) {
      const newShowCompare = !showCompareScores;
      setShowCompareScores(newShowCompare);
      if (newShowCompare && !cardDetails.compareScores) {
        // Fetch with compare data
        setCardDetailsLoading(true);
        try {
          const details = await api.getCardDetails(selectedCardId, player.PlayerID);
          setCardDetails(details);
        } catch (err) {
          console.error('Failed to fetch compare scores:', err);
        } finally {
          setCardDetailsLoading(false);
        }
      }
    }
  };

  // Filtered Hot Rounds
  const filteredHotRounds = useMemo(() => {
    let filtered = hotRounds;
    
    // Search by event or player name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.EventName.toLowerCase().includes(query) ||
        r.PlayerName.toLowerCase().includes(query)
      );
    }
    
    // Filter by division
    if (filterDivision !== 'all') {
      filtered = filtered.filter(r => r.SkillDivision === filterDivision);
    }
    
    // Filter by minimum score
    if (filterMinScore !== '') {
      filtered = filtered.filter(r => r.RoundTotal >= filterMinScore);
    }
    
    // Filter by heat level (based on the flame intensity logic)
    if (filterHeatLevel !== 'all') {
      const maxScore = Math.max(...hotRounds.map(r => r.RoundTotal), 1);
      filtered = filtered.filter(r => {
        const percentile = r.RoundTotal / maxScore;
        if (filterHeatLevel === 3) return percentile >= 0.9;
        if (filterHeatLevel === 2) return percentile >= 0.7 && percentile < 0.9;
        return percentile < 0.7;
      });
    }
    
    return filtered;
  }, [hotRounds, searchQuery, filterDivision, filterMinScore, filterHeatLevel]);

  // Filtered Podium Stats
  const filteredPodiumStats = useMemo(() => {
    let filtered = podiumStats;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.PlayerName.toLowerCase().includes(query));
    }
    
    if (filterDivision !== 'all') {
      filtered = filtered.filter(s => s.SkillDivision === filterDivision);
    }
    
    return filtered;
  }, [podiumStats, searchQuery, filterDivision]);

  // Filtered Top Cards
  const filteredTopCards = useMemo(() => {
    let filtered = topCards;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.EventName.toLowerCase().includes(query) ||
        c.Players.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [topCards, searchQuery]);

  // Group filtered top cards by event
  const topCardsByEvent = useMemo(() => {
    const grouped: Record<string, typeof filteredTopCards> = {};
    filteredTopCards.forEach(card => {
      const key = `${card.EventName}-${card.EventDate}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(card);
    });
    // Sort cards within each event by rank
    Object.values(grouped).forEach(cards => {
      cards.sort((a, b) => a.CardRank - b.CardRank);
    });
    return grouped;
  }, [filteredTopCards]);

  // Filtered Hole Difficulty
  const filteredHoleDifficulty = useMemo(() => {
    let filtered = holeDifficulty;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(h => h.EventName.toLowerCase().includes(query));
    }
    
    return filtered;
  }, [holeDifficulty, searchQuery]);

  // Filtered Basket Stats  
  const filteredBasketStats = useMemo(() => {
    let filtered = basketStats;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.Brand.toLowerCase().includes(query) ||
        b.Model.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [basketStats, searchQuery]);

  const toggleEventExpand = (eventKey: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventKey)) {
        next.delete(eventKey);
      } else {
        next.add(eventKey);
      }
      return next;
    });
  };

  const tabs = [
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: Trophy },
    { id: 'hotRounds' as TabType, label: 'Hot Rounds', icon: Flame },
    { id: 'podium' as TabType, label: 'Podium Stats', icon: Medal },
    { id: 'topCards' as TabType, label: 'Top Cards', icon: Users },
    { id: 'holeDifficulty' as TabType, label: 'Hole Difficulty', icon: Mountain },
    { id: 'basketStats' as TabType, label: 'Basket Stats', icon: Circle },
  ];

  const divisions = ['all', 'Advanced', 'Intermediate', 'Recreational'];

  const filteredLeaderboard = selectedDivision === 'all' 
    ? leaderboard 
    : leaderboard.filter(entry => entry.SkillDivision === selectedDivision);

  const leaderboardByDivision = filteredLeaderboard.reduce((acc, entry) => {
    if (!acc[entry.SkillDivision]) {
      acc[entry.SkillDivision] = [];
    }
    acc[entry.SkillDivision].push(entry);
    return acc;
  }, {} as Record<string, typeof leaderboard>);

  const handleDivisionChange = async (division: string) => {
    setSelectedDivision(division);
    if (division === 'all') {
      await refreshLeaderboard();
    } else {
      await refreshLeaderboard(division);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const isCurrentPlayer = (firstName: string, lastName: string) => 
    firstName === player.FirstName && lastName === player.LastName;

  // Get difficulty icon properties - icon-only approach
  const getDifficultyIcon = (rating: string) => {
    switch (rating) {
      case 'Easy': 
        return { color: 'bg-green-500', ringColor: 'ring-green-200 dark:ring-green-900', label: 'Easy' };
      case 'Moderate': 
        return { color: 'bg-yellow-500', ringColor: 'ring-yellow-200 dark:ring-yellow-900', label: 'Moderate' };
      case 'Difficult': 
        return { color: 'bg-orange-500', ringColor: 'ring-orange-200 dark:ring-orange-900', label: 'Difficult' };
      case 'Very Difficult': 
        return { color: 'bg-red-500', ringColor: 'ring-red-200 dark:ring-red-900', label: 'Very Difficult' };
      case 'Extremely Difficult': 
        return { color: 'bg-purple-500', ringColor: 'ring-purple-200 dark:ring-purple-900', label: 'Extremely Difficult' };
      default: 
        return { color: 'bg-gray-400', ringColor: 'ring-gray-200 dark:ring-gray-700', label: rating || 'Unknown' };
    }
  };

  // Legacy color function for any remaining text badges
  const getDifficultyColor = (rating: string) => {
    switch (rating) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Difficult': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Very Difficult': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Extremely Difficult': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-slide-up-fade stagger-1">
          <SkeletonText className="w-24 h-8 mb-2" />
          <SkeletonText className="w-48" />
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="glass-card p-2 animate-slide-up-fade stagger-2">
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-12 w-24 sm:w-32 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Leaderboard Card Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 animate-slide-up-fade stagger-3">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <SkeletonCircle className="w-9 h-9" />
              <SkeletonText className="w-40 h-6" />
            </div>
          </div>
          
          {/* Table Header Skeleton */}
          <div className="bg-gray-50 dark:bg-slate-800 py-4 px-6 flex gap-4">
            <SkeletonText className="w-16" />
            <SkeletonText className="w-32" />
            <SkeletonText className="w-16 ml-auto" />
            <SkeletonText className="w-20" />
            <SkeletonText className="w-20" />
          </div>
          
          {/* Leaderboard Rows Skeleton */}
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonLeaderboardRow key={i} className={`animate-slide-up-fade stagger-${Math.min(i + 3, 6)}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-card p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error || 'Failed to load player data'}</p>
        </div>
      </div>
    );
  }

  const renderLeaderboardTab = () => {
    // Calculate max values for progress bars
    const maxRounds = Math.max(...filteredLeaderboard.map(e => e.RoundsPlayed), 1);
    const maxBestRound = Math.max(...filteredLeaderboard.map(e => e.BestScorecardTotal), 1);
    const maxHighTotal = Math.max(...filteredLeaderboard.map(e => e.HighTotal), 1);

    // Get trend indicator based on rank position
    const getTrendIndicator = (rank: number, totalEntries: number) => {
      const percentile = rank / totalEntries;
      if (percentile <= 0.33) {
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      } else if (percentile <= 0.66) {
        return <Minus className="w-4 h-4 text-yellow-500" />;
      }
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    };

    return (
    <>
      {/* Division Filter */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {divisions.map(division => (
            <button
              key={division}
              onClick={() => handleDivisionChange(division)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedDivision === division
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'glass text-gray-700 dark:text-gray-300 hover:scale-105'
              }`}
            >
              {division === 'all' ? 'All Divisions' : division}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Tables */}
      {Object.entries(leaderboardByDivision).map(([division, entries]) => {
        const divisionMaxRounds = Math.max(...entries.map(e => e.RoundsPlayed), 1);
        const divisionMaxBest = Math.max(...entries.map(e => e.BestScorecardTotal), 1);
        const divisionMaxTotal = Math.max(...entries.map(e => e.HighTotal), 1);
        
        return (
        <div key={division} className="card mb-6">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{division} Division</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">({entries.length} players)</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Rank</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Player</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Rounds</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Best Round</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">High Total</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const roundsPercent = (entry.RoundsPlayed / divisionMaxRounds) * 100;
                  const bestPercent = (entry.BestScorecardTotal / divisionMaxBest) * 100;
                  const totalPercent = (entry.HighTotal / divisionMaxTotal) * 100;
                  
                  return (
                  <tr 
                    key={`${entry.FirstName}-${entry.LastName}`}
                    className={`border-b border-gray-100 dark:border-slate-700 transition-colors ${
                      isCurrentPlayer(entry.FirstName, entry.LastName)
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(entry.DivisionRank)}
                        {getTrendIndicator(entry.DivisionRank, entries.length)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                          {entry.FirstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {entry.FirstName} {entry.LastName}
                            {isCurrentPlayer(entry.FirstName, entry.LastName) && (
                              <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{entry.SkillDivision}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{entry.RoundsPlayed}</span>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-400 rounded-full transition-all duration-500"
                            style={{ width: `${roundsPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold text-secondary-600 dark:text-secondary-400">{entry.BestScorecardTotal}</span>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-500"
                            style={{ width: `${bestPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{entry.HighTotal}</span>
                        <div className="w-20 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                            style={{ width: `${totalPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        );
      })}

      {/* Player Score History */}
      {playerHistory.length > 0 && (
        <div className="card">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Score History</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your top 3 rounds count toward your leaderboard total
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {playerHistory.map(record => (
                <div 
                  key={record.ScorecardID}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    record.CountsTowardTotal === 'Yes'
                      ? 'border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shadow shrink-0">
                        <img 
                          src={getEventImageByName(record.EventName)} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{record.EventName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.EventDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {record.ScorecardTotal}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Rank #{record.ScoreRank}</span>
                        {record.CountsTowardTotal === 'Yes' && (
                          <span className="text-xs bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 px-2 py-1 rounded-full">
                            Counts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredLeaderboard.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No leaderboard data available</p>
        </div>
      )}
    </>
    );
  };

  const renderHotRoundsTab = () => {
    // Calculate max score for progress bars (use all hotRounds for consistent percentile)
    const maxScore = Math.max(...hotRounds.map(r => r.RoundTotal), 1);
    
    // Get flame intensity based on score percentile
    const getFlameIntensity = (score: number) => {
      const percentile = score / maxScore;
      if (percentile >= 0.9) return { flames: 3, color: 'from-red-500 to-orange-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' };
      if (percentile >= 0.7) return { flames: 2, color: 'from-orange-500 to-yellow-500', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.4)]' };
      return { flames: 1, color: 'from-yellow-500 to-amber-400', glow: '' };
    };

    return (
    <div className="card">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hot Rounds</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Best individual rounds per event by division</p>
            </div>
          </div>
          {filteredHotRounds.length !== hotRounds.length && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredHotRounds.length} of {hotRounds.length}
            </span>
          )}
        </div>
      </div>
      
      {filteredHotRounds.length === 0 ? (
        <div className="p-12 text-center">
          <Flame className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {hotRounds.length === 0 ? 'No hot rounds data available' : 'No rounds match your filters'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Event</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Player</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Division</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Score</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Holes</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Heat</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotRounds.map((round, idx) => {
                const scorePercent = (round.RoundTotal / maxScore) * 100;
                const flameInfo = getFlameIntensity(round.RoundTotal);
                
                return (
                <tr key={idx} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shadow shrink-0">
                        <img 
                          src={getEventImageByName(round.EventName)} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{round.EventName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(round.EventDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                        {round.PlayerName.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{round.PlayerName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                      {round.SkillDivision}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <span className={`text-2xl font-bold bg-gradient-to-r ${flameInfo.color} bg-clip-text text-transparent`}>
                          {round.RoundTotal}
                        </span>
                      </div>
                      <div className="w-20 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${flameInfo.color} rounded-full transition-all duration-500`}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">{round.HolesPlayed}</td>
                  <td className="py-4 px-6 text-center">
                    <div className={`inline-flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${flameInfo.color} ${flameInfo.glow}`}>
                      {Array.from({ length: flameInfo.flames }).map((_, i) => (
                        <Flame key={i} className="w-4 h-4 text-white" />
                      ))}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
  };

  const renderPodiumTab = () => (
    <div className="card">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg">
              <Medal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Podium Stats</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Player podium finish percentages (Top 3 finishes)</p>
            </div>
          </div>
          {filteredPodiumStats.length !== podiumStats.length && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredPodiumStats.length} of {podiumStats.length}
            </span>
          )}
        </div>
      </div>
      
      {filteredPodiumStats.length === 0 ? (
        <div className="p-12 text-center">
          <Medal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {podiumStats.length === 0 ? 'No podium stats available' : 'No stats match your filters'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Player</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Division</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Podium Finishes</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Total Rounds</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Podium %</th>
              </tr>
            </thead>
            <tbody>
              {filteredPodiumStats.map((stat, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white font-bold">
                        {stat.PlayerName.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{stat.PlayerName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                      {stat.SkillDivision}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stat.PodiumFinishes}</span>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">{stat.TotalRounds}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(toNumber(stat.PodiumPercentage), 100)}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {formatNumber(stat.PodiumPercentage, 1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTopCardsTab = () => {
    const eventKeys = Object.keys(topCardsByEvent).sort((a, b) => {
      // Sort by date descending (newest first)
      const dateA = new Date(topCardsByEvent[a][0].EventDate);
      const dateB = new Date(topCardsByEvent[b][0].EventDate);
      return dateB.getTime() - dateA.getTime();
    });

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Top Cards</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Best group scores per event</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {eventKeys.length} events · {filteredTopCards.length} cards
              {filteredTopCards.length !== topCards.length && (
                <span className="ml-1">(of {topCards.length})</span>
              )}
            </div>
          </div>
        </div>

        {filteredTopCards.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {topCards.length === 0 ? 'No top cards data available' : 'No cards match your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventKeys.map(eventKey => {
              const cards = topCardsByEvent[eventKey];
              const firstCard = cards[0];
              const isExpanded = expandedEvents.has(eventKey);
              const topCard = cards[0]; // Best card for this event

              return (
                <div 
                  key={eventKey} 
                  className="card overflow-hidden transition-all duration-300"
                >
                  {/* Event Header - Clickable */}
                  <button
                    onClick={() => toggleEventExpand(eventKey)}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Event Image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg shrink-0 ring-2 ring-gray-100 dark:ring-slate-700">
                        <img 
                          src={getEventImageByName(firstCard.EventName)} 
                          alt={firstCard.EventName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Event Info */}
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                            {firstCard.EventName}
                          </h3>
                          {getRankIcon(1)}
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(firstCard.EventDate).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Hash className="w-3.5 h-3.5" />
                            <span>{firstCard.HolesPlayed} holes</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{cards.length} cards</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Top Score Preview */}
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Top Score</div>
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {topCard.CardTotal}
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <div className={`p-2 rounded-full bg-gray-100 dark:bg-slate-700 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                  </button>

                  {/* Expandable Content */}
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="border-t border-gray-100 dark:border-slate-700">
                      {cards.map((card, idx) => (
                        <div 
                          key={idx}
                          className={`p-4 flex items-center justify-between ${
                            idx !== cards.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''
                          } ${idx === 0 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10' : ''}`}
                        >
                          {/* Rank & Players */}
                          <div className="flex items-center space-x-4">
                            <div className="w-12 flex justify-center">
                              {getRankIcon(card.CardRank)}
                            </div>
                            
                            <div>
                              {/* Player Names */}
                              <div className="flex flex-wrap gap-1.5">
                                {card.Players.split(', ').map((playerName, pIdx) => (
                                  <span 
                                    key={pIdx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                                  >
                                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold mr-1.5">
                                      {playerName.charAt(0)}
                                    </span>
                                    {playerName}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {card.PlayerCount} players
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-4 text-right">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</div>
                              <div className={`text-xl font-bold ${
                                card.CardRank === 1 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : card.CardRank === 2 
                                    ? 'text-gray-500 dark:text-gray-400'
                                    : card.CardRank === 3
                                      ? 'text-amber-600 dark:text-amber-500'
                                      : 'text-primary-600 dark:text-primary-400'
                              }`}>
                                {card.CardTotal}
                              </div>
                            </div>
                            <div className="hidden sm:block">
                              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg/Hole</div>
                              <div className="text-lg font-semibold text-secondary-600 dark:text-secondary-400">
                                {formatNumber(card.AvgScorePerHole, 2)}
                              </div>
                            </div>
                            {/* View Details Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (card.ScorecardID) {
                                  fetchCardDetails(card.ScorecardID);
                                } else {
                                  alert('Card details require the database view to include ScorecardID. Please update vw_TopCardPerEvent.');
                                }
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">Details</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderHoleDifficultyTab = () => (
    <div className="card">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hole Difficulty</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hardest holes ranked by average score</p>
            </div>
          </div>
          {filteredHoleDifficulty.length !== holeDifficulty.length && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredHoleDifficulty.length} of {holeDifficulty.length}
            </span>
          )}
        </div>
      </div>
      
      {filteredHoleDifficulty.length === 0 ? (
        <div className="p-12 text-center">
          <Mountain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {holeDifficulty.length === 0 ? 'No hole difficulty data available' : 'No holes match your search'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Event / Hole</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Distance</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Obstacle</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Avg Score</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Success Rate</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoleDifficulty.map((hole, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shadow shrink-0">
                        <img 
                          src={getEventImageByName(hole.EventName)} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{hole.EventName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Hole #{hole.HoleNumber} · Played {hole.TimesPlayed} times
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">
                    {hole.DistanceFeet} ft
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{hole.ObstacleDescription}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-x-2">
                      {hole.IsMandatory === 'Yes' && <span className="text-orange-600">Mandatory</span>}
                      {hole.HasObstruction === 'Yes' && <span className="text-red-600">Obstruction</span>}
                      {hole.Elevation > 0 && <span className="text-blue-600">+{hole.Elevation}ft elev</span>}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {formatNumber(hole.AvgScore, 2)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" 
                          style={{ width: `${toNumber(hole.SuccessRatePercent)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatNumber(hole.SuccessRatePercent, 1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div 
                      className="flex items-center justify-center"
                      title={getDifficultyIcon(hole.DifficultyRating).label}
                    >
                      <div 
                        className={`w-5 h-5 rounded-full ${getDifficultyIcon(hole.DifficultyRating).color} ring-2 ${getDifficultyIcon(hole.DifficultyRating).ringColor}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderBasketStatsTab = () => {
    // Calculate score distribution percentages for stacked bars
    const getDistributionPercents = (basket: typeof basketStats[0]) => {
      const total = basket.ZeroScores + basket.OneScores + basket.TwoScores + basket.PerfectScores;
      if (total === 0) return { zero: 0, one: 0, two: 0, perfect: 0 };
      return {
        zero: (basket.ZeroScores / total) * 100,
        one: (basket.OneScores / total) * 100,
        two: (basket.TwoScores / total) * 100,
        perfect: (basket.PerfectScores / total) * 100
      };
    };

    return (
    <div className="card">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Basket Stats</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Basket difficulty analysis by brand and model</p>
            </div>
          </div>
          {filteredBasketStats.length !== basketStats.length && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredBasketStats.length} of {basketStats.length}
            </span>
          )}
        </div>
      </div>
      
      {filteredBasketStats.length === 0 ? (
        <div className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {basketStats.length === 0 ? 'No basket stats available' : 'No baskets match your search'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Basket</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Chains</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Attempts</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Avg Score</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Score Distribution</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {filteredBasketStats.map((basket, idx) => {
                const dist = getDistributionPercents(basket);
                
                return (
                <tr key={idx} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{basket.Brand}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {basket.Model} {basket.HasUpperBand === 'Yes' && '· Upper Band'}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">
                    {basket.ChainCount}
                  </td>
                  <td className="py-4 px-6 text-center text-gray-700 dark:text-gray-300">
                    <div>{basket.TotalAttempts}</div>
                    <div className="text-xs text-gray-500">({basket.TimesUsed} events)</div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {formatNumber(basket.AvgScore, 2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2">
                      {/* Stacked bar visualization */}
                      <div className="w-full h-4 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-red-500 transition-all duration-500" 
                          style={{ width: `${dist.zero}%` }}
                          title={`0: ${basket.ZeroScores}`}
                        />
                        <div 
                          className="h-full bg-orange-500 transition-all duration-500" 
                          style={{ width: `${dist.one}%` }}
                          title={`1: ${basket.OneScores}`}
                        />
                        <div 
                          className="h-full bg-yellow-500 transition-all duration-500" 
                          style={{ width: `${dist.two}%` }}
                          title={`2: ${basket.TwoScores}`}
                        />
                        <div 
                          className="h-full bg-green-500 transition-all duration-500" 
                          style={{ width: `${dist.perfect}%` }}
                          title={`3: ${basket.PerfectScores}`}
                        />
                      </div>
                      {/* Legend with counts */}
                      <div className="flex justify-between text-[10px] font-medium">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          <span className="text-gray-600 dark:text-gray-400">{basket.ZeroScores}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          <span className="text-gray-600 dark:text-gray-400">{basket.OneScores}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          <span className="text-gray-600 dark:text-gray-400">{basket.TwoScores}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-gray-600 dark:text-gray-400">{basket.PerfectScores}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-2" title={getDifficultyIcon(basket.DifficultyRating).label}>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">#{basket.DifficultyRank}</span>
                      <div 
                        className={`w-4 h-4 rounded-full ${getDifficultyIcon(basket.DifficultyRating).color} ring-2 ${getDifficultyIcon(basket.DifficultyRating).ringColor}`}
                      />
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
  };

  // Card Details Modal
  const renderCardDetailModal = () => {
    if (!selectedCardId) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeCardDetails}>
        <div 
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up-fade"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Card Details</h2>
                {cardDetails && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {cardDetails.card.EventName} · {new Date(cardDetails.card.EventDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={closeCardDetails}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {cardDetailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : cardDetails ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {cardDetails.card.CardTotal}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Card Total</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                      {cardDetails.members.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Players</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      #{cardDetails.bestHole.hole}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
                      Best Hole ({cardDetails.bestHole.total} pts)
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      #{cardDetails.worstHole.hole}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
                      Worst Hole ({cardDetails.worstHole.total} pts)
                    </div>
                  </div>
                </div>

                {/* Player Rankings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Player Rankings</h3>
                  <div className="space-y-2">
                    {cardDetails.members.map((member, idx) => (
                      <div 
                        key={member.PlayerID}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          member.PlayerID === player.PlayerID 
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-700'
                            : 'bg-gray-50 dark:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {member.FirstName} {member.LastName}
                            </span>
                            {member.PlayerID === player.PlayerID && (
                              <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {member.PlayerTotal}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Per-Hole Breakdown */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Per-Hole Scores</h3>
                    <button
                      onClick={toggleCompareScores}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        showCompareScores
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      <span>Compare to My Scores</span>
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="py-2 px-3 text-left font-semibold text-gray-700 dark:text-gray-300">Hole</th>
                          {cardDetails.members.map(member => (
                            <th key={member.PlayerID} className="py-2 px-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                              {member.FirstName.charAt(0)}{member.LastName.charAt(0)}
                            </th>
                          ))}
                          <th className="py-2 px-3 text-center font-semibold text-gray-700 dark:text-gray-300">Total</th>
                          {showCompareScores && cardDetails.compareScores && (
                            <th className="py-2 px-3 text-center font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20">
                              You
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: cardDetails.card.HoleCount }, (_, i) => i + 1).map(holeNum => {
                          const holeScores = cardDetails.scores.filter(s => s.HoleNumber === holeNum);
                          const holeTotal = holeScores.reduce((sum, s) => sum + s.Strokes, 0);
                          const compareScore = cardDetails.compareScores?.scores.find(s => s.HoleNumber === holeNum);
                          
                          return (
                            <tr key={holeNum} className="border-b border-gray-100 dark:border-slate-700">
                              <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">#{holeNum}</td>
                              {cardDetails.members.map(member => {
                                const score = holeScores.find(s => s.PlayerID === member.PlayerID);
                                return (
                                  <td key={member.PlayerID} className="py-2 px-3 text-center text-gray-700 dark:text-gray-300">
                                    {score ? score.Strokes : '-'}
                                  </td>
                                );
                              })}
                              <td className="py-2 px-3 text-center font-bold text-gray-900 dark:text-gray-100">
                                {holeTotal}
                              </td>
                              {showCompareScores && cardDetails.compareScores && (
                                <td className={`py-2 px-3 text-center font-medium bg-primary-50 dark:bg-primary-900/20 ${
                                  compareScore && compareScore.Strokes > (holeTotal / cardDetails.members.length)
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {compareScore ? compareScore.Strokes : '-'}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        {/* Totals Row */}
                        <tr className="bg-gray-50 dark:bg-slate-700 font-bold">
                          <td className="py-2 px-3 text-gray-900 dark:text-gray-100">Total</td>
                          {cardDetails.members.map(member => (
                            <td key={member.PlayerID} className="py-2 px-3 text-center text-primary-600 dark:text-primary-400">
                              {member.PlayerTotal}
                            </td>
                          ))}
                          <td className="py-2 px-3 text-center text-lg text-primary-600 dark:text-primary-400">
                            {cardDetails.card.CardTotal}
                          </td>
                          {showCompareScores && cardDetails.compareScores && (
                            <td className="py-2 px-3 text-center text-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                              {cardDetails.compareScores.total}
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Failed to load card details
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboard': return renderLeaderboardTab();
      case 'hotRounds': return renderHotRoundsTab();
      case 'podium': return renderPodiumTab();
      case 'topCards': return renderTopCardsTab();
      case 'holeDifficulty': return renderHoleDifficultyTab();
      case 'basketStats': return renderBasketStatsTab();
      default: return renderLeaderboardTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Event Filter */}
      <div className="animate-slide-up-fade stagger-1 relative z-30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Stats</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">League statistics and rankings</p>
          </div>
          
          {/* Event Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              disabled={isRefreshing}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 
                ${isFilterOpen 
                  ? 'bg-gradient-primary text-white shadow-glow' 
                  : 'glass text-gray-700 dark:text-gray-300 hover:scale-105'
                }
                ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Filter className="w-4 h-4" />
              )}
              <span className="text-sm">{currentFilterLabel}</span>
              {isFilterOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {/* Dropdown Menu */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 z-[100] overflow-hidden animate-slide-up-fade">
                <div className="py-1">
                  {EVENT_FILTER_OPTIONS.map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => handleEventFilterChange(option.value)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        statsEventFilter === option.value
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {statsEventFilter === option.value && (
                          <div className="w-2 h-2 rounded-full bg-primary-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar - Hide on leaderboard and hole difficulty */}
      {activeTab !== 'leaderboard' && activeTab !== 'holeDifficulty' && (
      <div className="glass-card p-4 animate-slide-up-fade stagger-2 relative z-20">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search Input with Autocomplete */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search events or players..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchSuggestions(true);
              }}
              onFocus={() => setShowSearchSuggestions(true)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* Autocomplete Dropdown */}
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-[100] overflow-hidden">
                {searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion.value)}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2"
                  >
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      suggestion.type === 'player' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}>
                      {suggestion.type === 'player' ? 'Player' : 'Event'}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{suggestion.value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Division Filter - show on relevant tabs */}
          {(activeTab === 'hotRounds' || activeTab === 'podium') && (
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
            >
              <option value="all">All Divisions</option>
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Recreational">Recreational</option>
            </select>
          )}

          {/* Hot Rounds specific filters */}
          {activeTab === 'hotRounds' && (
            <>
              {/* Min Score Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Min Score:</span>
                <input
                  type="number"
                  placeholder="0"
                  value={filterMinScore}
                  onChange={(e) => setFilterMinScore(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-20 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Heat Level Filter */}
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Heat:</span>
                {[
                  { value: 'all' as const, label: 'All', flames: 0 },
                  { value: 1 as const, label: '1', flames: 1 },
                  { value: 2 as const, label: '2', flames: 2 },
                  { value: 3 as const, label: '3', flames: 3 },
                ].map(option => (
                  <button
                    key={String(option.value)}
                    onClick={() => setFilterHeatLevel(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterHeatLevel === option.value
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {option.flames === 0 ? 'All' : (
                      <span className="flex items-center">
                        {Array.from({ length: option.flames }).map((_, i) => (
                          <Flame key={i} className="w-3.5 h-3.5" />
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Clear Filters Button */}
          {(searchQuery || filterDivision !== 'all' || filterMinScore !== '' || filterHeatLevel !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterDivision('all');
                setFilterMinScore('');
                setFilterHeatLevel('all');
              }}
              className="px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      )}

      {/* Tab Navigation */}
      <div className="glass-card p-2 animate-slide-up-fade stagger-3">
        <div className="flex flex-wrap gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`animate-slide-up-fade stagger-4 ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}>
        {renderTabContent()}
      </div>

      {/* Card Details Modal */}
      {renderCardDetailModal()}
    </div>
  );
};

export default StatsPage;
