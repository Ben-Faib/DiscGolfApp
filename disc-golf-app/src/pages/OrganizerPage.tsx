import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getUserById, getEventById, getGroupById } from '../data';

const OrganizerPage = () => {
  const { user } = useAuth();
  const { events, scorecards, updateScorecard } = useData();
  const [selectedScorecard, setSelectedScorecard] = useState<any>(null);

  if (!user) return null;

  // Get events where user is organizer or head organizer
  const myEvents = events.filter(
    e =>
      e.organizers.includes(user.id) ||
      e.headOrganizers.includes(user.id) ||
      user.role === 'admin'
  );

  // Get pending scorecards for my events
  const pendingScorecards = scorecards.filter(
    s => s.status === 'submitted' && myEvents.some(e => e.id === s.eventId)
  );

  const handleReview = (scorecardId: string, status: 'approved' | 'rejected', notes?: string) => {
    updateScorecard(scorecardId, {
      status,
      reviewedBy: user.id,
      notes,
    });
    setSelectedScorecard(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Organizer Panel</h1>
        <p className="text-gray-600 mt-1">Manage events and review scorecards</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-gray-800">{myEvents.length}</div>
          <div className="text-sm text-gray-600">My Events</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold text-orange-600">{pendingScorecards.length}</div>
          <div className="text-sm text-gray-600">Pending Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-600">
            {scorecards.filter(s => s.status === 'approved' && s.reviewedBy === user.id).length}
          </div>
          <div className="text-sm text-gray-600">Approved by Me</div>
        </div>
      </div>

      {/* Pending Scorecards */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Pending Scorecard Reviews ({pendingScorecards.length})
          </h2>
        </div>
        <div className="p-6">
          {pendingScorecards.length > 0 ? (
            <div className="space-y-4">
              {pendingScorecards.map(scorecard => {
                const player = getUserById(scorecard.userId);
                const event = getEventById(scorecard.eventId);
                const group = getGroupById(scorecard.groupId);

                return (
                  <div
                    key={scorecard.id}
                    className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedScorecard(scorecard)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{player?.name}</h3>
                        <p className="text-sm text-gray-600">{event?.name}</p>
                        <p className="text-xs text-gray-500">{group?.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{scorecard.totalScore}</div>
                        <div className="text-xs text-gray-500">
                          {scorecard.scores.length} holes
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Submitted {new Date(scorecard.submittedAt || '').toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No pending scorecard reviews</p>
          )}
        </div>
      </div>

      {/* My Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">My Events</h2>
        </div>
        <div className="p-6">
          {myEvents.length > 0 ? (
            <div className="space-y-4">
              {myEvents.map(event => (
                <div key={event.id} className="border-l-4 border-orange-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800">{event.name}</h3>
                  <p className="text-sm text-gray-600">{event.location}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>👥 {event.participants.length} participants</span>
                    <span className="capitalize">Status: {event.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No events assigned</p>
          )}
        </div>
      </div>

      {/* Scorecard Review Modal */}
      {selectedScorecard && (
        <ScorecardReviewModal
          scorecard={selectedScorecard}
          onClose={() => setSelectedScorecard(null)}
          onReview={handleReview}
        />
      )}
    </div>
  );
};

const ScorecardReviewModal = ({ scorecard, onClose, onReview }: any) => {
  const [notes, setNotes] = useState('');
  const [rejectMode, setRejectMode] = useState(false);

  const player = getUserById(scorecard.userId);
  const event = getEventById(scorecard.eventId);
  const group = getGroupById(scorecard.groupId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Review Scorecard</h2>
              <p className="text-gray-600 mt-1">
                {player?.name} - {event?.name}
              </p>
              <p className="text-sm text-gray-500">Group: {group?.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Score Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Scores</h3>
              <div className="text-2xl font-bold text-blue-600">
                Total: {scorecard.totalScore}
              </div>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {scorecard.scores.map((score: number, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-600 mb-1">H{index + 1}</div>
                  <div className="px-3 py-2 bg-gray-100 rounded font-bold">{score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-xs text-gray-600">Total Score</div>
              <div className="text-lg font-bold text-blue-600">{scorecard.totalScore}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Holes</div>
              <div className="text-lg font-bold text-purple-600">{scorecard.scores.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Avg/Hole</div>
              <div className="text-lg font-bold text-green-600">
                {(scorecard.totalScore / scorecard.scores.length).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Review Actions */}
          {!rejectMode ? (
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setRejectMode(true)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Reject
              </button>
              <button
                onClick={() => onReview(scorecard.id, 'approved')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Approve
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Explain why this scorecard is being rejected..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setRejectMode(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (notes.trim()) {
                      onReview(scorecard.id, 'rejected', notes.trim());
                    }
                  }}
                  disabled={!notes.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerPage;

