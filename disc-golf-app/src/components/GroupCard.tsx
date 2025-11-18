import { Group } from '../data/types';
import { getUserById } from '../data';
import { Users, Crown, UserCheck, Calendar, Eye, UserPlus } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  onViewDetails?: () => void;
  onJoinRequest?: () => void;
  isOwner?: boolean;
  isMember?: boolean;
}

const GroupCard = ({ group, onViewDetails, onJoinRequest, isOwner, isMember }: GroupCardProps) => {
  const owner = getUserById(group.ownerId);

  return (
    <div className="group card overflow-hidden hover:scale-[1.02] animate-fade-in relative">
      {/* Header with Gradient */}
      <div className="h-24 bg-gradient-to-br from-accent-400 via-primary-400 to-secondary-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Users className="w-12 h-12 text-white/30" />
        </div>
        
        {/* Badge */}
        {(isOwner || isMember) && (
          <div className="absolute top-3 right-3">
            {isOwner && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-glow-purple">
                <Crown className="w-3 h-3" />
                <span>Owner</span>
              </div>
            )}
            {isMember && !isOwner && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-glow">
                <UserCheck className="w-3 h-3" />
                <span>Member</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors line-clamp-1">
          {group.name}
        </h3>

        {/* Info Section */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Crown className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Owner</div>
              <div className="text-sm font-medium text-gray-900">{owner?.name}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Users className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Members</div>
                <div className="text-sm font-medium text-gray-900">{group.members.length} active</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {group.eventId && (
            <div className="px-3 py-2 bg-accent-50 rounded-lg border border-accent-200">
              <div className="text-xs text-accent-700 font-medium">🎯 Active Event Group</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 border-2 border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all hover:border-primary-400 font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Details</span>
            </button>
          )}
          {onJoinRequest && !isMember && (
            <button
              onClick={onJoinRequest}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-accent text-white rounded-xl hover:shadow-glow-green transition-all font-medium hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;

