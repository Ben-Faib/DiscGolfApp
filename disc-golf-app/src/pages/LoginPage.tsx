import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data';
import { Mail, Lock, LogIn, Disc3, Sparkles, Crown, UserCog, Shield } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'head_organizer': return <Crown className="w-4 h-4" />;
      case 'organizer': return <UserCog className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-purple-500 to-pink-500';
      case 'head_organizer': return 'from-red-500 to-orange-500';
      case 'organizer': return 'from-orange-400 to-yellow-400';
      default: return 'from-primary-500 to-primary-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="card-glass max-w-md w-full p-8 relative z-10 animate-scale-in">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl shadow-glow mb-4 animate-bounce-subtle">
            <Disc3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text-teal mb-2">Disc Golf Pro</h1>
          <p className="text-gray-600 dark:text-gray-400">Elevate your disc golf experience</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern pl-12"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern pl-12"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl text-sm font-medium flex items-center space-x-2 animate-slide-down">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </button>
        </form>

        {/* Quick Login Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300 dark:to-slate-600"></div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Quick Demo Login</p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300 dark:to-slate-600"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {mockUsers.slice(0, 4).map((user) => (
              <button
                key={user.id}
                onClick={() => quickLogin(user.email)}
                className="group relative overflow-hidden bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 rounded-xl p-3 transition-all hover:scale-105 hover:shadow-lg"
              >
                <div className={`absolute top-0 right-0 w-8 h-8 bg-gradient-to-br ${getRoleColor(user.role)} opacity-20 rounded-bl-xl`}></div>
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`p-1 bg-gradient-to-r ${getRoleColor(user.role)} text-white rounded`}>
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{user.name}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role.replace('_', ' ')}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl border border-primary-200 dark:border-primary-800">
            <p className="text-xs text-primary-700 dark:text-primary-300 text-center font-medium">
              💡 Click any user to quick login • Any password works for demo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

