import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // COLORS for the Pie Chart
  const COLORS = ['#059669', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/analytics', {
        headers: { 'x-auth-token': token }
      });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading Reports...</div>;

  // --- ALTERNATIVE COURSE 3a: EMPTY STATE ---
  if (!data || !data.hasHistory) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-white border border-dashed border-gray-300 rounded-xl text-center">
        <div className="text-6xl mb-4">📉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Yet</h2>
        <p className="text-gray-500 mb-6">
          Start logging your food to see your impact! Mark items as "Used" or "Donate" them to generate reports.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/inventory" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700">
            Go to Inventory
          </Link>
        </div>
      </div>
    );
  }

  // --- TYPICAL COURSE: DASHBOARD ---
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Impact Analytics</h2>
      <p className="text-gray-500 mb-8">Visualizing your food waste reduction journey.</p>

      {/* TOP CARDS (System Response 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500">
          <h3 className="text-gray-500 font-bold uppercase text-xs">Total Food Saved (Used)</h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">{data.totalSaved} Items</p>
          <p className="text-sm text-green-600 mt-1">Keep it up! 🌿</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <h3 className="text-gray-500 font-bold uppercase text-xs">Donations Contributed</h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">{data.totalDonated} Items</p>
          <p className="text-sm text-purple-600 mt-1">Helping the community 🤝</p>
        </div>
      </div>

      {/* CHARTS (System Response 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: CATEGORY BREAKDOWN */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="font-bold text-lg mb-6 text-gray-700">Consumption by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: RECENT ACTIVITY LOG */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="font-bold text-lg mb-6 text-gray-700">Recent Activity Log</h3>
          <div className="space-y-4">
            {data.recentActivity.map((log, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${log.action === 'USED' ? 'bg-emerald-500' : 'bg-purple-500'}`}></span>
                  <div>
                    <p className="font-bold text-gray-800">{log.name}</p>
                    <p className="text-xs text-gray-500">{log.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  log.action === 'USED' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;


// import React from 'react';

// const Analytics = () => {
//   return (
//     <div className="max-w-4xl mx-auto">
//       <h2 className="text-3xl font-bold text-gray-800 mb-2">Impact Reports</h2>
//       <p className="text-gray-500 mb-8">Track your food saving journey.</p>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
//         <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
//           <h3 className="text-lg opacity-90">Total Food Saved</h3>
//           <p className="text-5xl font-bold my-2">12 kg</p>
//           <p className="text-sm opacity-80">Since January 2026</p>
//         </div>
//         <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
//           <h3 className="text-lg text-gray-500">Donations Made</h3>
//           <p className="text-5xl font-bold text-gray-800 my-2">5</p>
//           <p className="text-sm text-green-600 font-medium">Top 10% of users!</p>
//         </div>
//       </div>

//       {/* Progress Indicators (Visual Reports) */}
//       <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
//         <h3 className="font-bold text-xl mb-6">Waste Reduction Goals</h3>
        
//         <div className="mb-6">
//           <div className="flex justify-between mb-1">
//             <span className="text-sm font-medium text-gray-700">Weekly Goal (Save 5 items)</span>
//             <span className="text-sm font-medium text-emerald-600">80%</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2.5">
//             <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
//           </div>
//         </div>

//         <div>
//           <div className="flex justify-between mb-1">
//             <span className="text-sm font-medium text-gray-700">Donation Streak</span>
//             <span className="text-sm font-medium text-blue-600">3 Days</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2.5">
//             <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Analytics;