import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hooks into route changes
  const [user, setUser] = useState(null);

  // Check login status whenever the route changes (e.g., after login/logout)
  useEffect(() => {
    // Safety: wrap in try-catch to prevent crashes if JSON is bad
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
      // If data is corrupt, clear it so the app works
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    // Clear data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to home or login
    navigate('/login');
  };

  return (
    <nav className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <Link to="/" className="hover:text-emerald-100 transition flex items-center gap-2">
            <span>🌱</span> SavePlate
          </Link>
        </div>

        {/* Menu Links */}
        <div className="flex items-center space-x-1 md:space-x-4 text-sm md:text-base font-medium">
          {/* Always Visible Links */}
          <Link to="/browse" className="hover:text-emerald-200 transition px-2 py-1 hidden md:block">Browse</Link>
          
          {/* Logged In Links */}
          {user && (
            <>
              <Link to="/inventory" className="hover:text-emerald-200 transition px-2 py-1">Inventory</Link>
              <Link to="/meal-plan" className="hover:text-emerald-200 transition px-2 py-1 hidden md:block">Meals</Link>
              <Link to="/analytics" className="hover:text-emerald-200 transition px-2 py-1 hidden md:block">Reports</Link>
              <Link to="/notifications" className="hover:text-emerald-200 transition px-2 py-1">Alerts</Link>
            </>
          )}

          {/* Auth Buttons Logic */}
          <div className="ml-4 pl-4 border-l border-emerald-500 flex gap-2 items-center">
            {user ? (
              <>
                <span className="hidden md:inline text-emerald-100 text-sm mr-2">
                  Hi, {user?.fullName?.split(' ')[0] || 'User'}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="bg-emerald-700 hover:bg-emerald-800 px-4 py-1.5 rounded-full transition text-sm shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-emerald-100 transition px-2 py-1">Login</Link>
                <Link to="/register" className="bg-white text-emerald-600 px-4 py-1.5 rounded-full hover:bg-emerald-50 transition shadow-sm font-bold">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;