import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    householdSize: 1,
    enable2FA: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // 1. Send data to your new Backend Auth Route
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      // 2. Handle Success or Failure
      if (res.ok) {
        // Auto-Login: Save the token immediately
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert("Registration Successful! Redirecting...");
        navigate('/inventory'); // Send them straight to the app
      } else {
        // Show error from backend (e.g. "User already exists")
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server Error. Is the backend running?");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">Create Account</h2>
      
      {/* Error Message Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input name="fullName" type="text" onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input name="email" type="email" onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input name="password" type="password" onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Household Size</label>
          <input name="householdSize" type="number" min="1" value={formData.householdSize} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" />
          <p className="text-xs text-gray-500 mt-1">Used for meal planning suggestions.</p>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <input name="enable2FA" type="checkbox" checked={formData.enable2FA} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded" />
          <label className="text-sm text-gray-700">Enable 2FA (Privacy Settings)</label>
        </div>

        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition">
          Sign Up
        </button>
      </form>
      
      <p className="text-center text-gray-600 mt-4 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-600 font-bold hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;