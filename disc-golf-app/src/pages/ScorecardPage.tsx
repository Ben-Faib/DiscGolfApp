import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Scorecard, Event, Group, getEventById, getGroupById, getUserById } from '../data';
import { ChevronLeft, ChevronRight, Plus, Users as UsersIcon } from 'lucide-react';
import Toast from '../components/Toast';

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Scorecards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Enter and manage your scores</p>
        </div>
        {myEvents.length > 0 && (
          <button
            onClick={() => setShowNewScorecard(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Scorecard</span>
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div className="glass-card p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('active')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              view === 'active'
                ? 'bg-gradient-primary text-white shadow-glow'
                : 'glass text-gray-700 dark:text-gray-300 hover:scale-105'
            }`}
          >
            Active ({activeScorecards.length})
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              view === 'history'
                ? 'bg-gradient-primary text-white shadow-glow'
                : 'glass text-gray-700 dark:text-gray-300 hover:scale-105'
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
            <div className="glass-card p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No active scorecards</p>
              {myEvents.length > 0 && (
                <button
                  onClick={() => setShowNewScorecard(true)}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
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
            <div className="glass-card p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No scorecard history</p>
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

const ScorecardCard = ({ scorecard, event, group, onClick }: ScorecardCardProps) => {
  const statusConfig: Record<Scorecard['status'], { bg: string; text: string }> = {
    draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300' },
    submitted: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
    approved: { bg: 'bg-secondary-100 dark:bg-secondary-900/30', text: 'text-secondary-800 dark:text-secondary-300' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
  };

  const completedHoles = scorecard.scores.filter(score => score > 0).length;
  const totalHoles = scorecard.scores.length;

  return (
    <div
      onClick={onClick}
      className="card-interactive p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{event?.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
            <UsersIcon className="w-4 h-4" />
            <span>{group?.name}</span>
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[scorecard.status].bg} ${statusConfig[scorecard.status].text} border border-current/20`}>
          {scorecard.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 glass rounded-xl">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Score</div>
          <div className="score-display">{scorecard.totalScore}</div>
        </div>
        <div className="text-center p-3 glass rounded-xl">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Progress</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {completedHoles}/{totalHoles}
          </div>
        </div>
        <div className="text-center p-3 glass rounded-xl">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg/Hole</div>
          <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
            {completedHoles > 0 ? (scorecard.totalScore / completedHoles).toFixed(1) : '0.0'}
          </div>
        </div>
      </div>

      {scorecard.status === 'rejected' && scorecard.notes && (
        <div className="mt-4 p-3 glass border-2 border-red-500/30 rounded-xl">
          <p className="text-sm text-red-800 dark:text-red-300">
            <span className="font-semibold">Rejection reason:</span> {scorecard.notes}
          </p>
        </div>
      )}
    </div>
  );
};

interface ScorecardEditorProps {
  scorecard: Scorecard;
  onClose: () => void;
  onUpdate: (updates: Partial<Scorecard>) => void;
}

const ScorecardEditor = ({ scorecard, onClose, onUpdate }: ScorecardEditorProps) => {
  const { scorecards } = useData();
  const [currentHole, setCurrentHole] = useState(0);
  const [scores, setScores] = useState<number[]>([...scorecard.scores]);
  const [showToast, setShowToast] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const previousHoleRef = useRef<number>(0);
  
  const event = getEventById(scorecard.eventId);
  const group = getGroupById(scorecard.groupId);
  
  // Get all scorecards for this group at this event
  const groupScorecards = group 
    ? scorecards.filter(s => s.groupId === group.id && s.eventId === scorecard.eventId)
    : [];
  
  // Par for each hole (default 3 for all holes)
  const pars = Array(scorecard.scores.length).fill(3);
  
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const canSubmit = scorecard.status === 'draft' && scores.every(s => s > 0);
  const canEdit = scorecard.status === 'draft' || scorecard.status === 'rejected';

  // Debounced auto-save
  const handleScoreChange = (holeIndex: number, value: string, userId: string) => {
    if (userId !== scorecard.userId) return; // Only allow editing own scores
    
    const numValue = Math.max(1, Math.min(15, parseInt(value) || 0));
    const newScores = [...scores];
    newScores[holeIndex] = numValue;
    setScores(newScores);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      const newTotal = newScores.reduce((sum, score) => sum + score, 0);
      onUpdate({
        scores: newScores,
        totalScore: newTotal,
      });
    }, 1500);
  };

  // Handle hole change (show toast on navigation)
  const handleHoleChange = (holeIndex: number) => {
    if (previousHoleRef.current !== holeIndex && canEdit) {
      setShowToast(true);
    }
    previousHoleRef.current = holeIndex;
    setCurrentHole(holeIndex);
  };

  const handleSave = (submit: boolean = false) => {
    onUpdate({
      scores,
      totalScore,
      status: submit ? 'submitted' : 'draft',
      submittedAt: submit ? new Date().toISOString() : scorecard.submittedAt,
    });
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollHoles = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-card max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{event?.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center space-x-2">
                <UsersIcon className="w-4 h-4" />
                <span>{group?.name}</span>
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all text-gray-500 dark:text-gray-400"
            >
              ✕
            </button>
          </div>

          {/* Hole Navigation */}
          <div className="mb-6 relative">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => scrollHoles('left')}
                className="p-2 glass rounded-xl hover:scale-110 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div 
                ref={scrollContainerRef}
                className="flex-1 flex space-x-2 overflow-x-auto scrollbar-hide scroll-smooth"
              >
                {scores.map((score, index) => {
                  const isCompleted = score > 0;
                  const isActive = index === currentHole;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleHoleChange(index)}
                      className={`
                        ${isActive ? 'hole-tab-active' : isCompleted ? 'hole-tab-completed' : 'hole-tab-inactive'}
                        shrink-0
                      `}
                    >
                      <div className="text-xs opacity-70">Hole</div>
                      <div className="text-lg font-bold">{index + 1}</div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scrollHoles('right')}
                className="p-2 glass rounded-xl hover:scale-110 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Current Hole Info */}
          <div className="mb-6 p-4 glass rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Hole {currentHole + 1}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Par {pars[currentHole]}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Score</div>
                <div className="score-display text-2xl">{totalScore}</div>
              </div>
            </div>
          </div>

          {/* Multi-Player Score Entry */}
          <div className="space-y-3 mb-6">
            {groupScorecards.map(playerScorecard => {
              const player = getUserById(playerScorecard.userId);
              const playerScore = playerScorecard.id === scorecard.id 
                ? scores[currentHole]
                : playerScorecard.scores[currentHole];
              const par = pars[currentHole];
              const diff = playerScore - par;
              const isCurrentUser = playerScorecard.userId === scorecard.userId;
              
              let scoreColor = 'text-gray-900 dark:text-gray-100';
              if (playerScore > 0) {
                if (diff < 0) scoreColor = 'text-secondary-600 dark:text-secondary-400'; // Under par
                else if (diff > 0) scoreColor = 'text-red-600 dark:text-red-400'; // Over par
                else scoreColor = 'text-primary-600 dark:text-primary-400'; // Par
              }

              return (
                <div 
                  key={playerScorecard.id}
                  className={`p-4 glass rounded-xl transition-all ${
                    isCurrentUser ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                        {player?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {player?.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">(You)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Total: {playerScorecard.id === scorecard.id 
                            ? totalScore 
                            : playerScorecard.totalScore}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {playerScore > 0 && diff !== 0 && (
                        <div className={`text-sm font-medium ${scoreColor}`}>
                          {diff > 0 ? '+' : ''}{diff}
                        </div>
                      )}
                      
                      {isCurrentUser && canEdit ? (
                        <input
                          type="number"
                          min="1"
                          max="15"
                          value={playerScore || ''}
                          onChange={(e) => handleScoreChange(currentHole, e.target.value, playerScorecard.userId)}
                          className={`w-20 px-4 py-3 text-center text-xl font-bold glass rounded-xl focus:ring-2 focus:ring-primary-500 outline-none ${scoreColor}`}
                          placeholder="-"
                        />
                      ) : (
                        <div className={`w-20 px-4 py-3 text-center text-xl font-bold glass rounded-xl ${scoreColor}`}>
                          {playerScore || '-'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {scorecard.status === 'rejected' && scorecard.notes && (
            <div className="mb-6 p-4 glass border-2 border-red-500/30 rounded-xl">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Rejection Reason:</h3>
              <p className="text-red-700 dark:text-red-400">{scorecard.notes}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => handleHoleChange(Math.max(0, currentHole - 1))}
              disabled={currentHole === 0}
              className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hole {currentHole + 1} of {scores.length}
            </div>
            
            <button
              onClick={() => handleHoleChange(Math.min(scores.length - 1, currentHole + 1))}
              disabled={currentHole === scores.length - 1}
              className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-ghost"
            >
              Close
            </button>
            {canEdit && (
              <>
                <button
                  onClick={() => handleSave(false)}
                  className="flex-1 btn-secondary"
                >
                  Save Draft
                </button>
                {canSubmit && (
                  <button
                    onClick={() => handleSave(true)}
                    className="flex-1 btn-primary"
                  >
                    Submit for Review
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <Toast 
          message="Scores saved ✓" 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
};

interface NewScorecardModalProps {
  events: Event[];
  groups: Group[];
  userId: string;
  onClose: () => void;
  onCreate: (scorecard: Scorecard) => void;
}

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-card max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">New Scorecard</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all text-gray-500 dark:text-gray-400"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Event *
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="input-glass"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Group *
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                disabled={!eventId}
                className="input-glass disabled:opacity-50"
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
              <div className="p-4 glass rounded-xl">
                <p className="text-sm text-primary-800 dark:text-primary-300">
                  You'll be creating a scorecard for {selectedEvent.numberOfHoles} holes
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!eventId || !groupId}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
