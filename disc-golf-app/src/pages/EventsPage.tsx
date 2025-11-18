import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import EventCard from '../components/EventCard';
import { Event } from '../data/types';
import { Plus, Filter, Calendar, MapPin, Clock, Users, Target, X } from 'lucide-react';

const EventsPage = () => {
  const { user } = useAuth();
  const { events, updateEvent } = useData();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  if (!user) return null;

  const filteredEvents = events
    .filter(e => e.requestStatus === 'approved')
    .filter(e => {
      if (filter === 'all') return true;
      return e.status === filter;
    });

  const handleSignUp = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event && !event.participants.includes(user.id)) {
      updateEvent(eventId, {
        participants: [...event.participants, user.id],
      });
    }
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Disc Golf Events</h1>
          <p className="text-gray-600 mt-2">Discover and join amazing disc golf events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Request Event</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">Filter Events</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-primary text-white shadow-glow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Events ({events.filter(e => e.requestStatus === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              filter === 'upcoming'
                ? 'bg-gradient-primary text-white shadow-glow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming ({events.filter(e => e.requestStatus === 'approved' && e.status === 'upcoming').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              filter === 'completed'
                ? 'bg-gradient-primary text-white shadow-glow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({events.filter(e => e.requestStatus === 'approved' && e.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onViewDetails={() => handleViewDetails(event)}
            onSignUp={() => handleSignUp(event.id)}
            isRegistered={event.participants.includes(user.id)}
          />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="card p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No events found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="relative">
              {/* Header Image */}
              {selectedEvent.imageUrl ? (
                <div className="relative h-64 overflow-hidden rounded-t-2xl">
                  <img
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-primary rounded-t-2xl flex items-center justify-center">
                  <Target className="w-20 h-20 text-white/30" />
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedEvent.name}</h2>
                
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-xl">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs text-primary-600 font-medium">Location</div>
                      <div className="text-sm font-bold text-gray-900">{selectedEvent.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-xl">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <div className="text-xs text-secondary-600 font-medium">Date & Time</div>
                      <div className="text-sm font-bold text-gray-900">
                        {new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedEvent.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-accent-50 rounded-xl">
                    <div className="p-2 bg-accent-100 rounded-lg">
                      <Target className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <div className="text-xs text-accent-600 font-medium">Holes</div>
                      <div className="text-sm font-bold text-gray-900">{selectedEvent.numberOfHoles} holes</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-orange-600 font-medium">Participants</div>
                      <div className="text-sm font-bold text-gray-900">{selectedEvent.participants.length} registered</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                </div>

                {/* Action Buttons */}
                {!selectedEvent.participants.includes(user.id) &&
                  selectedEvent.status === 'upcoming' && (
                    <button
                      onClick={() => {
                        handleSignUp(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                      className="w-full btn-primary"
                    >
                      Sign Up for Event
                    </button>
                  )}

                {selectedEvent.participants.includes(user.id) && (
                  <div className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-center font-bold shadow-glow-green flex items-center justify-center space-x-2">
                    <span>✓</span>
                    <span>You're Registered</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Request Modal */}
      {showCreateModal && (
        <EventCreateModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

const EventCreateModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const { addEvent } = useData();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    time: '',
    numberOfHoles: 18,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newEvent: Event = {
      id: `event-${Date.now()}`,
      ...formData,
      imageUrl: '',
      organizers: [],
      headOrganizers: [],
      participants: [],
      status: 'upcoming',
      createdBy: user.id,
      requestStatus: 'pending',
    };

    addEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold gradient-text">Request New Event</h2>
              <p className="text-gray-600 mt-1">Fill in the details for your event request</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input-modern"
                placeholder="e.g., Summer Championship 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="input-modern"
                placeholder="Describe your event..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="input-modern pl-12"
                  placeholder="Event location"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="input-modern pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Clock className="w-5 h-5" />
                  </div>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="input-modern pl-12"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Holes *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Target className="w-5 h-5" />
                </div>
                <select
                  value={formData.numberOfHoles}
                  onChange={e =>
                    setFormData({ ...formData, numberOfHoles: parseInt(e.target.value) })
                  }
                  className="input-modern pl-12"
                >
                  <option value={9}>9 holes</option>
                  <option value={18}>18 holes</option>
                  <option value={27}>27 holes</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;


