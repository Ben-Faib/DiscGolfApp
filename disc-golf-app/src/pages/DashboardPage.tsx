import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getGroupsByUserId, getScorecardsByUserId, getPlayerStats, getUserById } from '../data';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Bell, 
  Target, 
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  ClipboardList
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { events, notifications } = useData();

  if (!user) return null;

  const myGroups = getGroupsByUserId(user.id);
  const myRecentScorecards = getScorecardsByUserId(user.id).slice(0, 3);
  const myStats = getPlayerStats(user.id);
  const unreadNotifications = notifications.filter(n => n.userId === user.id && !n.read);

  const userEvents = events.filter(e => e.participants.includes(user.id) && e.status === 'upcoming');

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
            Welcome back, {user.name}!
          </h1>
          <p className="text-white/90 text-lg">
            Ready to elevate your disc golf game today?
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card group hover:scale-105 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{userEvents.length}</div>
            </div>
            <div className="text-sm font-medium text-gray-600">Upcoming Events</div>
            <div className="mt-2 text-xs text-primary-600 font-semibold">VIEW ALL →</div>
          </div>
        </div>

        <div className="card group hover:scale-105 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-100 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent-100 rounded-xl">
                <Users className="w-6 h-6 text-accent-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{myGroups.length}</div>
            </div>
            <div className="text-sm font-medium text-gray-600">My Groups</div>
            <div className="mt-2 text-xs text-accent-600 font-semibold">MANAGE →</div>
          </div>
        </div>

        <div className="card group hover:scale-105 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-100 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{myStats?.averageScore || 'N/A'}</div>
            </div>
            <div className="text-sm font-medium text-gray-600">Average Score</div>
            <div className="mt-2 text-xs text-secondary-600 font-semibold">SEE STATS →</div>
          </div>
        </div>

        <div className="card group hover:scale-105 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl relative">
                <Bell className="w-6 h-6 text-orange-600" />
                {unreadNotifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadNotifications.length}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900">{unreadNotifications.length}</div>
            </div>
            <div className="text-sm font-medium text-gray-600">New Notifications</div>
            <div className="mt-2 text-xs text-orange-600 font-semibold">CHECK NOW →</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">My Upcoming Events</h2>
              </div>
              <Link to="/events" className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium group">
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {userEvents.length > 0 ? (
              <div className="space-y-3">
                {userEvents.slice(0, 3).map(event => (
                  <div key={event.id} className="group p-4 rounded-xl border-2 border-primary-100 hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gradient-primary rounded-lg shadow-glow shrink-0">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{event.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No upcoming events</p>
                <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Browse Events →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* My Groups */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Users className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">My Groups</h2>
              </div>
              <Link to="/groups" className="flex items-center space-x-1 text-accent-600 hover:text-accent-700 text-sm font-medium group">
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {myGroups.length > 0 ? (
              <div className="space-y-3">
                {myGroups.slice(0, 3).map(group => {
                  const owner = getUserById(group.ownerId);
                  return (
                    <div key={group.id} className="group p-4 rounded-xl border-2 border-accent-100 hover:border-accent-300 hover:bg-accent-50/50 transition-all">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gradient-accent rounded-lg shadow-glow-green shrink-0">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-accent-600 transition-colors">{group.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{group.members.length} active members</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Owner: {owner?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">You're not in any groups yet</p>
                <Link to="/groups" className="text-accent-600 hover:text-accent-700 font-medium text-sm">
                  Find or Create a Group →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scorecards */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-secondary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Scorecards</h2>
              </div>
              <Link to="/scorecard" className="flex items-center space-x-1 text-secondary-600 hover:text-secondary-700 text-sm font-medium group">
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {myRecentScorecards.length > 0 ? (
              <div className="space-y-3">
                {myRecentScorecards.map(scorecard => {
                  const event = events.find(e => e.id === scorecard.eventId);
                  const statusConfig = {
                    draft: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
                    submitted: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
                    approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
                    rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
                  };
                  const config = statusConfig[scorecard.status];
                  return (
                    <div key={scorecard.id} className="p-4 rounded-xl border-2 border-secondary-100 hover:border-secondary-300 hover:bg-secondary-50/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{event?.name}</h3>
                          <p className="text-2xl font-bold text-secondary-600 mt-2">Score: {scorecard.totalScore}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${config.bg} ${config.text} ${config.border}`}>
                          {scorecard.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <ClipboardList className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No scorecards yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        {myStats && (
          <div className="card">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Award className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Performance Stats</h2>
                </div>
                <Link to="/stats" className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm font-medium group">
                  <span>Details</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="text-sm font-medium text-green-700 mb-1">Best Score</div>
                  <div className="text-3xl font-bold text-green-600">{myStats.bestScore}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-200">
                  <div className="text-sm font-medium text-primary-700 mb-1">Avg Per Hole</div>
                  <div className="text-3xl font-bold text-primary-600">{myStats.averagePerHole.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-secondary-50 to-purple-50 rounded-xl border border-secondary-200">
                  <div className="text-sm font-medium text-secondary-700 mb-1">Total Events</div>
                  <div className="text-3xl font-bold text-secondary-600">{myStats.totalEvents}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <div className="text-sm font-medium text-orange-700 mb-1">Total Rounds</div>
                  <div className="text-3xl font-bold text-orange-600">{myStats.totalRounds}</div>
                </div>
              </div>
            </div>
          </div>
        )}
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
              to="/groups"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <Users className="w-8 h-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-white">Find Groups</div>
            </Link>
            <Link
              to="/scorecard"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <ClipboardList className="w-8 h-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-white">Enter Score</div>
            </Link>
            <Link
              to="/stats"
              className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-6 text-center transition-all hover:scale-105 border border-white/30"
            >
              <TrendingUp className="w-8 h-8 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-white">View Stats</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

