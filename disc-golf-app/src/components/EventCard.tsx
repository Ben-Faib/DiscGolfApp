import { Event } from '../data/types';
import { MapPin, Calendar, Target, Users, Eye, CheckCircle2, Sparkles } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onViewDetails?: () => void;
  onSignUp?: () => void;
  isRegistered?: boolean;
}

const EventCard = ({ event, onViewDetails, onSignUp, isRegistered }: EventCardProps) => {
  const statusConfig = {
    upcoming: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: Sparkles,
    },
    ongoing: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: Target,
    },
    completed: {
      gradient: 'from-gray-500 to-slate-500',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      icon: CheckCircle2,
    },
  };

  const config = statusConfig[event.status];
  const StatusIcon = config.icon;

  return (
    <div className="group card overflow-hidden hover:scale-[1.02] animate-fade-in">
      {/* Status Badge - Floating */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`flex items-center space-x-1 ${config.bg} ${config.text} px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm`}>
          <StatusIcon className="w-3 h-3" />
          <span className="capitalize">{event.status}</span>
        </div>
      </div>

      {/* Image Section */}
      {event.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      ) : (
        <div className={`relative h-48 bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
          <Target className="w-16 h-16 text-white/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      )}
      
      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
          {event.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="p-1.5 bg-primary-50 rounded-lg">
              <MapPin className="w-4 h-4 text-primary-600" />
            </div>
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="p-1.5 bg-secondary-50 rounded-lg">
              <Calendar className="w-4 h-4 text-secondary-600" />
            </div>
            <span className="truncate">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="p-1.5 bg-accent-50 rounded-lg">
              <Target className="w-4 h-4 text-accent-600" />
            </div>
            <span>{event.numberOfHoles} holes</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="p-1.5 bg-orange-50 rounded-lg">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <span>{event.participants.length} players</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 border-2 border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all hover:border-primary-400 font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Details</span>
            </button>
          )}
          {onSignUp && !isRegistered && event.status === 'upcoming' && (
            <button
              onClick={onSignUp}
              className="flex-1 px-4 py-2.5 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all font-medium hover:scale-105"
            >
              Sign Up
            </button>
          )}
          {isRegistered && (
            <div className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-glow-green">
              <CheckCircle2 className="w-4 h-4" />
              <span>Registered</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;

