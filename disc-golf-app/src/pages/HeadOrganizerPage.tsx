import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getPendingRenameRequests, getUserById, getGroupById } from '../data';

const HeadOrganizerPage = () => {
  const { user } = useAuth();
  const { events, renameRequests, updateRenameRequest, updateGroup } = useData();

  if (!user) return null;

  const myEvents = events.filter(e => e.headOrganizers.includes(user.id) || user.role === 'admin');
  const pendingRenames = getPendingRenameRequests();

  const handleRenameRequest = (requestId: string, approved: boolean) => {
    const request = renameRequests.find(r => r.id === requestId);
    if (request && approved) {
      updateGroup(request.groupId, { name: request.newName });
    }
    updateRenameRequest(requestId, approved ? 'approved' : 'rejected');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Head Organizer Panel</h1>
        <p className="text-gray-600 mt-1">Manage events and approve requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-gray-800">{myEvents.length}</div>
          <div className="text-sm text-gray-600">Events as Head Organizer</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">🔄</div>
          <div className="text-2xl font-bold text-red-600">{pendingRenames.length}</div>
          <div className="text-sm text-gray-600">Pending Rename Requests</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-purple-600">
            {myEvents.reduce((sum, e) => sum + e.participants.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Participants</div>
        </div>
      </div>

      {/* Rename Requests */}
      {pendingRenames.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Group Rename Requests</h2>
          </div>
          <div className="p-6 space-y-4">
            {pendingRenames.map(request => {
              const group = getGroupById(request.groupId);
              const requester = getUserById(request.requestedBy);

              return (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {group?.name} → {request.newName}
                      </h3>
                      <p className="text-sm text-gray-600">Requested by: {requester?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRenameRequest(request.id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRenameRequest(request.id, false)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">My Events</h2>
        </div>
        <div className="p-6">
          {myEvents.length > 0 ? (
            <div className="space-y-4">
              {myEvents.map(event => (
                <div key={event.id} className="border-l-4 border-red-500 pl-4 py-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{event.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                        <span>⏰ {event.time}</span>
                        <span>👥 {event.participants.length} participants</span>
                        <span>⛳ {event.numberOfHoles} holes</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded capitalize">
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No events as head organizer</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadOrganizerPage;

