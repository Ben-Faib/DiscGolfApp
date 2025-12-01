import { useState, useEffect, useRef, TouchEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import * as api from '../utils/api';
import { getEventImage } from '../utils/eventImages';
import { 
  ChevronLeft,
  ChevronRight,
  Plus, 
  Check, 
  X,
  Users,
  Trophy,
  Loader2,
  ChevronDown,
  ChevronUp,
  Disc3,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// Player colors for avatars
const PLAYER_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-orange-500 to-red-600',
  'from-purple-500 to-pink-600'
];

const ScorecardPage = () => {
  const { scorecardId } = useParams<{ scorecardId?: string }>();
  const navigate = useNavigate();
  
  const { 
    player, 
    events, 
    players,
    playerScorecards, 
    loading, 
    error,
    createNewScorecard,
    addMembersToScorecard,
    submitHoleScores,
    getScorecard,
    refreshPlayerScorecards
  } = useData();

  // UI State
  const [showNewScorecardModal, setShowNewScorecardModal] = useState(false);
  const activeScorecardId = scorecardId ? parseInt(scorecardId, 10) : null;
  const [activeScorecard, setActiveScorecard] = useState<api.ScorecardDetail | null>(null);
  
  // New Scorecard Form State
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([player.PlayerID]);
  const [creating, setCreating] = useState(false);

  // Hole Navigation State
  const [currentHole, setCurrentHole] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Score Entry State
  const [holeScores, setHoleScores] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  // Scoreboard State
  const [showScoreboard, setShowScoreboard] = useState(false);

  // Edit Mode State (for editing already-scored holes)
  const [isEditingHole, setIsEditingHole] = useState(false);
  const [editedScores, setEditedScores] = useState<Record<number, { scoreId: number; strokes: number }>>({});
  const [updating, setUpdating] = useState(false);

  // Delete Scorecard State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Touch handling for swipe
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load active scorecard details
  useEffect(() => {
    if (activeScorecardId) {
      loadScorecardDetails(activeScorecardId);
    }
  }, [activeScorecardId]);

  // Keyboard navigation for holes
  useEffect(() => {
    if (!activeScorecardId || !activeScorecard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is in an input or editing text
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevHole();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextHole();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScorecardId, activeScorecard, currentHole, isAnimating]);

  const loadScorecardDetails = async (id: number) => {
    const details = await getScorecard(id);
    setActiveScorecard(details);
    if (details) {
      // Find the next hole to score
      const scoredHoles = new Set(details.scores.map(s => s.HoleNumber));
      for (let i = 1; i <= (details.HoleCount || 9); i++) {
        if (!scoredHoles.has(i)) {
          setCurrentHole(i);
          break;
        }
      }
      // Initialize scores for members
      const initialScores: Record<number, number> = {};
      details.members.forEach(m => {
        initialScores[m.PlayerID] = 0;
      });
      setHoleScores(initialScores);
    }
  };

  // Swipe handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - go to next hole
        goToNextHole();
      } else {
        // Swipe right - go to previous hole
        goToPrevHole();
      }
    }
  };

  const goToNextHole = () => {
    if (!activeScorecard || currentHole >= (activeScorecard.HoleCount || 9) || isAnimating) return;
    setSlideDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentHole(prev => prev + 1);
      resetHoleScores();
      setIsAnimating(false);
      setSlideDirection(null);
    }, 200);
  };

  const goToPrevHole = () => {
    if (currentHole <= 1 || isAnimating) return;
    setSlideDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentHole(prev => prev - 1);
      resetHoleScores();
      setIsAnimating(false);
      setSlideDirection(null);
    }, 200);
  };

  const goToHole = (hole: number) => {
    if (isAnimating || hole === currentHole) return;
    setSlideDirection(hole > currentHole ? 'left' : 'right');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentHole(hole);
      resetHoleScores();
      setIsAnimating(false);
      setSlideDirection(null);
    }, 200);
  };

  const resetHoleScores = () => {
    if (!activeScorecard) return;
    const initialScores: Record<number, number> = {};
    activeScorecard.members.forEach(m => {
      initialScores[m.PlayerID] = 0;
    });
    setHoleScores(initialScores);
    // Also exit edit mode when navigating
    setIsEditingHole(false);
    setEditedScores({});
  };

  const handleCreateScorecard = async () => {
    if (!selectedEventId) return;
    
    setCreating(true);
    try {
      const newId = await createNewScorecard(selectedEventId);
      if (newId) {
        await addMembersToScorecard(newId, selectedPlayers);
        setShowNewScorecardModal(false);
        await refreshPlayerScorecards();
        navigate(`/scorecard/${newId}`);
      }
    } catch (err) {
      console.error('Failed to create scorecard:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleScoreChange = (playerId: number, delta: number) => {
    setHoleScores(prev => ({
      ...prev,
      [playerId]: Math.max(0, Math.min(3, (prev[playerId] || 0) + delta))
    }));
  };

  const setScore = (playerId: number, score: number) => {
    setHoleScores(prev => ({
      ...prev,
      [playerId]: Math.max(0, Math.min(3, score))
    }));
  };

  const handleSaveHoleScores = async () => {
    if (!activeScorecard) return;
    
    setSaving(true);
    try {
      const scores: { playerId: number; strokes: number }[] = activeScorecard.members.map(m => ({
        playerId: m.PlayerID,
        strokes: holeScores[m.PlayerID] || 0
      }));
      
      const success = await submitHoleScores(activeScorecard.ScorecardID, currentHole, scores);
      
      if (success) {
        await loadScorecardDetails(activeScorecard.ScorecardID);
        
        // Auto-advance to next hole if not on last
        if (currentHole < (activeScorecard.HoleCount || 9)) {
          setTimeout(() => goToNextHole(), 300);
        }
      }
    } catch (err) {
      console.error('Failed to save scores:', err);
    } finally {
      setSaving(false);
    }
  };

  // Enter edit mode for the current hole
  const enterEditMode = () => {
    if (!activeScorecard) return;
    
    // Initialize editedScores with current scores for this hole
    const scoresForHole: Record<number, { scoreId: number; strokes: number }> = {};
    activeScorecard.members.forEach(member => {
      const existingScore = activeScorecard.scores.find(
        s => s.PlayerID === member.PlayerID && s.HoleNumber === currentHole
      );
      if (existingScore) {
        scoresForHole[member.PlayerID] = {
          scoreId: existingScore.ScoreID,
          strokes: existingScore.Strokes
        };
      }
    });
    setEditedScores(scoresForHole);
    setIsEditingHole(true);
  };

  // Cancel edit mode
  const cancelEditMode = () => {
    setIsEditingHole(false);
    setEditedScores({});
  };

  // Handle score change in edit mode
  const handleEditScoreChange = (playerId: number, newStrokes: number) => {
    setEditedScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        strokes: Math.max(0, Math.min(3, newStrokes))
      }
    }));
  };

  // Save all edited scores
  const handleUpdateHoleScores = async () => {
    if (!activeScorecard) return;
    
    setUpdating(true);
    try {
      // Update each score
      const updatePromises = Object.entries(editedScores).map(([_, scoreData]) =>
        api.updateScore(scoreData.scoreId, scoreData.strokes, player.PlayerID)
      );
      
      await Promise.all(updatePromises);
      
      // Reload scorecard and exit edit mode
      await loadScorecardDetails(activeScorecard.ScorecardID);
      setIsEditingHole(false);
      setEditedScores({});
    } catch (err) {
      console.error('Failed to update scores:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Delete scorecard
  const handleDeleteScorecard = async () => {
    if (!activeScorecard) return;
    
    setDeleting(true);
    try {
      const result = await api.deleteScorecard(activeScorecard.ScorecardID, player.PlayerID);
      if (result.success) {
        setShowDeleteConfirm(false);
        setActiveScorecard(null);
        await refreshPlayerScorecards();
        navigate('/scorecard');
      }
    } catch (err) {
      console.error('Failed to delete scorecard:', err);
      alert('Failed to delete scorecard. Only the creator can delete it.');
    } finally {
      setDeleting(false);
    }
  };

  const togglePlayerSelection = (playerId: number) => {
    if (playerId === player.PlayerID) return;
    
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length < 4) {
        return [...prev, playerId];
      }
      return prev;
    });
  };

  const getPlayerTotalScore = (playerId: number) => {
    if (!activeScorecard) return 0;
    return activeScorecard.scores
      .filter(s => s.PlayerID === playerId)
      .reduce((sum, s) => sum + s.Strokes, 0);
  };

  const isHoleScored = (holeNum: number) => {
    if (!activeScorecard) return false;
    return activeScorecard.scores.some(s => s.HoleNumber === holeNum);
  };

  const getHoleScoresForPlayer = (playerId: number, holeNum: number) => {
    if (!activeScorecard) return null;
    return activeScorecard.scores.find(
      s => s.PlayerID === playerId && s.HoleNumber === holeNum
    );
  };

  // Loading state - for initial data load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading scorecards...</p>
        </div>
      </div>
    );
  }

  // Loading state - for specific scorecard (prevents flash of list on refresh)
  if (activeScorecardId && !activeScorecard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading scorecard...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // ====================================
  // ACTIVE SCORECARD - UDISC STYLE VIEW
  // ====================================
  if (activeScorecardId && activeScorecard) {
    const holeCount = activeScorecard.HoleCount || 9;
    const holesScored = new Set(activeScorecard.scores.map(s => s.HoleNumber)).size;
    const isComplete = holesScored === holeCount * activeScorecard.members.length / activeScorecard.members.length;

    const eventImage = getEventImage(activeScorecard.EventID);
    
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header with Event Image Background */}
        <div className="relative text-white overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={eventImage} 
              alt="" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/85 via-teal-900/80 to-cyan-900/90"></div>
          </div>
          
          {/* Content */}
          <div className="relative p-4 pb-6">
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={() => {
                  setActiveScorecard(null);
                  setCurrentHole(1);
                  navigate('/scorecard');
                }}
                className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-xs text-white/70">
                  {new Date(activeScorecard.EventDate || '').toLocaleDateString()}
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white/70 hover:text-white transition-all"
                  title="Delete Scorecard"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h1 className="text-xl font-bold text-center mb-1 drop-shadow-lg">{activeScorecard.EventName}</h1>
            <p className="text-center text-white/80 text-sm">{holeCount} Holes • {activeScorecard.members.length} Players</p>
            
            {/* Progress Dots */}
            <div className="flex justify-center items-center gap-1.5 mt-4 flex-wrap px-4">
              {Array.from({ length: holeCount }, (_, i) => i + 1).map(hole => {
                const scored = isHoleScored(hole);
                const isCurrent = hole === currentHole;
                
                return (
                  <button
                    key={hole}
                    onClick={() => goToHole(hole)}
                    className={`
                      w-7 h-7 rounded-full text-xs font-bold transition-all duration-200
                      ${isCurrent 
                        ? 'bg-white text-emerald-600 scale-110 shadow-lg' 
                        : scored 
                          ? 'bg-white/30 text-white hover:bg-white/40' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }
                    `}
                  >
                    {hole}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content - Swipeable Hole View */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-900"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className={`
              p-4 transition-all duration-200 ease-out
              ${slideDirection === 'left' ? '-translate-x-8 opacity-0' : ''}
              ${slideDirection === 'right' ? 'translate-x-8 opacity-0' : ''}
              ${!slideDirection ? 'translate-x-0 opacity-100' : ''}
            `}
          >
            {/* Hole Number Header with Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPrevHole}
                disabled={currentHole <= 1}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${currentHole <= 1 
                    ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed' 
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-lg hover:scale-105 active:scale-95'
                  }
                `}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hole</div>
                <div className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {currentHole}
                </div>
                {isHoleScored(currentHole) && !isEditingHole && (
                  <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-1">
                    <Check className="w-4 h-4" />
                    <span>Scored</span>
                  </div>
                )}
                {isEditingHole && (
                  <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 text-sm font-medium mt-1">
                    <Pencil className="w-4 h-4" />
                    <span>Editing</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={goToNextHole}
                disabled={currentHole >= holeCount}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${currentHole >= holeCount 
                    ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed' 
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-lg hover:scale-105 active:scale-95'
                  }
                `}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Player Score Cards */}
            <div className="space-y-3">
              {activeScorecard.members.map((member, idx) => {
                const existingScore = getHoleScoresForPlayer(member.PlayerID, currentHole);
                const editScore = editedScores[member.PlayerID];
                const currentScore = isEditingHole && editScore 
                  ? editScore.strokes 
                  : existingScore?.Strokes ?? holeScores[member.PlayerID] ?? 0;
                const totalScore = getPlayerTotalScore(member.PlayerID);
                
                return (
                  <div 
                    key={member.PlayerID} 
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Player Info */}
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-12 h-12 rounded-full bg-gradient-to-br ${PLAYER_COLORS[idx % PLAYER_COLORS.length]} 
                            flex items-center justify-center text-white font-bold text-lg shadow-md
                          `}>
                            {member.FirstName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              {member.FirstName} {member.LastName.charAt(0)}.
                              {member.PlayerID === player.PlayerID && (
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Total: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalScore}</span>
                            </div>
                          </div>
                        </div>

                        {/* Score Display/Controls */}
                        {existingScore && !isEditingHole ? (
                          // Scored hole - just show the score (no +/- buttons)
                          <div className="w-16 h-14 flex items-center justify-center">
                            <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                              {currentScore}
                            </span>
                          </div>
                        ) : (
                          // Not scored OR in edit mode - show +/- controls
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => isEditingHole
                                ? handleEditScoreChange(member.PlayerID, currentScore - 1)
                                : handleScoreChange(member.PlayerID, -1)
                              }
                              className="w-11 h-11 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 
                                       hover:bg-gray-200 dark:hover:bg-slate-600 active:scale-90 transition-all
                                       flex items-center justify-center text-2xl font-bold"
                            >
                              −
                            </button>
                            
                            <div className="w-16 h-14 flex items-center justify-center">
                              <span className={`
                                text-4xl font-black transition-all
                                ${isEditingHole 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : currentScore > 0 
                                    ? 'text-gray-900 dark:text-gray-100' 
                                    : 'text-gray-300 dark:text-gray-600'
                                }
                              `}>
                                {currentScore}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => isEditingHole
                                ? handleEditScoreChange(member.PlayerID, currentScore + 1)
                                : handleScoreChange(member.PlayerID, 1)
                              }
                              className="w-11 h-11 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 
                                       hover:bg-gray-200 dark:hover:bg-slate-600 active:scale-90 transition-all
                                       flex items-center justify-center text-2xl font-bold"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quick Score Buttons - for new scores */}
                      {!existingScore && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                          {[0, 1, 2, 3].map(score => (
                            <button
                              key={score}
                              onClick={() => setScore(member.PlayerID, score)}
                              className={`
                                flex-1 py-2 rounded-lg text-sm font-bold transition-all
                                ${holeScores[member.PlayerID] === score
                                  ? 'bg-emerald-500 text-white shadow-md'
                                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }
                              `}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Quick Score Buttons - for edit mode */}
                      {isEditingHole && editScore && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-amber-200 dark:border-amber-700/50">
                          {[0, 1, 2, 3].map(score => (
                            <button
                              key={score}
                              onClick={() => handleEditScoreChange(member.PlayerID, score)}
                              className={`
                                flex-1 py-2 rounded-lg text-sm font-bold transition-all
                                ${editScore.strokes === score
                                  ? 'bg-amber-500 text-white shadow-md'
                                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }
                              `}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button - for new scores */}
            {!isHoleScored(currentHole) && (
              <button
                onClick={handleSaveHoleScores}
                disabled={saving || Object.values(holeScores).every(s => s === 0)}
                className={`
                  w-full mt-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2
                  transition-all duration-300
                  ${saving || Object.values(holeScores).every(s => s === 0)
                    ? 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Save Hole {currentHole}</span>
                  </>
                )}
              </button>
            )}

            {/* Edit Mode Buttons - Update and Cancel */}
            {isHoleScored(currentHole) && isEditingHole && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={cancelEditMode}
                  disabled={updating}
                  className="flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2
                           bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                           hover:bg-gray-300 dark:hover:bg-slate-600 active:scale-[0.98] transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleUpdateHoleScores}
                  disabled={updating}
                  className={`
                    flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2
                    transition-all duration-300
                    ${updating
                      ? 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    }
                  `}
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Edit Button - for scored holes not in edit mode */}
            {isHoleScored(currentHole) && !isEditingHole && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={enterEditMode}
                  className="flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2
                           bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                           hover:bg-gray-300 dark:hover:bg-slate-600 active:scale-[0.98] transition-all duration-300"
                >
                  <Pencil className="w-5 h-5" />
                  <span>Edit Scores</span>
                </button>
                {currentHole < holeCount && (
                  <button
                    onClick={goToNextHole}
                    className="flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2
                             bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg 
                             hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    <span>Next Hole</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Scoreboard */}
        <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg">
          <button
            onClick={() => setShowScoreboard(!showScoreboard)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-gray-900 dark:text-gray-100">Scoreboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {holesScored} of {holeCount} holes
              </div>
              {showScoreboard ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          
          {showScoreboard && (
            <div className="px-4 pb-4 animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Player</th>
                      {Array.from({ length: holeCount }, (_, i) => (
                        <th 
                          key={i} 
                          className={`text-center py-2 px-1.5 font-semibold min-w-[28px]
                            ${i + 1 === currentHole ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}
                          `}
                        >
                          {i + 1}
                        </th>
                      ))}
                      <th className="text-center py-2 px-2 font-bold text-gray-900 dark:text-gray-100">Tot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeScorecard.members.map((member, idx) => (
                      <tr key={member.PlayerID} className="border-b border-gray-100 dark:border-slate-700/50">
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${PLAYER_COLORS[idx % PLAYER_COLORS.length]} 
                                          flex items-center justify-center text-white text-xs font-bold`}>
                              {member.FirstName.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[80px]">
                              {member.FirstName}
                            </span>
                          </div>
                        </td>
                        {Array.from({ length: holeCount }, (_, i) => {
                          const score = activeScorecard.scores.find(
                            s => s.PlayerID === member.PlayerID && s.HoleNumber === i + 1
                          );
                          const isCurrent = i + 1 === currentHole;
                          return (
                            <td 
                              key={i} 
                              className={`text-center py-2 px-1.5 ${isCurrent ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                            >
                              <span className={score ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-gray-600'}>
                                {score ? score.Strokes : '–'}
                              </span>
                            </td>
                          );
                        })}
                        <td className="text-center py-2 px-2 font-bold text-emerald-600 dark:text-emerald-400">
                          {getPlayerTotalScore(member.PlayerID)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full shadow-xl animate-fade-in">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Scorecard?</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will permanently delete this scorecard and all its scores. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 
                             bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 
                             transition-all active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteScorecard}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl font-bold text-white 
                             bg-red-600 hover:bg-red-700 shadow-lg
                             transition-all active:scale-[0.98] flex items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Delete</span>
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
  }

  // ====================================
  // SCORECARD LIST VIEW
  // ====================================
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Scorecards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your rounds</p>
        </div>
        <button
          onClick={() => setShowNewScorecardModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Round</span>
        </button>
      </div>

      {/* Scorecards List */}
      {playerScorecards.length > 0 ? (
        <div className="space-y-4">
          {playerScorecards.map(scorecard => {
            const eventImage = getEventImage(scorecard.EventID);
            return (
              <button
                key={scorecard.ScorecardID}
                onClick={() => navigate(`/scorecard/${scorecard.ScorecardID}`)}
                className="w-full card overflow-hidden cursor-pointer hover:scale-[1.02] transition-all text-left group"
              >
                <div className="relative">
                  {/* Background Image Strip */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img 
                      src={eventImage} 
                      alt="" 
                      className="w-full h-full object-cover opacity-10 dark:opacity-15 group-hover:opacity-20 dark:group-hover:opacity-25 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="relative p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg ring-2 ring-white dark:ring-slate-700 shrink-0">
                        <img 
                          src={eventImage} 
                          alt={scorecard.EventName || 'Event'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {scorecard.EventName || `Event #${scorecard.EventID}`}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {scorecard.EventDate 
                            ? new Date(scorecard.EventDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Date not set'
                          } • {scorecard.HoleCount || 9} holes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {scorecard.TotalScore !== null && (
                        <div className="text-right">
                          <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {scorecard.TotalScore}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl 
                        flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Disc3 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No scorecards yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start tracking your disc golf rounds</p>
          <button
            onClick={() => setShowNewScorecardModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Scorecard</span>
          </button>
        </div>
      )}

      {/* New Scorecard Modal */}
      {showNewScorecardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Round</h2>
                <button
                  onClick={() => setShowNewScorecardModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Event
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {events.map(event => {
                    const eventImage = getEventImage(event.EventID);
                    return (
                      <button
                        key={event.EventID}
                        onClick={() => setSelectedEventId(event.EventID)}
                        className={`w-full p-3 rounded-xl text-left transition-all flex items-center space-x-3 ${
                          selectedEventId === event.EventID
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 shadow-md'
                            : 'bg-gray-50 dark:bg-slate-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden shadow shrink-0">
                          <img 
                            src={eventImage} 
                            alt={event.Name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{event.Name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(event.EventDate).toLocaleDateString()} • {event.HoleCount} holes
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Player Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Users className="w-4 h-4 inline mr-2" />
                  Select Players (up to 4)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {players.map((p, idx) => (
                    <button
                      key={p.PlayerID}
                      onClick={() => togglePlayerSelection(p.PlayerID)}
                      disabled={p.PlayerID === player.PlayerID}
                      className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between ${
                        selectedPlayers.includes(p.PlayerID)
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500'
                          : 'bg-gray-50 dark:bg-slate-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      } ${p.PlayerID === player.PlayerID ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${PLAYER_COLORS[idx % PLAYER_COLORS.length]} 
                                      flex items-center justify-center text-white font-bold`}>
                          {p.FirstName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {p.FirstName} {p.LastName}
                          </span>
                          {p.PlayerID === player.PlayerID && (
                            <span className="ml-2 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                          <div className="text-sm text-gray-500">{p.SkillDivision}</div>
                        </div>
                      </div>
                      {selectedPlayers.includes(p.PlayerID) && (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={handleCreateScorecard}
                disabled={!selectedEventId || selectedPlayers.length === 0 || creating}
                className="w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 
                         bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg
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
                    <Trophy className="w-5 h-5" />
                    <span>Start Round</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScorecardPage;
