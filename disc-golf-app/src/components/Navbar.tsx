import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../data/types';
import { 
  Home, 
  Calendar, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Bell, 
  Settings,
  Shield,
  UserCog,
  LogOut,
  Disc3,
  Sun,
  Moon
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, switchRole } = useAuth();
  const { notifications } = useData();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const unreadCount = notifications.filter(n => n.userId === user.id && !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as UserRole);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow-purple';
      case 'head_organizer':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
      case 'organizer':
        return 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white';
      case 'player':
      default:
        return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'head_organizer':
        return 'Head Organizer';
      case 'organizer':
        return 'Organizer';
      case 'player':
      default:
        return 'Player';
    }
  };

  const showOrganizerLinks = user.role === 'organizer' || user.role === 'head_organizer' || user.role === 'admin';
  const showHeadOrganizerLinks = user.role === 'head_organizer' || user.role === 'admin';
  const showAdminLinks = user.role === 'admin';

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-slate-700/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-glow group-hover:scale-110 transition-all duration-300">
              <Disc3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text-teal">Disc Golf Pro</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            <Link 
              to="/" 
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link 
              to="/events" 
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Events</span>
            </Link>
            <Link 
              to="/groups" 
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Groups</span>
            </Link>
            <Link 
              to="/scorecard" 
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="font-medium">Scorecard</span>
            </Link>
            <Link 
              to="/stats" 
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">Stats</span>
            </Link>
            
            {showOrganizerLinks && (
              <Link 
                to="/organizer" 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all group"
              >
                <UserCog className="w-4 h-4" />
                <span className="font-medium">Organizer</span>
              </Link>
            )}
            
            {showHeadOrganizerLinks && (
              <Link 
                to="/head-organizer" 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Head Org</span>
              </Link>
            )}
            
            {showAdminLinks && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
              >
                <Shield className="w-4 h-4" />
                <span className="font-medium">Admin</span>
              </Link>
            )}

            <Link 
              to="/notifications" 
              className="relative p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all ml-2"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-bounce-subtle">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            <div className="hidden md:block h-8 w-px bg-gray-300 dark:bg-slate-600"></div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300 group"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 rotate-0 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <Moon className="w-5 h-5 rotate-0 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            <select
              value={user.role}
              onChange={handleRoleSwitch}
              className="text-sm border-2 border-primary-200 dark:border-primary-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-all focus:ring-2 focus:ring-primary-500 outline-none font-medium"
              title="Switch Role (Demo)"
            >
              <option value="player">👤 Player</option>
              <option value="organizer">⚙️ Organizer</option>
              <option value="head_organizer">🎯 Head Organizer</option>
              <option value="admin">👑 Admin</option>
            </select>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - simplified for demo */}
      <div className="lg:hidden border-t border-white/20 dark:border-slate-700/30">
        <div className="px-4 py-3 space-y-1">
          <Link to="/" className="flex items-center space-x-2 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg px-3 transition-all">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link to="/events" className="flex items-center space-x-2 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg px-3 transition-all">
            <Calendar className="w-4 h-4" />
            <span>Events</span>
          </Link>
          <Link to="/groups" className="flex items-center space-x-2 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg px-3 transition-all">
            <Users className="w-4 h-4" />
            <span>Groups</span>
          </Link>
          <Link to="/scorecard" className="flex items-center space-x-2 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg px-3 transition-all">
            <ClipboardList className="w-4 h-4" />
            <span>Scorecard</span>
          </Link>
          <Link to="/stats" className="flex items-center space-x-2 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg px-3 transition-all">
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

