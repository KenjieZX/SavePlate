// import React from 'react';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

// const Home = () => {
//   return (
//     <div className="flex flex-col items-center">
      
//       {/* Hero Section */}
//       <div className="text-center max-w-3xl mt-12 mb-16">
//         <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
//           Stop Waste. <span className="text-emerald-600">Save Food.</span> <br/> Save the Planet.
//         </h1>
//         <p className="text-xl text-gray-600 mb-10 leading-relaxed">
//           SavePlate helps households reduce food waste through intelligent inventory management, 
//           expiry alerts, and community donations.
//         </p>
//         <div className="flex gap-4 justify-center">
//           <Link to="/register" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-emerald-700 transition shadow-lg transform hover:-translate-y-1">
//             Get Started
//           </Link>
//           <Link to="/browse" className="bg-white text-emerald-700 border-2 border-emerald-100 px-8 py-3 rounded-full font-bold text-lg hover:border-emerald-600 hover:bg-emerald-50 transition">
//             Browse Donations
//           </Link>
//         </div>
//       </div>

//       {/* Feature Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
//         <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
//           <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🍎</div>
//           <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Inventory</h3>
//           <p className="text-gray-600">Track what you buy and receive notifications before items expire.</p>
//         </div>
        
//         <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
//           <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🤝</div>
//           <h3 className="text-xl font-bold text-gray-800 mb-2">Community Donation</h3>
//           <p className="text-gray-600">Easily share surplus food with neighbors or local charities.</p>
//         </div>
        
//         <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
//           <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📅</div>
//           <h3 className="text-xl font-bold text-gray-800 mb-2">Meal Planning</h3>
//           <p className="text-gray-600">Plan weekly meals based on what you already have in your kitchen.</p>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default Home;


const Home = () => {
  const [user, setUser] = useState(null);

  // Check login status on load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Error loading user:", err);
      localStorage.removeItem('user'); // Clean up bad data
    }
  }, []);

  // --- VIEW 1: FOR LOGGED IN USERS (Dashboard) ---
  if (user) {
    return (
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-lg mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
          <div>
            {/* SAFETY CHECK: Use ?. and || to prevent crashes */}
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Friend'}! 👋
            </h1>
            <p className="text-emerald-100">You are making a difference. Here is what's happening in your kitchen.</p>
          </div>
          <Link to="/inventory" className="mt-4 md:mt-0 bg-white text-emerald-700 px-6 py-2 rounded-full font-bold shadow hover:bg-emerald-50 transition">
            View My Inventory
          </Link>
        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action 1 */}
          <Link to="/inventory" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition hover:border-emerald-200">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">🍎</div>
            <h3 className="font-bold text-lg text-gray-800">Add Food Item</h3>
            <p className="text-sm text-gray-500 mt-1">Just bought groceries? Log them now to track expiry.</p>
          </Link>

          {/* Action 2 */}
          <Link to="/meal-plan" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition hover:border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📅</div>
            <h3 className="font-bold text-lg text-gray-800">Plan This Week</h3>
            <p className="text-sm text-gray-500 mt-1">Decide what to eat based on what is expiring soon.</p>
          </Link>

          {/* Action 3 */}
          <Link to="/analytics" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition hover:border-purple-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">📊</div>
            <h3 className="font-bold text-lg text-gray-800">Check Impact</h3>
            <p className="text-sm text-gray-500 mt-1">See how much food and money you have saved this month.</p>
          </Link>
        </div>
      </div>
    );
  }

  // --- VIEW 2: FOR GUESTS (Marketing Landing) ---
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mt-12 mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Stop Waste. <span className="text-emerald-600">Save Food.</span> <br/> Save the Planet.
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          SavePlate helps households reduce food waste through intelligent inventory management, 
          expiry alerts, and community donations.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-emerald-700 transition shadow-lg transform hover:-translate-y-1">
            Get Started
          </Link>
          <Link to="/browse" className="bg-white text-emerald-700 border-2 border-emerald-100 px-8 py-3 rounded-full font-bold text-lg hover:border-emerald-600 hover:bg-emerald-50 transition">
            Browse Donations
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🍎</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Inventory</h3>
          <p className="text-gray-600">Track what you buy and receive notifications before items expire.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🤝</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Community Donation</h3>
          <p className="text-gray-600">Share surplus food with neighbors or local charities.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Meal Planning</h3>
          <p className="text-gray-600">Plan weekly meals based on what you already have in your kitchen.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;