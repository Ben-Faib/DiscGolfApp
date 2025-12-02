import { useState, useEffect, useRef, TouchEvent, useCallback } from 'react';
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
  AlertTriangle,
  Star,
  Sparkles,
  Search,
  ArrowLeftRight,
  Calendar,
  Zap,
  Heart,
  Wind
} from 'lucide-react';

// Confetti colors for celebration
const CONFETTI_COLORS = [
  '#FFD700', // Gold
  '#FFA500', // Orange  
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
  '#45B7D1', // Sky blue
  '#96CEB4', // Mint
  '#FFEAA7', // Light yellow
  '#DDA0DD', // Plum
];

// Unified Score Animation Overlay
interface ScoreAnimationProps {
  playerName: string;
  score: number;
  onComplete: () => void;
}

const ScoreAnimationOverlay = ({ playerName, score, onComplete }: ScoreAnimationProps) => {
  useEffect(() => {
    const durations: Record<number, number> = {
      0: 3200,
      1: 1800,
      2: 1800,
      3: 2500
    };
    const timer = setTimeout(onComplete, durations[score] || 1800);
    return () => clearTimeout(timer);
  }, [onComplete, score]);

  // Score 3 - Perfect! (existing celebration)
  if (score === 3) {
    const confettiPieces = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      left: `${10 + Math.random() * 80}%`,
      delay: `${Math.random() * 0.3}s`,
      rotation: Math.random() * 360,
    }));

    const sparkles = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: `${20 + Math.random() * 60}%`,
      top: `${20 + Math.random() * 60}%`,
      delay: `${i * 0.1}s`,
      size: 12 + Math.random() * 8,
    }));

    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-yellow-400/10 to-transparent animate-fade-in" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="ring-burst w-20 h-20" style={{ animationDelay: '0s' }} />
          <div className="ring-burst w-20 h-20" style={{ animationDelay: '0.2s' }} />
          <div className="ring-burst w-20 h-20" style={{ animationDelay: '0.4s' }} />
        </div>

        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="confetti-piece"
            style={{
              backgroundColor: piece.color,
              left: piece.left,
              bottom: '40%',
              animationDelay: piece.delay,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        ))}

        {sparkles.map((s) => (
          <div
            key={s.id}
            className="sparkle"
            style={{
              left: s.left,
              top: s.top,
              animationDelay: s.delay,
            }}
          >
            <Sparkles 
              className="text-yellow-400" 
              style={{ width: s.size, height: s.size }} 
            />
          </div>
        ))}

        <div className="relative flex flex-col items-center celebrate-burst">
          <div className="star-burst mb-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-xl celebrate-glow">
              <Star className="w-14 h-14 text-white fill-white" />
            </div>
          </div>

          <div className="perfect-text text-center">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 drop-shadow-lg">
              PERFECT!
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {playerName} scored 3!
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Score 2 - Nice Shot!
  if (score === 2) {
    const greenSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${30 + Math.random() * 40}%`,
      top: `${35 + Math.random() * 20}%`,
      delay: `${i * 0.05}s`,
    }));

    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-green-500/15 via-emerald-400/8 to-transparent animate-fade-in" />
        
        {greenSparkles.map((s) => (
          <div
            key={s.id}
            className="green-sparkle"
            style={{
              left: s.left,
              top: s.top,
              animationDelay: s.delay,
            }}
          />
        ))}

        <div className="relative flex flex-col items-center zap-burst">
          <div className="zap-burst mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 flex items-center justify-center shadow-xl nice-shot-glow">
              <Zap className="w-12 h-12 text-white fill-white" />
            </div>
          </div>

          <div className="nice-shot-text text-center">
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 drop-shadow-lg">
              NICE SHOT!
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {playerName} got 2!
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Score 1 - Close Call! (target with heartbeat)
  if (score === 1) {
    // Miss marks that appear at the edges before the final hit
    const missMarks = [
      { id: 1, x: -35, y: -20, delay: '0.3s', rotation: -15 },
      { id: 2, x: 30, y: 25, delay: '0.6s', rotation: 20 },
    ];

    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        {/* Tense red/coral background that transitions to relief */}
        <div className="absolute inset-0 bg-gradient-to-t from-rose-500/15 via-orange-400/10 to-transparent animate-fade-in" />
        
        {/* Heartbeat pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="heartbeat-ring" style={{ animationDelay: '0.8s' }} />
          <div className="heartbeat-ring" style={{ animationDelay: '1.0s' }} />
          <div className="heartbeat-ring" style={{ animationDelay: '1.2s' }} />
        </div>

        {/* Target/Bullseye */}
        <div className="relative target-appear">
          {/* Outer ring */}
          <div className="w-32 h-32 rounded-full border-4 border-rose-400/60 flex items-center justify-center">
            {/* Middle ring */}
            <div className="w-24 h-24 rounded-full border-4 border-orange-400/70 flex items-center justify-center">
              {/* Inner ring */}
              <div className="w-16 h-16 rounded-full border-4 border-amber-400/80 flex items-center justify-center">
                {/* Bullseye center - turns green on hit */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 hit-center shadow-lg" />
              </div>
            </div>
          </div>

          {/* Miss marks (X) near the edges */}
          {missMarks.map((mark) => (
            <div
              key={mark.id}
              className="miss-mark absolute"
              style={{
                left: `calc(50% + ${mark.x}px)`,
                top: `calc(50% + ${mark.y}px)`,
                animationDelay: mark.delay,
                transform: `translate(-50%, -50%) rotate(${mark.rotation}deg)`,
              }}
            >
              <X className="w-6 h-6 text-rose-500 stroke-[3]" />
            </div>
          ))}

          {/* Final hit mark in center */}
          <div className="hit-mark absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Check className="w-8 h-8 text-emerald-500 stroke-[3]" />
          </div>

          {/* Heart pulse icon */}
          <div className="absolute -right-4 -top-4 heart-pulse">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-400" />
          </div>
        </div>

        {/* Text */}
        <div className="close-call-text text-center absolute" style={{ top: '62%' }}>
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-emerald-500 drop-shadow-lg">
            Close call!
          </div>
          <div className="text-base font-semibold text-rose-600 dark:text-rose-400 mt-2">
            {playerName} barely made it
          </div>
        </div>
      </div>
    );
  }

  // Score 0 - Tumbleweed / Crickets (western desert comedy)
  if (score === 0) {
    // Dust particles floating in the wind
    const dustParticles = [
      { id: 1, left: '15%', top: '30%', delay: '0.3s', size: 4 },
      { id: 2, left: '25%', top: '50%', delay: '0.5s', size: 3 },
      { id: 3, left: '40%', top: '35%', delay: '0.4s', size: 5 },
      { id: 4, left: '55%', top: '55%', delay: '0.6s', size: 3 },
      { id: 5, left: '70%', top: '40%', delay: '0.35s', size: 4 },
      { id: 6, left: '80%', top: '60%', delay: '0.55s', size: 3 },
      { id: 7, left: '35%', top: '65%', delay: '0.7s', size: 4 },
      { id: 8, left: '60%', top: '25%', delay: '0.45s', size: 3 },
    ];

    // Wind streaks
    const windStreaks = [
      { id: 1, top: '35%', delay: '0.2s' },
      { id: 2, top: '50%', delay: '0.35s' },
      { id: 3, top: '65%', delay: '0.5s' },
    ];

    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        {/* Desert background with dust haze */}
        <div className="absolute inset-0 desert-bg animate-fade-in" />
        
        {/* Wind streaks */}
        {windStreaks.map((streak) => (
          <div
            key={streak.id}
            className="wind-streak"
            style={{
              top: streak.top,
              animationDelay: streak.delay,
            }}
          />
        ))}

        {/* Floating dust particles */}
        {dustParticles.map((particle) => (
          <div
            key={particle.id}
            className="dust-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
            }}
          />
        ))}

        {/* Rolling tumbleweed */}
        <div className="tumbleweed-container">
          <div className="tumbleweed">
            {/* Tumbleweed made with CSS circles */}
            <div className="tumbleweed-core" />
            <div className="tumbleweed-branch tumbleweed-branch-1" />
            <div className="tumbleweed-branch tumbleweed-branch-2" />
            <div className="tumbleweed-branch tumbleweed-branch-3" />
            <div className="tumbleweed-branch tumbleweed-branch-4" />
          </div>
        </div>

        {/* Lonely abandoned disc */}
        <div className="lonely-disc-container">
          <div className="lonely-disc">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 flex items-center justify-center shadow-xl">
              <Disc3 className="w-12 h-12 text-amber-900/70" />
            </div>
          </div>
          {/* Disc shadow on ground */}
          <div className="disc-ground-shadow" />
        </div>

        {/* Wind icon */}
        <div className="wind-icon">
          <Wind className="w-10 h-10 text-amber-600/70" />
        </div>

        {/* Crickets text */}
        <div
          className="crickets-text text-center absolute px-4 py-3 rounded-2xl bg-black/50 backdrop-blur-sm shadow-2xl"
          style={{ top: '68%' }}
        >
          <div className="text-4xl font-black italic text-amber-50 tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            *crickets*
          </div>
          <div className="text-lg font-semibold text-amber-100 mt-2">
            {playerName} heard nothing but silence
          </div>
        </div>
      </div>
    );
  }

  return null;
};
import { SkeletonText, SkeletonScorecardItem, Skeleton } from '../components/Skeleton';

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
    refreshPlayerScorecards,
    refreshPlayers
  } = useData();

  // UI State
  const [showNewScorecardModal, setShowNewScorecardModal] = useState(false);
  const activeScorecardId = scorecardId ? parseInt(scorecardId, 10) : null;
  const [activeScorecard, setActiveScorecard] = useState<api.ScorecardDetail | null>(null);
  
  // New Scorecard Form State
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>(player ? [player.PlayerID] : []);
  const [creating, setCreating] = useState(false);
  
  // New Round Modal UI State
  const [eventSectionExpanded, setEventSectionExpanded] = useState(true);
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [pendingPlayer, setPendingPlayer] = useState<number | null>(null);
  
  // Create Player Form State
  const [showCreatePlayerForm, setShowCreatePlayerForm] = useState(false);
  const [newPlayerFirstName, setNewPlayerFirstName] = useState('');
  const [newPlayerLastName, setNewPlayerLastName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerDivision, setNewPlayerDivision] = useState('Recreational');
  const [creatingPlayer, setCreatingPlayer] = useState(false);
  const [createPlayerError, setCreatePlayerError] = useState<string | null>(null);

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

  // Remove Player from Scorecard State
  const [showRemovePlayerConfirm, setShowRemovePlayerConfirm] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<{ id: number; name: string } | null>(null);
  const [removingPlayer, setRemovingPlayer] = useState(false);

  // Score Animation State
  const [celebratingPlayer, setCelebratingPlayer] = useState<{ id: number; name: string; score: number } | null>(null);

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

  const loadScorecardDetails = async (id: number, autoNavigate: boolean = true) => {
    const details = await getScorecard(id);
    setActiveScorecard(details);
    if (details) {
      // Only auto-navigate to next unscored hole on initial load, not on refresh
      if (autoNavigate) {
        const scoredHoles = new Set(details.scores.map(s => s.HoleNumber));
        for (let i = 1; i <= (details.HoleCount || 9); i++) {
          if (!scoredHoles.has(i)) {
            setCurrentHole(i);
            break;
          }
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

  // Open new round modal with fresh state (prevents doubling bug)
  const openNewRoundModal = () => {
    if (!player) return;
    // Reset all modal-related state to prevent carry-over from previous opens
    setSelectedPlayers([player.PlayerID]);
    setSelectedEventId(null);
    setEventSectionExpanded(true);
    setPlayerSearchQuery('');
    setShowCreatePlayerForm(false);
    setShowSwapDialog(false);
    setPendingPlayer(null);
    // Reset create player form state
    setNewPlayerFirstName('');
    setNewPlayerLastName('');
    setNewPlayerEmail('');
    setNewPlayerDivision('Recreational');
    setCreatePlayerError(null);
    // Show the modal
    setShowNewScorecardModal(true);
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

  const setScore = useCallback((playerId: number, score: number) => {
    const clampedScore = Math.max(0, Math.min(3, score));
    setHoleScores(prev => ({
      ...prev,
      [playerId]: clampedScore
    }));

    // Trigger animation for any score
    if (activeScorecard) {
      const member = activeScorecard.members.find(m => m.PlayerID === playerId);
      if (member) {
        setCelebratingPlayer({ id: playerId, name: member.FirstName, score: clampedScore });
      }
    }
  }, [activeScorecard]);

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
        // Refresh scorecard data without auto-navigating (we handle navigation explicitly below)
        await loadScorecardDetails(activeScorecard.ScorecardID, false);
        
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
  const handleEditScoreChange = useCallback((playerId: number, newStrokes: number) => {
    const clampedScore = Math.max(0, Math.min(3, newStrokes));
    setEditedScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        strokes: clampedScore
      }
    }));

    // Trigger animation for edited score
    if (activeScorecard) {
      const member = activeScorecard.members.find(m => m.PlayerID === playerId);
      if (member) {
        setCelebratingPlayer({ id: playerId, name: member.FirstName, score: clampedScore });
      }
    }
  }, [activeScorecard]);

  // Save all edited scores
  const handleUpdateHoleScores = async () => {
    if (!activeScorecard || !player) return;
    
    setUpdating(true);
    try {
      // Update each score
      const updatePromises = Object.entries(editedScores).map(([_, scoreData]) =>
        api.updateScore(scoreData.scoreId, scoreData.strokes, player.PlayerID)
      );
      
      await Promise.all(updatePromises);
      
      // Reload scorecard data without auto-navigating (stay on current hole after editing)
      await loadScorecardDetails(activeScorecard.ScorecardID, false);
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
    if (!activeScorecard || !player) return;
    
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

  // Check if current user can remove a specific player from scorecard
  const canRemovePlayer = (targetPlayerId: number): boolean => {
    if (!activeScorecard || !player) return false;
    // Must have at least 2 members to remove someone
    if (activeScorecard.members.length <= 1) return false;
    // Creator can remove anyone except themselves if they're the last member
    if (activeScorecard.CreatedByPlayerID === player.PlayerID) {
      return true;
    }
    // Players can remove themselves
    return targetPlayerId === player.PlayerID;
  };

  // Remove a player from scorecard
  const handleRemovePlayer = async () => {
    if (!activeScorecard || !playerToRemove || !player) return;
    
    setRemovingPlayer(true);
    try {
      await api.removePlayerFromScorecard(
        activeScorecard.ScorecardID,
        playerToRemove.id,
        player.PlayerID
      );
      
      // If removing self, navigate back to scorecard list
      if (playerToRemove.id === player.PlayerID) {
        setShowRemovePlayerConfirm(false);
        setPlayerToRemove(null);
        setActiveScorecard(null);
        await refreshPlayerScorecards();
        navigate('/scorecard');
      } else {
        // Reload scorecard to show updated members
        setShowRemovePlayerConfirm(false);
        setPlayerToRemove(null);
        await loadScorecardDetails(activeScorecard.ScorecardID);
        await refreshPlayerScorecards();
      }
    } catch (err) {
      console.error('Failed to remove player:', err);
      alert('Failed to remove player from scorecard.');
    } finally {
      setRemovingPlayer(false);
    }
  };

  const togglePlayerSelection = (playerId: number) => {
    if (!player || playerId === player.PlayerID) return;
    
    // If already selected, remove them
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(prev => prev.filter(id => id !== playerId));
      return;
    }
    
    // If at max capacity, show swap dialog
    if (selectedPlayers.length >= 4) {
      setPendingPlayer(playerId);
      setShowSwapDialog(true);
      return;
    }
    
    // Otherwise add player
    setSelectedPlayers(prev => [...prev, playerId]);
  };

  const handleSwapPlayer = (playerToRemove: number) => {
    if (!player || playerToRemove === player.PlayerID || !pendingPlayer) return;
    
    setSelectedPlayers(prev => {
      const newPlayers = prev.filter(id => id !== playerToRemove);
      return [...newPlayers, pendingPlayer];
    });
    setShowSwapDialog(false);
    setPendingPlayer(null);
  };

  const cancelSwap = () => {
    setShowSwapDialog(false);
    setPendingPlayer(null);
  };

  // Reset create player form
  const resetCreatePlayerForm = () => {
    setShowCreatePlayerForm(false);
    setNewPlayerFirstName('');
    setNewPlayerLastName('');
    setNewPlayerEmail('');
    setNewPlayerDivision('Recreational');
    setCreatePlayerError(null);
  };

  // Create a new player
  const handleCreatePlayer = async () => {
    if (!newPlayerFirstName.trim() || !newPlayerLastName.trim() || !newPlayerEmail.trim()) return;
    
    setCreatingPlayer(true);
    setCreatePlayerError(null);
    try {
      const newPlayer = await api.createPlayer({
        firstName: newPlayerFirstName.trim(),
        lastName: newPlayerLastName.trim(),
        email: newPlayerEmail.trim(),
        skillDivision: newPlayerDivision
      });
      
      // Refresh players list
      await refreshPlayers();
      
      // Auto-select the new player if there's room
      if (selectedPlayers.length < 4) {
        setSelectedPlayers(prev => [...prev, newPlayer.PlayerID]);
      }
      
      // Reset and close the form
      resetCreatePlayerForm();
    } catch (err) {
      console.error('Failed to create player:', err);
      setCreatePlayerError(err instanceof Error ? err.message : 'Failed to create player');
    } finally {
      setCreatingPlayer(false);
    }
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
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between animate-slide-up-fade stagger-1">
          <div>
            <SkeletonText className="w-36 h-8 mb-2" />
            <SkeletonText className="w-32" />
          </div>
          <Skeleton className="w-32 h-12 rounded-xl" />
        </div>
        
        {/* Scorecard Items Skeleton */}
        <div className="space-y-4">
          <SkeletonScorecardItem className="animate-slide-up-fade stagger-2" />
          <SkeletonScorecardItem className="animate-slide-up-fade stagger-3" />
          <SkeletonScorecardItem className="animate-slide-up-fade stagger-4" />
        </div>
      </div>
    );
  }

  // Loading state - for specific scorecard (prevents flash of list on refresh)
  if (activeScorecardId && !activeScorecard) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="w-16 h-6 rounded" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton className="w-48 h-7 mx-auto rounded" />
            <Skeleton className="w-32 h-4 mx-auto rounded" />
          </div>
          {/* Progress dots skeleton */}
          <div className="flex justify-center items-center gap-1.5 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <div key={i} className="w-7 h-7 rounded-full bg-white/20 animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 bg-gray-50 dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="text-center">
              <Skeleton className="w-12 h-4 mx-auto mb-2 rounded" />
              <Skeleton className="w-16 h-12 mx-auto rounded" />
            </div>
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
          
          {/* Player cards skeleton */}
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 animate-slide-up-fade" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <SkeletonText className="w-24" />
                      <SkeletonText className="w-16" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-14 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !player) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-card p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error || 'Failed to load player data'}</p>
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

        {/* Main Content Area - Split Layout on Desktop */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50 dark:bg-slate-900">
          {/* Left: Scoring Area */}
          <div 
            ref={containerRef}
            className="flex-1 lg:w-3/5 overflow-y-auto"
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
                              {canRemovePlayer(member.PlayerID) && activeScorecard.members.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPlayerToRemove({ id: member.PlayerID, name: member.FirstName });
                                    setShowRemovePlayerConfirm(true);
                                  }}
                                  className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 
                                           dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all ml-1"
                                  title={member.PlayerID === player.PlayerID ? 'Leave scorecard' : `Remove ${member.FirstName}`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
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
                            
                            <div className={`w-16 h-14 flex items-center justify-center relative ${
                              currentScore === 3 && !isEditingHole ? 'celebrate-container' : ''
                            }`}>
                              {currentScore === 3 && !isEditingHole && (
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-xl animate-pulse" />
                              )}
                              <span className={`
                                text-4xl font-black transition-all relative z-10
                                ${isEditingHole 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : currentScore === 3
                                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm'
                                    : currentScore > 0 
                                      ? 'text-gray-900 dark:text-gray-100' 
                                      : 'text-gray-300 dark:text-gray-600'
                                }
                              `}>
                                {currentScore}
                              </span>
                              {currentScore === 3 && !isEditingHole && (
                                <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-yellow-400" />
                              )}
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
                                flex-1 py-2 rounded-lg text-sm font-bold transition-all relative
                                ${holeScores[member.PlayerID] === score
                                  ? score === 3
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-300/50'
                                    : 'bg-emerald-500 text-white shadow-md'
                                  : score === 3
                                    ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-amber-700 dark:text-amber-400 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-yellow-800/40 dark:hover:to-amber-800/40 border border-amber-300 dark:border-amber-700'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                }
                              `}
                            >
                              {score === 3 && holeScores[member.PlayerID] !== 3 && (
                                <Star className="w-3 h-3 absolute top-0.5 right-0.5 text-amber-500" />
                              )}
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

          {/* Right: Scoreboard Sidebar - Desktop Only */}
          <div className="hidden lg:flex lg:w-2/5 flex-col border-l border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            {/* Sidebar Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-gray-900 dark:text-gray-100">Scoreboard</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {holesScored} of {holeCount} holes
                </div>
              </div>
            </div>
            
            {/* Sidebar Scoreboard Table */}
            <div className="flex-1 overflow-auto p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-slate-800">
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Player</th>
                      {Array.from({ length: holeCount }, (_, i) => (
                        <th 
                          key={i} 
                          className={`text-center py-2 px-1 font-semibold min-w-[24px]
                            ${i + 1 === currentHole ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded' : 'text-gray-600 dark:text-gray-400'}
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
                      <tr key={member.PlayerID} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${PLAYER_COLORS[idx % PLAYER_COLORS.length]} 
                                          flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                              {member.FirstName.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[70px]">
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
                              className={`text-center py-2.5 px-1 ${isCurrent ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                            >
                              <span className={`
                                ${score 
                                  ? score.Strokes === 3 
                                    ? 'font-bold text-amber-600 dark:text-amber-400' 
                                    : 'font-semibold text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-300 dark:text-gray-600'
                                }
                              `}>
                                {score ? score.Strokes : '–'}
                              </span>
                            </td>
                          );
                        })}
                        <td className="text-center py-2.5 px-2 font-bold text-emerald-600 dark:text-emerald-400 text-base">
                          {getPlayerTotalScore(member.PlayerID)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Scoreboard - Mobile Only */}
        <div className="lg:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg">
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
                      {activeScorecard.members.length > 1 && (
                        <th className="w-8"></th>
                      )}
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
                        {activeScorecard.members.length > 1 && canRemovePlayer(member.PlayerID) && (
                          <td className="text-center py-2 px-1">
                            <button
                              onClick={() => {
                                setPlayerToRemove({ id: member.PlayerID, name: member.FirstName });
                                setShowRemovePlayerConfirm(true);
                              }}
                              className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 
                                       dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all"
                              title={member.PlayerID === player.PlayerID ? 'Leave scorecard' : `Remove ${member.FirstName}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                        {activeScorecard.members.length > 1 && !canRemovePlayer(member.PlayerID) && (
                          <td className="w-8"></td>
                        )}
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

        {/* Remove Player Confirmation Modal */}
        {showRemovePlayerConfirm && playerToRemove && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full shadow-xl animate-fade-in">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {playerToRemove.id === player.PlayerID ? 'Leave Scorecard?' : `Remove ${playerToRemove.name}?`}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {playerToRemove.id === player.PlayerID 
                    ? 'You will be removed from this scorecard. Your scores will be deleted.'
                    : `${playerToRemove.name} will be removed from this scorecard. Their scores will be deleted.`
                  }
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRemovePlayerConfirm(false);
                      setPlayerToRemove(null);
                    }}
                    disabled={removingPlayer}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 
                             bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 
                             transition-all active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemovePlayer}
                    disabled={removingPlayer}
                    className="flex-1 py-3 rounded-xl font-bold text-white 
                             bg-orange-600 hover:bg-orange-700 shadow-lg
                             transition-all active:scale-[0.98] flex items-center justify-center gap-2
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {removingPlayer ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" />
                        <span>{playerToRemove.id === player.PlayerID ? 'Leave' : 'Remove'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Animation Overlay */}
        {celebratingPlayer && (
          <ScoreAnimationOverlay 
            playerName={celebratingPlayer.name}
            score={celebratingPlayer.score}
            onComplete={() => setCelebratingPlayer(null)}
          />
        )}
      </div>
    );
  }

  // ====================================
  // SCORECARD LIST VIEW
  // ====================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up-fade stagger-1">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Scorecards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your rounds</p>
        </div>
        <button
          onClick={openNewRoundModal}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Round</span>
        </button>
      </div>

      {/* Scorecards List */}
      {playerScorecards.length > 0 ? (
        <div className="space-y-4">
          {playerScorecards.map((scorecard, index) => {
            const eventImage = getEventImage(scorecard.EventID);
            return (
              <button
                key={scorecard.ScorecardID}
                onClick={() => navigate(`/scorecard/${scorecard.ScorecardID}`)}
                className={`w-full card overflow-hidden cursor-pointer hover:scale-[1.02] transition-all text-left group animate-slide-up-fade stagger-${Math.min(index + 2, 6)}`}
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
        <div className="glass-card p-12 text-center animate-slide-up-fade stagger-2">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl 
                        flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Disc3 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No scorecards yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start tracking your disc golf rounds</p>
          <button
            onClick={openNewRoundModal}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Scorecard</span>
          </button>
        </div>
      )}

      {/* New Scorecard Modal */}
      {showNewScorecardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <Disc3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Round</h2>
                </div>
                <button
                  onClick={() => {
                    setShowNewScorecardModal(false);
                    setEventSectionExpanded(true);
                    setPlayerSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content - Two Column Layout */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Left Column - Event Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      Event
                    </label>
                    {selectedEventId && (
                      <button
                        onClick={() => setEventSectionExpanded(!eventSectionExpanded)}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        {eventSectionExpanded ? 'Collapse' : 'Change'}
                        {eventSectionExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Selected Event Preview (shown when collapsed) */}
                  {selectedEventId && !eventSectionExpanded && (
                    <button
                      onClick={() => setEventSectionExpanded(true)}
                      className="w-full p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 
                               text-left transition-all hover:shadow-md flex items-center gap-3"
                    >
                      {(() => {
                        const selectedEvent = events.find(e => e.EventID === selectedEventId);
                        if (!selectedEvent) return null;
                        const eventImage = getEventImage(selectedEvent.EventID);
                        return (
                          <>
                            <div className="w-12 h-12 rounded-lg overflow-hidden shadow shrink-0 ring-2 ring-emerald-500/30">
                              <img src={eventImage} alt={selectedEvent.Name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">{selectedEvent.Name}</div>
                              <div className="text-sm text-emerald-600 dark:text-emerald-400">
                                {new Date(selectedEvent.EventDate).toLocaleDateString()} • {selectedEvent.HoleCount} holes
                              </div>
                            </div>
                            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                          </>
                        );
                      })()}
                    </button>
                  )}

                  {/* Event List (shown when expanded) */}
                  {eventSectionExpanded && (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                      {events.map(event => {
                        const eventImage = getEventImage(event.EventID);
                        const isSelected = selectedEventId === event.EventID;
                        return (
                          <button
                            key={event.EventID}
                            onClick={() => {
                              setSelectedEventId(event.EventID);
                              setEventSectionExpanded(false);
                            }}
                            className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 shadow-md'
                                : 'bg-gray-50 dark:bg-slate-800 border-2 border-transparent hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <div className="w-11 h-11 rounded-lg overflow-hidden shadow shrink-0">
                              <img src={eventImage} alt={event.Name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{event.Name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(event.EventDate).toLocaleDateString()} • {event.HoleCount} holes
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column - Player Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Players
                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                      selectedPlayers.length >= 4 
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {selectedPlayers.length}/4
                    </span>
                  </label>

                  {/* Selected Players Chips */}
                  {selectedPlayers.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      {selectedPlayers.map(playerId => {
                        const p = players.find(pl => pl.PlayerID === playerId);
                        if (!p) return null;
                        const isOwner = playerId === player.PlayerID;
                        return (
                          <div
                            key={playerId}
                            className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-sm font-medium transition-all ${
                              isOwner
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-slate-600'
                            }`}
                          >
                            <span className="truncate max-w-[100px]">{p.FirstName}</span>
                            {isOwner ? (
                              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">You</span>
                            ) : (
                              <button
                                onClick={() => togglePlayerSelection(playerId)}
                                className="p-0.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search players..."
                      value={playerSearchQuery}
                      onChange={(e) => setPlayerSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate-600 
                               bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100
                               focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all
                               placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                    />
                    {playerSearchQuery && (
                      <button
                        onClick={() => setPlayerSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* Player List */}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                    {(() => {
                      const searchLower = playerSearchQuery.toLowerCase();
                      const filteredPlayers = players.filter(p => {
                        // Always show owner at top
                        if (p.PlayerID === player.PlayerID) return true;
                        // Filter by search
                        if (!playerSearchQuery) return true;
                        return (
                          p.FirstName.toLowerCase().includes(searchLower) ||
                          p.LastName.toLowerCase().includes(searchLower)
                        );
                      });

                      // Sort: owner first, then selected, then others
                      const sortedPlayers = [...filteredPlayers].sort((a, b) => {
                        if (a.PlayerID === player.PlayerID) return -1;
                        if (b.PlayerID === player.PlayerID) return 1;
                        const aSelected = selectedPlayers.includes(a.PlayerID);
                        const bSelected = selectedPlayers.includes(b.PlayerID);
                        if (aSelected && !bSelected) return -1;
                        if (!aSelected && bSelected) return 1;
                        return 0;
                      });

                      if (sortedPlayers.length === 0) {
                        return (
                          <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                            No players found matching "{playerSearchQuery}"
                          </div>
                        );
                      }

                      return sortedPlayers.map((p) => {
                        const isSelected = selectedPlayers.includes(p.PlayerID);
                        const isOwner = p.PlayerID === player.PlayerID;
                        const playerIndex = players.findIndex(pl => pl.PlayerID === p.PlayerID);

                        return (
                          <button
                            key={p.PlayerID}
                            onClick={() => togglePlayerSelection(p.PlayerID)}
                            disabled={isOwner}
                            className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between group ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-400 dark:border-emerald-600'
                                : 'bg-gray-50 dark:bg-slate-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'
                            } ${isOwner ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]} 
                                            flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                                {p.FirstName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                    {p.FirstName} {p.LastName}
                                  </span>
                                  {isOwner && (
                                    <span className="shrink-0 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{p.SkillDivision}</div>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isSelected 
                                ? 'bg-emerald-500 border-emerald-500' 
                                : 'border-gray-300 dark:border-slate-500 group-hover:border-emerald-400'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>

                  {/* Create New Player Button/Form */}
                  {!showCreatePlayerForm ? (
                    <button
                      onClick={() => setShowCreatePlayerForm(true)}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600
                               text-gray-600 dark:text-gray-400 text-sm font-medium
                               hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400
                               transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Player</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">New Player</h4>
                        <button
                          onClick={resetCreatePlayerForm}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={newPlayerFirstName}
                          onChange={(e) => setNewPlayerFirstName(e.target.value)}
                          className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-slate-600 
                                   bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm
                                   focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all
                                   placeholder:text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={newPlayerLastName}
                          onChange={(e) => setNewPlayerLastName(e.target.value)}
                          className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-slate-600 
                                   bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm
                                   focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all
                                   placeholder:text-gray-400"
                        />
                      </div>
                      
                      <input
                        type="email"
                        placeholder="Email"
                        value={newPlayerEmail}
                        onChange={(e) => setNewPlayerEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-slate-600 
                                 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm
                                 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all
                                 placeholder:text-gray-400"
                      />
                      
                      <select
                        value={newPlayerDivision}
                        onChange={(e) => setNewPlayerDivision(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-slate-600 
                                 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm
                                 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                      >
                        <option value="Recreational">Recreational</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Professional">Professional</option>
                      </select>

                      {createPlayerError && (
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <p className="text-xs text-red-600 dark:text-red-400">{createPlayerError}</p>
                        </div>
                      )}

                      <button
                        onClick={handleCreatePlayer}
                        disabled={!newPlayerFirstName.trim() || !newPlayerLastName.trim() || !newPlayerEmail.trim() || creatingPlayer}
                        className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 
                                 bg-blue-600 text-white shadow-md
                                 hover:bg-blue-700 active:scale-[0.98] transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingPlayer ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Create Player</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
              <button
                onClick={handleCreateScorecard}
                disabled={!selectedEventId || selectedPlayers.length === 0 || creating}
                className="w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 
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

      {/* Swap Player Dialog */}
      {showSwapDialog && pendingPlayer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="card max-w-sm w-full overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">Card is Full</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Maximum 4 players per card</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Swap out a player to add{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {players.find(p => p.PlayerID === pendingPlayer)?.FirstName}
                </span>
                :
              </p>

              <div className="space-y-2">
                {selectedPlayers.map(playerId => {
                  const p = players.find(pl => pl.PlayerID === playerId);
                  if (!p) return null;
                  const isOwner = playerId === player.PlayerID;
                  const playerIndex = players.findIndex(pl => pl.PlayerID === playerId);

                  return (
                    <button
                      key={playerId}
                      onClick={() => !isOwner && handleSwapPlayer(playerId)}
                      disabled={isOwner}
                      className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between ${
                        isOwner
                          ? 'bg-gray-100 dark:bg-slate-800 opacity-60 cursor-not-allowed'
                          : 'bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]} 
                                      flex items-center justify-center text-white font-bold text-sm`}>
                          {p.FirstName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {p.FirstName} {p.LastName}
                            </span>
                            {isOwner && (
                              <span className="text-[10px] bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                                Can't swap
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{p.SkillDivision}</div>
                        </div>
                      </div>
                      {!isOwner && (
                        <ArrowLeftRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <button
                onClick={cancelSwap}
                className="w-full py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 
                         bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600
                         hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScorecardPage;
