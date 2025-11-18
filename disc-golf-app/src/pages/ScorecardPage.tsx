import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Scorecard, Event, Group, getEventById, getGroupById } from '../data';

const ScorecardPage = () => {
  const { user } = useAuth();
  const { scorecards, events, groups, addScorecard, updateScorecard } = useData();
  const [view, setView] = useState<'active' | 'history'>('active');
  const [selectedScorecard, setSelectedScorecard] = useState<Scorecard | null>(null);
  const [showNewScorecard, setShowNewScorecard] = useState(false);

  if (!user) return null;

  const myScorecards = scorecards.filter(s => s.userId === user.id);
  const activeScorecards = myScorecards.filter(s => s.status === 'draft' || s.status === 'submitted');
  const historyScorecards = myScorecards.filter(s => s.status === 'approved' || s.status === 'rejected');

  // Get my events for creating new scorecards
  const myEvents = events.filter(e => e.participants.includes(user.id) && e.status === 'upcoming');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Scorecards</h1>
          <p className="text-gray-600 mt-1">Enter and manage your scores</p>
        </div>
        {myEvents.length > 0 && (
          <button
            onClick={() => setShowNewScorecard(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Scorecard
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 rounded transition ${
              view === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({activeScorecards.length})
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded transition ${
              view === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            History ({historyScorecards.length})
          </button>
        </div>
      </div>

      {/* Active Scorecards */}
      {view === 'active' && (
        <div className="space-y-4">
          {activeScorecards.map(scorecard => {
            const event = getEventById(scorecard.eventId);
            const group = getGroupById(scorecard.groupId);
            return (
              <ScorecardCard
                key={scorecard.id}
                scorecard={scorecard}
                event={event}
                group={group}
                onClick={() => setSelectedScorecard(scorecard)}
              />
            );
          })}
          {activeScorecards.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">No active scorecards</p>
              {myEvents.length > 0 && (
                <button
                  onClick={() => setShowNewScorecard(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Create a new scorecard
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* History Scorecards */}
      {view === 'history' && (
        <div className="space-y-4">
          {historyScorecards.map(scorecard => {
            const event = getEventById(scorecard.eventId);
            const group = getGroupById(scorecard.groupId);
            return (
              <ScorecardCard
                key={scorecard.id}
                scorecard={scorecard}
                event={event}
                group={group}
                onClick={() => setSelectedScorecard(scorecard)}
              />
            );
          })}
          {historyScorecards.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">No scorecard history</p>
            </div>
          )}
        </div>
      )}

      {/* Scorecard Editor Modal */}
      {selectedScorecard && (
        <ScorecardEditor
          scorecard={selectedScorecard}
          onClose={() => setSelectedScorecard(null)}
          onUpdate={(updates: Partial<Scorecard>) => {
            updateScorecard(selectedScorecard.id, updates);
            setSelectedScorecard(null);
          }}
        />
      )}

      {/* New Scorecard Modal */}
      {showNewScorecard && (
        <NewScorecardModal
          events={myEvents}
          groups={groups.filter(g => g.members.includes(user.id))}
          userId={user.id}
          onClose={() => setShowNewScorecard(false)}
          onCreate={(scorecard: Scorecard) => {
            addScorecard(scorecard);
            setShowNewScorecard(false);
            setSelectedScorecard(scorecard);
          }}
        />
      )}
    </div>
  );
};

interface ScorecardCardProps {
  scorecard: Scorecard;
  event?: Event;
  group?: Group;
  onClick: () => void;
}

interface ScorecardEditorProps {
  scorecard: Scorecard;
  onClose: () => void;
  onUpdate: (updates: Partial<Scorecard>) => void;
}

interface NewScorecardModalProps {
  events: Event[];
  groups: Group[];
  userId: string;
  onClose: () => void;
  onCreate: (scorecard: Scorecard) => void;
}

const ScorecardCard = ({ scorecard, event, group, onClick }: ScorecardCardProps) => {
  const statusColors: Record<Scorecard['status'], string> = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const completedHoles = scorecard.scores.filter(score => score > 0).length;
  const totalHoles = scorecard.scores.length;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{event?.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{group?.name}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${statusColors[scorecard.status]}`}>
          {scorecard.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <div className="text-sm text-gray-600">Total Score</div>
          <div className="text-2xl font-bold text-blue-600">{scorecard.totalScore}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Progress</div>
          <div className="text-2xl font-bold text-purple-600">
            {completedHoles}/{totalHoles}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Avg/Hole</div>
          <div className="text-2xl font-bold text-green-600">
            {completedHoles > 0 ? (scorecard.totalScore / completedHoles).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {scorecard.status === 'rejected' && scorecard.notes && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Rejection reason:</span> {scorecard.notes}
          </p>
        </div>
      )}
    </div>
  );
};

const ScorecardEditor = ({ scorecard, onClose, onUpdate }: ScorecardEditorProps) => {
  const [scores, setScores] = useState<number[]>([...scorecard.scores]);
  const event = getEventById(scorecard.eventId);
  
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const canSubmit = scorecard.status === 'draft' && scores.every(s => s > 0);
  const canEdit = scorecard.status === 'draft' || scorecard.status === 'rejected';

  const handleScoreChange = (holeIndex: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newScores = [...scores];
    newScores[holeIndex] = numValue;
    setScores(newScores);
  };

  const handleSave = (submit: boolean = false) => {
    onUpdate({
      scores,
      totalScore,
      status: submit ? 'submitted' : 'draft',
      submittedAt: submit ? new Date().toISOString() : scorecard.submittedAt,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{event?.name}</h2>
              <p className="text-gray-600 mt-1">Total Score: {totalScore}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Score Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
            {scores.map((score, index) => (
              <div key={index} className="flex flex-col items-center">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Hole {index + 1}
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={score || ''}
                  onChange={(e) => handleScoreChange(index, e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="-"
                />
              </div>
            ))}
          </div>

          {scorecard.status === 'rejected' && scorecard.notes && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Rejection Reason:</h3>
              <p className="text-red-700">{scorecard.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            {canEdit && (
              <>
                <button
                  onClick={() => handleSave(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Save Draft
                </button>
                {canSubmit && (
                  <button
                    onClick={() => handleSave(true)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Submit for Review
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NewScorecardModal = ({ events, groups, userId, onClose, onCreate }: NewScorecardModalProps) => {
  const [eventId, setEventId] = useState('');
  const [groupId, setGroupId] = useState('');

  const selectedEvent = events.find(event => event.id === eventId);
  const availableGroups = groupId ? groups : groups.filter(group => 
    !group.eventId || group.eventId === eventId
  );

  const handleCreate = () => {
    if (!eventId || !groupId) return;
    const event = events.find(evt => evt.id === eventId);
    if (!event) return;
    const newScorecard: Scorecard = {
      id: `scorecard-${Date.now()}`,
      userId,
      eventId,
      groupId,
      scores: Array(event.numberOfHoles).fill(0),
      totalScore: 0,
      status: 'draft',
    };

    onCreate(newScorecard);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">New Scorecard</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Event *
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose an event...</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.numberOfHoles} holes)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Group *
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                disabled={!eventId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Choose a group...</option>
                {availableGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedEvent && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  You'll be creating a scorecard for {selectedEvent.numberOfHoles} holes
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!eventId || !groupId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Scorecard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorecardPage;

