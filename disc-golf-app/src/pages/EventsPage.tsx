import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  Calendar, 
  Target, 
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  X,
  Disc3,
  MapPin
} from 'lucide-react';
import * as api from '../utils/api';
import { getEventImage } from '../utils/eventImages';
import { SkeletonEventCard, SkeletonText } from '../components/Skeleton';

const EventsPage = () => {
  const { events, loading, error, refreshEvents } = useData();
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [eventHoles, setEventHoles] = useState<Record<number, api.EventHoleStats[]>>({});
  const [loadingHoles, setLoadingHoles] = useState(false);
  
  // Create Event Modal State
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [selectedLayoutId, setSelectedLayoutId] = useState<number>(1);
  const [layouts, setLayouts] = useState<api.Layout[]>([]);
  const [loadingLayouts, setLoadingLayouts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [generateMockData, setGenerateMockData] = useState(false);

  // Fetch layouts when modal opens
  useEffect(() => {
    if (showCreateEventModal && layouts.length === 0) {
      setLoadingLayouts(true);
      api.getLayouts()
        .then((data) => {
          setLayouts(data);
          if (data.length > 0) {
            setSelectedLayoutId(data[0].LayoutID);
          }
        })
        .catch((err) => {
          console.error('Failed to load layouts:', err);
        })
        .finally(() => {
          setLoadingLayouts(false);
        });
    }
  }, [showCreateEventModal, layouts.length]);

  const handleCreateEvent = async () => {
    if (!newEventName.trim()) return;
    
    setCreating(true);
    setCreateError(null);
    try {
      const result = await api.createEvent({
        name: newEventName.trim(),
        layoutId: selectedLayoutId
      });
      
      // Generate mock data if checkbox is checked
      if (generateMockData && result.NewEventID) {
        try {
          await api.generateMockData(result.NewEventID);
        } catch (mockErr) {
          console.error('Failed to generate mock data:', mockErr);
          // Don't fail the whole operation, just log the error
        }
      }
      
      await refreshEvents();
      setShowCreateEventModal(false);
      setNewEventName('');
      setSelectedLayoutId(layouts.length > 0 ? layouts[0].LayoutID : 1);
      setGenerateMockData(false);
    } catch (err) {
      console.error('Failed to create event:', err);
      setCreateError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

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
                        {hole.AvgScore != null && (
                          <div className="flex justify-between">
                            <span>Avg Score</span>
                            <span className="font-medium">{hole.AvgScore.toFixed(1)}</span>
                          </div>
                        )}
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
      {/* Header with Create Event Button */}
      <div className="flex items-center justify-between animate-slide-up-fade stagger-1">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Browse putting league events and see course details</p>
        </div>
        <button
          onClick={() => setShowCreateEventModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
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

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-primary-500/5 to-secondary-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-lg">
                    <Disc3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Event</h2>
                </div>
                <button
                  onClick={() => {
                    setShowCreateEventModal(false);
                    setNewEventName('');
                    setSelectedLayoutId(layouts.length > 0 ? layouts[0].LayoutID : 1);
                    setCreateError(null);
                    setGenerateMockData(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="eventName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Event Name
                </label>
                <input
                  id="eventName"
                  type="text"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="e.g., Weekly Putting League 12/15"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 
                           bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100
                           focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all
                           placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creating && newEventName.trim()) {
                      handleCreateEvent();
                    }
                  }}
                />
              </div>

              <div>
                <label htmlFor="layoutId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Course Layout</span>
                  </div>
                </label>
                {loadingLayouts ? (
                  <div className="flex items-center gap-2 py-3 text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading layouts...</span>
                  </div>
                ) : layouts.length > 0 ? (
                  <select
                    id="layoutId"
                    value={selectedLayoutId}
                    onChange={(e) => setSelectedLayoutId(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 
                             bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100
                             focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all
                             cursor-pointer"
                  >
                    {layouts.map((layout) => (
                      <option key={layout.LayoutID} value={layout.LayoutID}>
                        Layout {layout.LayoutID} — {layout.HoleCount} holes ({layout.TotalDistance} ft total)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    No layouts available
                  </p>
                )}
              </div>

              {/* Generate Mock Data Checkbox */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <input
                  type="checkbox"
                  id="generateMockData"
                  checked={generateMockData}
                  onChange={(e) => setGenerateMockData(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-amber-300 dark:border-amber-600 
                           text-amber-500 focus:ring-amber-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="generateMockData" className="flex-1 cursor-pointer">
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">Generate Mock Data</span>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Auto-generate sample scorecards and scores for testing
                  </p>
                </label>
              </div>

              {createError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateEventModal(false);
                    setNewEventName('');
                    setSelectedLayoutId(layouts.length > 0 ? layouts[0].LayoutID : 1);
                    setCreateError(null);
                    setGenerateMockData(false);
                  }}
                  disabled={creating}
                  className="flex-1 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 
                           bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600
                           hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!newEventName.trim() || creating}
                  className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 
                           bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-lg
                           hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create Event</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
