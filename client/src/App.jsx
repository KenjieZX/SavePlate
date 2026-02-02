import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Navbar from './Navbar';
import Inventory from './Inventory';
import Register from './Register';
import Login from './Login';
import Browse from './Browse';
import Analytics from './Analytics';
import Notifications from './Notifications';
import MealPlanner from './MealPlanner';

// function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
        
//         {/* Navigation Bar */}
//         <nav className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
//           <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center">
//             {/* Logo */}
//             <div className="text-2xl font-bold tracking-wide flex items-center gap-2">
//               <Link to="/" className="hover:text-emerald-100 transition flex items-center gap-2">
//                 <span>🌱</span> SavePlate
//               </Link>
//             </div>

//             {/* Menu Links */}
//             <div className="flex items-center space-x-1 md:space-x-4 text-sm md:text-base font-medium">
//               <Link to="/inventory" className="hover:text-emerald-200 transition px-2 py-1">Inventory</Link>
//               <Link to="/browse" className="hover:text-emerald-200 transition px-2 py-1 hidden md:block">Browse</Link>
//               <Link to="/meal-plan" className="hover:text-emerald-200 transition px-2 py-1 hidden md:block">Meals</Link>
//               <Link to="/analytics" className="hover:text-emerald-200 transition px-2 py-1 hidden md:block">Reports</Link>
//               <Link to="/notifications" className="hover:text-emerald-200 transition px-2 py-1">Alerts</Link>
              
//               {/* Auth Buttons */}
//               <div className="ml-4 pl-4 border-l border-emerald-500 flex gap-2">
//                 <Link to="/login" className="hover:text-emerald-100 transition px-2 py-1">Login</Link>
//                 <Link to="/register" className="bg-white text-emerald-600 px-4 py-1.5 rounded-full hover:bg-emerald-50 transition shadow-sm font-bold">
//                   Register
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </nav>

//         {/* Main Content Area */}
//         <main className="container mx-auto px-6 py-8 flex-grow">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/inventory" element={<Inventory />} />
//             <Route path="/browse" element={<Browse />} />
//             <Route path="/analytics" element={<Analytics />} />
//             <Route path="/notifications" element={<Notifications />} />
//             <Route path="/meal-plan" element={<MealPlanner />} />
//           </Routes>
//         </main>

//         <footer className="bg-gray-800 text-gray-400 py-8 text-center mt-auto">
//           <div className="container mx-auto">
//             <p className="mb-2">&copy; 2026 SavePlate Project. All rights reserved.</p>
//             <p className="text-xs text-gray-600">Assignment 1 - BIT301</p>
//           </div>
//         </footer>
//       </div>
//     </Router>
//   );
// }

// export default App;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
        
        {/* The Smart Navbar handles its own logic now */}
        <Navbar />

        {/* Main Content Area */}
        <main className="container mx-auto px-6 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Pages (Ideally wrap these in a ProtectedRoute later) */}
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/meal-plan" element={<MealPlanner />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-gray-400 py-8 text-center mt-auto">
          <div className="container mx-auto">
            <p className="mb-2">&copy; 2026 SavePlate Project. All rights reserved.</p>
            {/* <p className="text-xs text-gray-600">Assignment 1 - BIT301</p> */}
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;