import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getPlayerStats, getGroupsByUserId, getGroupStats, getAllPlayerStats, getUserById } from '../data';

const StatsPage = () => {
  const { user } = useAuth();
  const { scorecards, events } = useData();
  const [view, setView] = useState<'personal' | 'groups'>('personal');

  if (!user) return null;

  const myStats = getPlayerStats(user.id);
  const myGroups = getGroupsByUserId(user.id);
  const myScorecards = scorecards.filter(s => s.userId === user.id && s.status === 'approved');
  const allMyStats = getAllPlayerStats(user.id);

  // Calculate event-specific stats
  const eventStats = allMyStats.filter(s => s.eventId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Statistics</h1>
        <p className="text-gray-600 mt-1">Track your disc golf performance</p>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('personal')}
            className={`px-4 py-2 rounded transition ${
              view === 'personal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Personal Stats
          </button>
          <button
            onClick={() => setView('groups')}
            className={`px-4 py-2 rounded transition ${
              view === 'groups'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Group Stats
          </button>
        </div>
      </div>

      {/* Personal Stats */}
      {view === 'personal' && myStats && (
        <div className="space-y-6">
          {/* Overall Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-3xl font-bold text-blue-600">{myStats.averageScore}</div>
              <div className="text-sm text-gray-600 mt-1">Average Score</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-green-600">{myStats.bestScore}</div>
              <div className="text-sm text-gray-600 mt-1">Best Score</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-3xl font-bold text-purple-600">{myStats.averagePerHole.toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-1">Avg Per Hole</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-3xl font-bold text-orange-600">{myStats.totalEvents}</div>
              <div className="text-sm text-gray-600 mt-1">Total Events</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Career Statistics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Rounds</div>
                  <div className="text-2xl font-bold text-gray-800">{myStats.totalRounds}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Holes Played</div>
                  <div className="text-2xl font-bold text-gray-800">{myStats.holesPlayed}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Best Score</div>
                  <div className="text-2xl font-bold text-green-600">{myStats.bestScore}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Worst Score</div>
                  <div className="text-2xl font-bold text-red-600">{myStats.worstScore}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Score Range</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {myStats.worstScore - myStats.bestScore}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Avg Per Event</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(myStats.totalRounds / myStats.totalEvents).toFixed(1)} rounds
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Performance */}
          {eventStats.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Event Performance</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {eventStats.map(stat => {
                    const event = events.find(e => e.id === stat.eventId);
                    return (
                      <div key={stat.eventId} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h3 className="font-semibold text-gray-800">{event?.name}</h3>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <div className="text-xs text-gray-600">Avg Score</div>
                            <div className="text-lg font-bold text-blue-600">{stat.averageScore}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Best</div>
                            <div className="text-lg font-bold text-green-600">{stat.bestScore}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Rounds</div>
                            <div className="text-lg font-bold text-purple-600">{stat.totalRounds}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recent Scorecards */}
          {myScorecards.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Recent Approved Scorecards</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {myScorecards.slice(0, 5).map(scorecard => {
                    const event = events.find(e => e.id === scorecard.eventId);
                    return (
                      <div key={scorecard.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium text-gray-800">{event?.name}</div>
                          <div className="text-sm text-gray-500">
                            {scorecard.submittedAt && new Date(scorecard.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{scorecard.totalScore}</div>
                          <div className="text-xs text-gray-500">{scorecard.scores.length} holes</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Group Stats */}
      {view === 'groups' && (
        <div className="space-y-6">
          {myGroups.map(group => {
            const groupStat = getGroupStats(group.id);
            const members = group.members.map(id => getUserById(id)).filter(Boolean);

            return (
              <div key={group.id} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-800">{group.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{members.length} members</p>
                </div>
                <div className="p-6">
                  {groupStat ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Group Avg Score</div>
                          <div className="text-2xl font-bold text-blue-600">{groupStat.averageScore.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Best Round</div>
                          <div className="text-2xl font-bold text-green-600">{groupStat.bestRound}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Rounds</div>
                          <div className="text-2xl font-bold text-purple-600">{groupStat.totalRounds}</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-3">Members</h3>
                        <div className="space-y-2">
                          {members.map(member => {
                            const memberStats = getPlayerStats(member!.id);
                            return (
                              <div key={member!.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <div className="font-medium text-gray-800">{member!.name}</div>
                                  <div className="text-xs text-gray-500">{member!.email}</div>
                                </div>
                                {memberStats && (
                                  <div className="text-right">
                                    <div className="font-bold text-blue-600">{memberStats.averageScore}</div>
                                    <div className="text-xs text-gray-500">avg score</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No group statistics available</p>
                  )}
                </div>
              </div>
            );
          })}

          {myGroups.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">You're not in any groups yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsPage;

