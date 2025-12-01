/**
 * API utility for connecting to Flask backend
 */

const API_BASE = 'http://localhost:5000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// ============================================
// PLAYERS
// ============================================

export interface Player {
  PlayerID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  SkillDivision: string;
  DateInserted?: string;
}

export async function getPlayers(): Promise<Player[]> {
  return fetchApi<Player[]>('/players');
}

export async function getPlayer(playerId: number): Promise<Player> {
  return fetchApi<Player>(`/players/${playerId}`);
}

export async function createPlayer(data: {
  firstName: string;
  lastName: string;
  email: string;
  skillDivision: string;
}): Promise<Player> {
  return fetchApi<Player>('/players', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// LEADERBOARD / STATS
// ============================================

export interface LeaderboardEntry {
  SkillDivision: string;
  FirstName: string;
  LastName: string;
  RoundsPlayed: number;
  HighTotal: number;
  BestScorecardTotal: number;
  DivisionRank: number;
}

export async function getLeaderboard(division?: string): Promise<LeaderboardEntry[]> {
  const params = division ? `?division=${encodeURIComponent(division)}` : '';
  return fetchApi<LeaderboardEntry[]>(`/leaderboard${params}`);
}

export interface PlayerHistory {
  PlayerID: number;
  FirstName: string;
  LastName: string;
  SkillDivision: string;
  ScorecardID: number;
  EventID: number;
  EventDate: string;
  EventName: string;
  ScorecardTotal: number;
  ScoreRank: number;
  CountsTowardTotal: string;
}

export async function getPlayerHistory(playerId: number): Promise<PlayerHistory[]> {
  return fetchApi<PlayerHistory[]>(`/players/${playerId}/history`);
}

// Hot Rounds - Best player rounds per event by division
export interface HotRound {
  EventName: string;
  EventDate: string;
  SkillDivision: string;
  PlayerName: string;
  RoundTotal: number;
  HolesPlayed: number;
  DivisionRank: number;
  OverallRank: number;
  BadgeType: string;
}

export async function getHotRounds(): Promise<HotRound[]> {
  const result = await fetchApi<HotRound[] | { _dev_warning: string; data: HotRound[] }>('/stats/hot-rounds');
  if ('_dev_warning' in result) {
    console.warn('[DEV]', result._dev_warning);
    return result.data;
  }
  return result;
}

// Podium Stats - Player podium finish percentages
export interface PodiumStats {
  PlayerName: string;
  SkillDivision: string;
  PodiumFinishes: number;
  TotalRounds: number;
  PodiumPercentage: number;
}

export async function getPodiumStats(): Promise<PodiumStats[]> {
  const result = await fetchApi<PodiumStats[] | { _dev_warning: string; data: PodiumStats[] }>('/stats/podium');
  if ('_dev_warning' in result) {
    console.warn('[DEV]', result._dev_warning);
    return result.data;
  }
  return result;
}

// Top Cards - Best group scores per event
export interface TopCard {
  EventName: string;
  EventDate: string;
  CardRank: number;
  CardTotal: number;
  PlayerCount: number;
  HolesPlayed: number;
  AvgScorePerHole: number;
  Players: string;
}

export async function getTopCards(): Promise<TopCard[]> {
  const result = await fetchApi<TopCard[] | { _dev_warning: string; data: TopCard[] }>('/stats/top-cards');
  if ('_dev_warning' in result) {
    console.warn('[DEV]', result._dev_warning);
    return result.data;
  }
  return result;
}

// Hole Difficulty - Hardest holes ranking
export interface HoleDifficulty {
  EventID: number;
  EventName: string;
  HoleNumber: number;
  DistanceFeet: number;
  ObstacleDescription: string;
  Elevation: number;
  IsMandatory: string;
  HasObstruction: string;
  TimesPlayed: number;
  AvgScore: number;
  DifficultyRating: string;
  SuccessRatePercent: number;
}

export async function getHoleDifficulty(): Promise<HoleDifficulty[]> {
  const result = await fetchApi<HoleDifficulty[] | { _dev_warning: string; data: HoleDifficulty[] }>('/stats/hole-difficulty');
  if ('_dev_warning' in result) {
    console.warn('[DEV]', result._dev_warning);
    return result.data;
  }
  return result;
}

// Basket Stats - Basket difficulty analysis
export interface BasketStats {
  Brand: string;
  Model: string;
  ChainCount: number;
  HasUpperBand: string;
  TimesUsed: number;
  TotalAttempts: number;
  AvgScore: number;
  ZeroScores: number;
  OneScores: number;
  TwoScores: number;
  PerfectScores: number;
  DifficultyRating: string;
  DifficultyRank: number;
}

export async function getBasketStats(): Promise<BasketStats[]> {
  const result = await fetchApi<BasketStats[] | { _dev_warning: string; data: BasketStats[] }>('/stats/basket-stats');
  if ('_dev_warning' in result) {
    console.warn('[DEV]', result._dev_warning);
    return result.data;
  }
  return result;
}

// ============================================
// EVENTS
// ============================================

export interface Event {
  EventID: number;
  EventDate: string;
  HoleCount: number;
  Name: string;
}

export async function getEvents(): Promise<Event[]> {
  return fetchApi<Event[]>('/events');
}

export async function getEvent(eventId: number): Promise<Event> {
  return fetchApi<Event>(`/events/${eventId}`);
}

export interface EventHoleStats {
  EventID: number;
  EventName: string;
  EventDate: string;
  HoleCount: number;
  HoleNumber: number;
  DistanceFeet: number;
  BasketBrand?: string;
  BasketModel?: string;
  ObstacleDescription?: string;
  AvgScore: number;
  DifficultyRating: string;
  DifficultyRank: number;
}

export async function getEventHoles(eventId: number): Promise<EventHoleStats[]> {
  return fetchApi<EventHoleStats[]>(`/events/${eventId}/holes`);
}

export interface EventLayout {
  LayoutID: number;
  HoleNumber: number;
  DistanceFeet: number;
}

export async function getEventLayout(eventId: number): Promise<EventLayout[]> {
  return fetchApi<EventLayout[]>(`/events/${eventId}/layout`);
}

export interface EventSummary {
  EventID: number;
  EventName: string;
  EventDate: string;
  HoleCount: number;
  TotalScorecards: number;
  TotalPlayers: number;
  OverallAvgScore: number;
}

export async function getEventsSummary(): Promise<EventSummary[]> {
  return fetchApi<EventSummary[]>('/events/summary');
}

// ============================================
// SCORECARDS
// ============================================

export interface Scorecard {
  ScorecardID: number;
  EventID: number;
  CreatedByPlayerID: number;
  CreatedAt: string;
  EventName?: string;
  EventDate?: string;
  HoleCount?: number;
  FirstName?: string;
  LastName?: string;
}

export interface ScorecardMember {
  ScorecardID: number;
  PlayerID: number;
  MemberPosition: number;
  FirstName: string;
  LastName: string;
  SkillDivision: string;
}

export interface Score {
  ScoreID: number;
  ScorecardID: number;
  PlayerID: number;
  HoleNumber: number;
  Strokes: number;
  RecordedAt: string;
  FirstName?: string;
  LastName?: string;
}

export interface ScorecardDetail extends Scorecard {
  members: ScorecardMember[];
  scores: Score[];
}

export async function getScorecards(): Promise<Scorecard[]> {
  return fetchApi<Scorecard[]>('/scorecards');
}

export async function getScorecard(scorecardId: number): Promise<ScorecardDetail> {
  return fetchApi<ScorecardDetail>(`/scorecards/${scorecardId}`);
}

export async function createScorecard(data: {
  eventId: number;
  createdByPlayerId: number;
}): Promise<{ NewScorecardID: number }> {
  return fetchApi<{ NewScorecardID: number }>('/scorecards', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addScorecardMembers(
  scorecardId: number,
  data: {
    player1Id?: number;
    player2Id?: number;
    player3Id?: number;
    player4Id?: number;
  }
): Promise<{ MembersAdded: number }> {
  return fetchApi<{ MembersAdded: number }>(`/scorecards/${scorecardId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function insertHoleScores(
  scorecardId: number,
  data: {
    holeNumber: number;
    player1Id: number;
    player1Score: number;
    player2Id: number;
    player2Score: number;
    player3Id: number;
    player3Score: number;
    player4Id: number;
    player4Score: number;
  }
): Promise<{ Result: string }> {
  return fetchApi<{ Result: string }>(`/scorecards/${scorecardId}/scores`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getHoleScores(scorecardId: number, holeNumber: number): Promise<Score[]> {
  return fetchApi<Score[]>(`/scorecards/${scorecardId}/scores/${holeNumber}`);
}

export async function updateScore(scoreId: number, strokes: number, playerId: number): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/scores/${scoreId}`, {
    method: 'PUT',
    body: JSON.stringify({ strokes, playerId }),
  });
}

export async function deleteScorecard(scorecardId: number, playerId: number): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/scorecards/${scorecardId}`, {
    method: 'DELETE',
    body: JSON.stringify({ playerId }),
  });
}

// ============================================
// PLAYER SCORECARDS
// ============================================

export interface PlayerScorecard extends Scorecard {
  TotalScore: number;
}

export async function getPlayerScorecards(playerId: number): Promise<PlayerScorecard[]> {
  return fetchApi<PlayerScorecard[]>(`/players/${playerId}/scorecards`);
}

// ============================================
// HEALTH CHECK
// ============================================

export async function healthCheck(): Promise<{ status: string; database: string }> {
  return fetchApi<{ status: string; database: string }>('/health');
}

