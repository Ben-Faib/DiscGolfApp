import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, 
  Calendar, 
  ClipboardList, 
  BarChart3, 
  Disc3,
  Sun,
  Moon
} from 'lucide-react';

const Navbar = () => {
  const { player } = useData();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => 
    `flex items-center space-x-2 px-4 py-2 rounded-xl transition-all group ${
      isActive(path)
        ? 'bg-gradient-primary text-white shadow-glow'
        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
    }`;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-slate-700/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-glow group-hover:scale-110 transition-all duration-300">
              <Disc3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text-teal">Putting League</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/" className={navLinkClass('/')}>
              <Home className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/events" className={navLinkClass('/events')}>
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Events</span>
            </Link>
            <Link to="/scorecard" className={navLinkClass('/scorecard')}>
              <ClipboardList className="w-4 h-4" />
              <span className="font-medium">Scorecard</span>
            </Link>
            <Link to="/stats" className={navLinkClass('/stats')}>
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">Leaderboard</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Player Info */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {player.FirstName} {player.LastName}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                {player.SkillDivision}
              </span>
            </div>

            <div className="hidden md:block h-8 w-px bg-gray-300 dark:bg-slate-600"></div>

            {/* Theme Toggle */}
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
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden border-t border-white/20 dark:border-slate-700/30">
        <div className="px-4 py-3 flex justify-around">
          <Link to="/" className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
            isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
          }`}>
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/events" className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
            isActive('/events') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
          }`}>
            <Calendar className="w-5 h-5" />
            <span className="text-xs mt-1">Events</span>
          </Link>
          <Link to="/scorecard" className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
            isActive('/scorecard') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
          }`}>
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs mt-1">Score</span>
          </Link>
          <Link to="/stats" className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
            isActive('/stats') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
          }`}>
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs mt-1">Stats</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
