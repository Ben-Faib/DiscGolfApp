import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const navigate = useNavigate();

  if (!user) return null;

  const myNotifications = notifications.filter(n => n.userId === user.id);
  const unreadNotifications = myNotifications.filter(n => !n.read);
  const readNotifications = myNotifications.filter(n => n.read);

  const handleNotificationClick = (notificationId: string, actionUrl?: string) => {
    markNotificationAsRead(notificationId);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invite':
        return '📨';
      case 'join_request':
        return '👥';
      case 'scorecard_review':
        return '📝';
      case 'event_update':
        return '📅';
      case 'group_update':
        return '🔄';
      default:
        return '🔔';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-600 mt-1">
          Stay updated with your disc golf activities
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-3xl font-bold text-blue-600">{unreadNotifications.length}</span>
              <span className="text-gray-600 ml-2">unread</span>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <span className="text-3xl font-bold text-gray-400">{readNotifications.length}</span>
              <span className="text-gray-600 ml-2">read</span>
            </div>
          </div>
          {unreadNotifications.length > 0 && (
            <button
              onClick={() => {
                unreadNotifications.forEach(n => markNotificationAsRead(n.id));
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Unread Notifications</h2>
          </div>
          <div className="divide-y">
            {unreadNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Read Notifications</h2>
          </div>
          <div className="divide-y">
            {readNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => {
                  if (notification.actionUrl) {
                    navigate(notification.actionUrl);
                  }
                }}
                className={`p-6 ${notification.actionUrl ? 'hover:bg-gray-50 cursor-pointer' : ''} transition opacity-60`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {myNotifications.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-2">
            You'll see updates about events, groups, and scorecards here
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

