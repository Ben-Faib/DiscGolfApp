import { useState } from 'react';
import { useData } from '../context/DataContext';
import { mockUsers, getPendingEventRequests } from '../data';

const AdminPage = () => {
  const { events, updateEvent } = useData();
  const [selectedTab, setSelectedTab] = useState<'users' | 'events'>('users');

  const pendingEvents = getPendingEventRequests();

  const handleEventRequest = (eventId: string, approved: boolean) => {
    updateEvent(eventId, {
      requestStatus: approved ? 'approved' : 'rejected',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage users and system settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-gray-800">{mockUsers.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-blue-600">{events.length}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-2xl font-bold text-orange-600">{pendingEvents.length}</div>
          <div className="text-sm text-gray-600">Pending Events</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-2xl font-bold text-purple-600">
            {mockUsers.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-4 py-2 rounded transition ${
              selectedTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Users ({mockUsers.length})
          </button>
          <button
            onClick={() => setSelectedTab('events')}
            className={`px-4 py-2 rounded transition ${
              selectedTab === 'events'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Event Requests ({pendingEvents.length})
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">User Management</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(user => {
                    const roleColors = {
                      admin: 'bg-purple-100 text-purple-800',
                      head_organizer: 'bg-red-100 text-red-800',
                      organizer: 'bg-orange-100 text-orange-800',
                      player: 'bg-blue-100 text-blue-800',
                    };

                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${roleColors[user.role]}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-sm text-blue-600 hover:text-blue-700">
                            Edit Role
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Event Requests Tab */}
      {selectedTab === 'events' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Pending Event Requests</h2>
          </div>
          <div className="p-6">
            {pendingEvents.length > 0 ? (
              <div className="space-y-4">
                {pendingEvents.map(event => {
                  const creator = mockUsers.find(u => u.id === event.createdBy);

                  return (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg">{event.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <div className="mt-3 space-y-1">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Location:</span> {event.location}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Date:</span>{' '}
                              {new Date(event.date).toLocaleDateString()} at {event.time}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Holes:</span> {event.numberOfHoles}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Requested by:</span> {creator?.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEventRequest(event.id, true)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleEventRequest(event.id, false)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pending event requests</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

