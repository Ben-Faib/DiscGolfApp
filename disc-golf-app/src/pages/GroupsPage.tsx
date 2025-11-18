import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import GroupCard from '../components/GroupCard';
import { Group, getUserById, getUsersByIds } from '../data';
import { Plus, Users as UsersIcon, Search, UserCheck, X, UserPlus, AlertCircle, Check, XCircle } from 'lucide-react';

const GroupsPage = () => {
  const { user } = useAuth();
  const { groups, addGroup, updateGroup, joinRequests, updateJoinRequest } = useData();
  const [view, setView] = useState<'my-groups' | 'find-groups'>('my-groups');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  if (!user) return null;

  const myGroups = groups.filter(g => g.members.includes(user.id));
  const ownedGroups = groups.filter(g => g.ownerId === user.id);
  const otherGroups = groups.filter(g => !g.members.includes(user.id));
  const groupJoinRequests = joinRequests.filter(jr =>
    ownedGroups.some(g => g.id === jr.groupId) && jr.status === 'pending'
  );

  const handleCreateGroup = (name: string) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      ownerId: user.id,
      members: [user.id],
      createdAt: new Date().toISOString(),
    };
    addGroup(newGroup);
    setShowCreateModal(false);
  };

  const handleJoinRequest = (groupId: string) => {
    // In a real app, this would create a join request
    alert('Join request sent! (In demo, this is instant)');
    const group = groups.find(g => g.id === groupId);
    if (group && !group.members.includes(user.id)) {
      updateGroup(groupId, {
        members: [...group.members, user.id],
      });
    }
  };

  const handleLeaveGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const newMembers = group.members.filter(m => m !== user.id);
      updateGroup(groupId, {
        members: newMembers,
      });
      setSelectedGroup(null);
    }
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const newMembers = group.members.filter(m => m !== memberId);
      updateGroup(groupId, {
        members: newMembers,
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Disc Golf Groups</h1>
          <p className="text-gray-600 mt-2">Join forces with fellow disc golfers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Join Requests Notification */}
      {groupJoinRequests.length > 0 && (
        <div className="card p-6 border-2 border-accent-200 bg-gradient-to-r from-accent-50 to-green-50 animate-slide-down">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-accent-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-accent-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                {groupJoinRequests.length} Pending Join Request{groupJoinRequests.length > 1 ? 's' : ''}
              </h3>
              <p className="text-gray-600 mt-1">
                Review and respond to join requests for your groups
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">Browse Groups</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setView('my-groups')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
              view === 'my-groups'
                ? 'bg-gradient-primary text-white shadow-glow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>My Groups ({myGroups.length})</span>
          </button>
          <button
            onClick={() => setView('find-groups')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
              view === 'find-groups'
                ? 'bg-gradient-primary text-white shadow-glow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            <span>Find Groups ({otherGroups.length})</span>
          </button>
        </div>
      </div>

      {/* My Groups View */}
      {view === 'my-groups' && (
        <div className="space-y-6">
          {/* Join Requests for My Groups */}
          {groupJoinRequests.length > 0 && (
            <div className="card">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent-100 rounded-lg">
                    <UserPlus className="w-5 h-5 text-accent-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Pending Join Requests</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {groupJoinRequests.map(jr => {
                  const group = groups.find(g => g.id === jr.groupId);
                  const requester = getUserById(jr.userId);
                  return (
                    <div key={jr.id} className="p-5 border-2 border-accent-100 hover:border-accent-300 rounded-xl transition-all bg-gradient-to-r from-white to-accent-50/30">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-accent rounded-xl shadow-glow-green">
                            <UsersIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {requester?.name} wants to join {group?.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Requested {new Date(jr.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              updateJoinRequest(jr.id, 'accepted');
                              if (group && !group.members.includes(jr.userId)) {
                                updateGroup(jr.groupId, {
                                  members: [...group.members, jr.userId],
                                });
                              }
                            }}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-glow-green transition-all font-medium hover:scale-105"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => updateJoinRequest(jr.id, 'rejected')}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all font-medium hover:scale-105"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onViewDetails={() => setSelectedGroup(group)}
                isOwner={group.ownerId === user.id}
                isMember={true}
              />
            ))}
          </div>

          {myGroups.length === 0 && (
            <div className="card p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-accent rounded-full mb-4 shadow-glow-green">
                <UsersIcon className="w-10 h-10 text-white" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">You're not in any groups yet</p>
              <p className="text-gray-400 text-sm mb-6">Join or create a group to get started</p>
              <button
                onClick={() => setView('find-groups')}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Find Groups</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Find Groups View */}
      {view === 'find-groups' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onViewDetails={() => setSelectedGroup(group)}
                onJoinRequest={() => handleJoinRequest(group.id)}
                isMember={false}
              />
            ))}
          </div>

          {otherGroups.length === 0 && (
            <div className="card p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No other groups available</p>
              <p className="text-gray-400 text-sm mt-2">All groups have been discovered!</p>
            </div>
          )}
        </div>
      )}

      {/* Group Detail Modal */}
      {selectedGroup && (
        <GroupDetailModal
          group={selectedGroup}
          isOwner={selectedGroup.ownerId === user.id}
          isMember={selectedGroup.members.includes(user.id)}
          onClose={() => setSelectedGroup(null)}
          onLeave={() => handleLeaveGroup(selectedGroup.id)}
          onRemoveMember={(memberId) => handleRemoveMember(selectedGroup.id, memberId)}
        />
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
};

const GroupDetailModal = ({
  group,
  isOwner,
  isMember,
  onClose,
  onLeave,
  onRemoveMember,
}: {
  group: Group;
  isOwner: boolean;
  isMember: boolean;
  onClose: () => void;
  onLeave: () => void;
  onRemoveMember: (memberId: string) => void;
}) => {
  const owner = getUserById(group.ownerId);
  const members = getUsersByIds(group.members);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
              {isOwner && (
                <span className="inline-block text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 mt-2">
                  You own this group
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">👤</span>
                  <span>Owner: {owner?.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">👥</span>
                  <span>{group.members.length} members</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📆</span>
                  <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Members</h3>
              <div className="space-y-2">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.id === group.ownerId && (
                        <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                          Owner
                        </span>
                      )}
                      {isOwner && member.id !== group.ownerId && (
                        <button
                          onClick={() => onRemoveMember(member.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isMember && !isOwner && (
              <button
                onClick={onLeave}
                className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Leave Group
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateGroupModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) => {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      onCreate(groupName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="card max-w-md w-full animate-scale-in">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold gradient-text">Create New Group</h2>
              <p className="text-gray-600 mt-1">Start your disc golf crew</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Group Name *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="input-modern pl-12"
                  placeholder="e.g., Weekend Warriors"
                />
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
                Create Group
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;

