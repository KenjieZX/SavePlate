import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { 'x-auth-token': token }
      });
      setAlerts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const markAsRead = async (e, id) => {
    e.stopPropagation(); // Prevent triggering the card click
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      // Step 6: System updates notification status and removes unread
      setAlerts(alerts.map(a => a._id === id ? { ...a, isRead: true } : a));
    } catch (err) {
      alert("Error updating status");
    }
  };

  // Step 3 & 4: User clicks notification -> System opens related screen
  const handleNotificationClick = (alert) => {
    if (alert.type === 'INVENTORY') {
      navigate('/inventory'); // Navigate to item detail (simulated by going to inventory list)
    } else if (alert.type === 'MEAL') {
      navigate('/meal-plan');
    } else if (alert.type === 'DONATION') {
      navigate('/browse');
    }
  };

  // Helper for Styles based on Type
  const getTypeStyles = (type) => {
    switch (type) {
      case 'INVENTORY': return { bg: 'bg-red-50', border: 'border-red-200', icon: '⚠️', text: 'text-red-800' };
      case 'DONATION': return { bg: 'bg-purple-50', border: 'border-purple-200', icon: '🎁', text: 'text-purple-800' };
      case 'MEAL': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: '🍽️', text: 'text-blue-800' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', icon: '🔔', text: 'text-gray-800' };
    }
  };

  if (loading) return <div className="text-center mt-10">Loading alerts...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Notifications</h2>
          <p className="text-gray-500">Stay updated on expiry dates and meal plans.</p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
          {alerts.filter(a => !a.isRead).length} Unread
        </span>
      </div>

      {/* Alternative Course 1a: No Notifications */}
      {alerts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <div className="text-5xl mb-4">🔕</div>
          <p className="text-lg font-bold text-gray-600">No new notifications</p>
          <p className="text-gray-400">You are all caught up!</p>
        </div>
      ) : (
        // Step 2: System displays list of alerts
        <div className="space-y-4">
          {alerts.map(alert => {
            const style = getTypeStyles(alert.type);
            return (
              <div 
                key={alert._id} 
                onClick={() => handleNotificationClick(alert)}
                className={`relative p-4 rounded-xl border-l-4 shadow-sm transition cursor-pointer hover:shadow-md ${
                  alert.isRead ? 'bg-white border-gray-200 opacity-60' : `bg-white ${style.border}`
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${style.bg}`}>
                    {style.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-bold text-sm mb-1 ${alert.isRead ? 'text-gray-500' : 'text-gray-800'}`}>
                        {alert.type} ALERT
                      </h4>
                      <span className="text-xs text-gray-400">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${alert.isRead ? 'text-gray-400' : 'text-gray-700'}`}>
                      {alert.message}
                    </p>
                  </div>

                  {/* Step 5: Mark as Read Button */}
                  {!alert.isRead && (
                    <button 
                      onClick={(e) => markAsRead(e, alert._id)}
                      className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-emerald-600 font-bold"
                      title="Mark as Read"
                    >
                      ✓
                    </button>
                  )}
                </div>
                
                {!alert.isRead && (
                  <span className="absolute top-4 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;