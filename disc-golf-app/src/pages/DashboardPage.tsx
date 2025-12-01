import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Award,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { getEventImage } from '../utils/eventImages';

const DashboardPage = () => {
  const { 
    player, 
    events, 
    leaderboard, 
    playerScorecards, 
    playerHistory,
    loading, 
    error 
  } = useData();

  // Find player's leaderboard entry
  const playerLeaderboardEntry = leaderboard.find(
    entry => entry.FirstName === player.FirstName && entry.LastName === player.LastName
  );

  // Get upcoming events
  const upcomingEvents = events.filter(e => new Date(e.EventDate) >= new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Connecting to database...</p>
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Make sure the Flask backend is running on port 5000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-12 shadow-glow">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="text-white/80 font-medium">Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Welcome back, {player.FirstName}!
          </h1>
          <p className="text-white/90 text-lg">
            Ready to improve your putting game?
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card group hover:scale-105 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/50 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{upcomingEvents.length}</div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Events</div>
          </div>
        </div>

        <div className="card group hover:scale-105 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-100 dark:bg-accent-900/50 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-xl">
                <ClipboardList className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {playerScorecards.length}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Rounds Played</div>
          </div>
        </div>

        <div className="card group hover:scale-105 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-100 dark:bg-secondary-900/50 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {playerLeaderboardEntry?.HighTotal || 'N/A'}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">High Score (Top 3)</div>
          </div>
        </div>

        <div className="card group hover:scale-105 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/50 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                #{playerLeaderboardEntry?.DivisionRank || '-'}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Division Rank</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="card">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upcoming Events</h2>
              </div>
              <Link to="/events" className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium group">
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map(event => (
                  <div key={event.EventID} className="group relative rounded-xl overflow-hidden border-2 border-primary-100 dark:border-primary-900/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <img 
                        src={getEventImage(event.EventID)} 
                        alt="" 
                        className="w-full h-full object-cover opacity-20 dark:opacity-15 group-hover:opacity-30 dark:group-hover:opacity-25 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/60 to-transparent dark:from-slate-900/90 dark:via-slate-900/70 dark:to-transparent"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative p-4 flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shrink-0 ring-2 ring-white dark:ring-slate-700">
                        <img 
                          src={getEventImage(event.EventID)} 
                          alt={event.Name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{event.Name}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {new Date(event.EventDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {event.HoleCount} holes
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No upcoming events</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scorecards */}
        <div className="card">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Rounds</h2>
              </div>
              <Link to="/scorecard" className="flex items-center space-x-1 text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 text-sm font-medium group">
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {playerHistory.length > 0 ? (
              <div className="space-y-3">
                {playerHistory.slice(0, 5).map(record => (
                  <div key={record.ScorecardID} className="p-4 rounded-xl border-2 border-secondary-100 dark:border-secondary-900/50 hover:border-secondary-300 dark:hover:border-secondary-700 hover:bg-secondary-50/50 dark:hover:bg-secondary-900/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{record.EventName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.EventDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                          {record.ScorecardTotal}
                        </div>
                        {record.CountsTowardTotal === 'Yes' && (
                          <span className="text-xs bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 px-2 py-1 rounded-full">
                            Top 3
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
                  <ClipboardList className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No scorecards yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-accent p-8 shadow-glow-green">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/events"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <Calendar className="w-8 h-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-white">Browse Events</div>
            </Link>
            <Link
              to="/scorecard"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <ClipboardList className="w-8 h-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-white">Enter Scores</div>
            </Link>
            <Link
              to="/stats"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <TrendingUp className="w-8 h-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-white">Leaderboard</div>
            </Link>
            <Link
              to="/stats"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <Award className="w-8 h-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-white">My Stats</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
