import { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Calendar, 
  Target, 
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import * as api from '../utils/api';
import { getEventImage } from '../utils/eventImages';
import { SkeletonEventCard, SkeletonText } from '../components/Skeleton';

const EventsPage = () => {
  const { events, loading, error } = useData();
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [eventHoles, setEventHoles] = useState<Record<number, api.EventHoleStats[]>>({});
  const [loadingHoles, setLoadingHoles] = useState(false);

  const toggleEventDetails = async (eventId: number) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
      
      // Load hole stats if not already loaded
      if (!eventHoles[eventId]) {
        setLoadingHoles(true);
        try {
          const holes = await api.getEventHoles(eventId);
          setEventHoles(prev => ({ ...prev, [eventId]: holes }));
        } catch (err) {
          console.error('Failed to load hole stats:', err);
        } finally {
          setLoadingHoles(false);
        }
      }
    }
  };

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.EventDate) >= now);
  const pastEvents = events.filter(e => new Date(e.EventDate) < now);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="animate-slide-up-fade stagger-1">
          <SkeletonText className="w-32 h-8 mb-2" />
          <SkeletonText className="w-64" />
        </div>
        
        {/* Section Header Skeleton */}
        <div className="animate-slide-up-fade stagger-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-lg animate-shimmer" />
            <SkeletonText className="w-48 h-6" />
          </div>
        </div>
        
        {/* Event Cards Skeleton */}
        <div className="space-y-4">
          <SkeletonEventCard className="animate-slide-up-fade stagger-3" />
          <SkeletonEventCard className="animate-slide-up-fade stagger-4" />
          <SkeletonEventCard className="animate-slide-up-fade stagger-5" />
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

  const getDifficultyColor = (rating: string) => {
    switch (rating) {
      case 'Hard':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'Medium':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'Easy':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const EventCard = ({ event, isPast = false }: { event: api.Event; isPast?: boolean }) => {
    const isExpanded = expandedEvent === event.EventID;
    const holes = eventHoles[event.EventID] || [];
    const eventImage = getEventImage(event.EventID);

    return (
      <div className={`card overflow-hidden ${isPast ? 'opacity-75' : ''}`}>
        {/* Hero Image Section */}
        <div className="relative h-32 sm:h-40 overflow-hidden">
          <img 
            src={eventImage} 
            alt={event.Name}
            className={`w-full h-full object-cover ${isPast ? 'grayscale-[50%]' : ''} group-hover:scale-105 transition-transform duration-500`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {isPast ? (
              <span className="text-xs bg-gray-800/80 backdrop-blur-sm text-gray-200 px-3 py-1.5 rounded-full font-medium">
                Completed
              </span>
            ) : (
              <span className="text-xs bg-primary-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-medium shadow-lg">
                Upcoming
              </span>
            )}
          </div>
          
          {/* Event Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">{event.Name}</h3>
          </div>
        </div>
        
        {/* Info Section */}
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
          onClick={() => toggleEventDetails(event.EventID)}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-primary-500" />
                <span>{new Date(event.EventDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-secondary-500" />
                <span>{event.HoleCount} holes</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400 font-medium">
              <span>{isExpanded ? 'Hide details' : 'View details'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded hole details */}
        {isExpanded && (
          <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
            {loadingHoles ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading hole details...</p>
              </div>
            ) : holes.length > 0 ? (
              <div className="p-6">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Hole Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {holes.map(hole => (
                    <div key={hole.HoleNumber} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-gray-900 dark:text-gray-100">Hole {hole.HoleNumber}</div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(hole.DifficultyRating)}`}>
                          {hole.DifficultyRating}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Distance</span>
                          <span className="font-medium">{hole.DistanceFeet} ft</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Score</span>
                          <span className="font-medium">{hole.AvgScore?.toFixed(1) || 'N/A'}</span>
                        </div>
                        {hole.BasketBrand && (
                          <div className="flex justify-between">
                            <span>Basket</span>
                            <span className="font-medium">{hole.BasketBrand} {hole.BasketModel}</span>
                          </div>
                        )}
                        {hole.ObstacleDescription && (
                          <div className="text-xs mt-2 text-gray-500 dark:text-gray-500">
                            Obstacle: {hole.ObstacleDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No hole statistics available yet
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="animate-slide-up-fade stagger-1">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Events</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Browse putting league events and see course details</p>
      </div>

      {/* Upcoming Events */}
      <div className="animate-slide-up-fade stagger-2">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Upcoming Events ({upcomingEvents.length})
          </h2>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div 
                key={event.EventID} 
                className={`animate-slide-up-fade stagger-${Math.min(index + 3, 6)}`}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No upcoming events</p>
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="animate-slide-up-fade stagger-5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Past Events ({pastEvents.length})
            </h2>
          </div>
          
          <div className="space-y-4">
            {pastEvents.map((event, index) => (
              <div 
                key={event.EventID} 
                className={`animate-slide-up-fade stagger-${Math.min(index + 6, 6)}`}
              >
                <EventCard event={event} isPast />
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="glass-card p-12 text-center animate-slide-up-fade stagger-3">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No events found</p>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
