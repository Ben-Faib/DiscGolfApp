import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Loader2, 
  Flame, Target, Users, Mountain, Circle,
  ChevronDown, Calendar, Hash
} from 'lucide-react';
import { getEventImageByName } from '../utils/eventImages';
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonLeaderboardRow } from '../components/Skeleton';

type TabType = 'leaderboard' | 'hotRounds' | 'podium' | 'topCards' | 'holeDifficulty' | 'basketStats';

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
    loading, 
    error, 
    refreshLeaderboard 
  } = useData();
  
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Group top cards by event
  const topCardsByEvent = useMemo(() => {
    const grouped: Record<string, typeof topCards> = {};
    topCards.forEach(card => {
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
  }, [topCards]);

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-card p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
    // Calculate max score for progress bars
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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hot Rounds</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Best individual rounds per event by division</p>
          </div>
        </div>
      </div>
      
      {hotRounds.length === 0 ? (
        <div className="p-12 text-center">
          <Flame className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No hot rounds data available</p>
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
              {hotRounds.map((round, idx) => {
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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg">
            <Medal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Podium Stats</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Player podium finish percentages (Top 3 finishes)</p>
          </div>
        </div>
      </div>
      
      {podiumStats.length === 0 ? (
        <div className="p-12 text-center">
          <Medal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No podium stats available</p>
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
              {podiumStats.map((stat, idx) => (
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
              {eventKeys.length} events · {topCards.length} cards
            </div>
          </div>
        </div>

        {topCards.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No top cards data available</p>
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
                          <div className="flex items-center space-x-6 text-right">
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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hole Difficulty</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hardest holes ranked by average score</p>
          </div>
        </div>
      </div>
      
      {holeDifficulty.length === 0 ? (
        <div className="p-12 text-center">
          <Mountain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No hole difficulty data available</p>
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
              {holeDifficulty.map((hole, idx) => (
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(hole.DifficultyRating)}`}>
                      {hole.DifficultyRating}
                    </span>
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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Basket Stats</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Basket difficulty analysis by brand and model</p>
          </div>
        </div>
      </div>
      
      {basketStats.length === 0 ? (
        <div className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No basket stats available</p>
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
              {basketStats.map((basket, idx) => {
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(basket.DifficultyRating)}`}>
                      #{basket.DifficultyRank} {basket.DifficultyRating}
                    </span>
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
      <div className="animate-slide-up-fade stagger-1">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Stats</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">League statistics and rankings</p>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-2 animate-slide-up-fade stagger-2">
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
      <div className="animate-slide-up-fade stagger-3">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StatsPage;
