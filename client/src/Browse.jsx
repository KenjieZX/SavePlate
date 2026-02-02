import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Browse = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. SYSTEM RESPONSE: Filtering Options
  const [filters, setFilters] = useState({
    type: 'All',        // Inventory vs Donation
    category: 'All',    // Fresh, Canned, etc.
    storage: 'All',     // Fridge, Pantry, etc.
    sortBy: 'expiry'    // Expiry Date sorting
  });

  const [selectedItem, setSelectedItem] = useState(null);
  
  // Donation Logic State
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [donateDetails, setDonateDetails] = useState({ pickupLocation: '', availability: '' });

  useEffect(() => {
    fetchBrowseData();
  }, []);

  const fetchBrowseData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/inventory/browse', {
        headers: { 'x-auth-token': token }
      });
      setItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching browse data", err);
      setLoading(false);
    }
  };

  // --- ACTIONS (Step 7) ---

  const handleMarkUsed = async (id) => {
    if (!window.confirm("Mark this item as consumed/used? It will be removed from inventory.")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setItems(items.filter(i => i._id !== id));
      setSelectedItem(null); 
      alert("Item marked as used!");
    } catch (err) {
      alert("Error updating status");
    }
  };

  // Alternative 7a: System prompts for additional details to create a food donation
  const handleDonateSubmit = async () => {
    // Validation to ensure details are provided as per requirement
    if(!donateDetails.pickupLocation || !donateDetails.availability) {
      alert("Please provide Pickup Location and Availability to create this donation.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/inventory/${selectedItem._id}/donate`, donateDetails, {
        headers: { 'x-auth-token': token }
      });
      
      setItems(items.map(i => i._id === selectedItem._id ? { ...i, displayType: 'Donation', ...donateDetails } : i));
      setShowDonateForm(false);
      setSelectedItem(null);
      alert("Item successfully flagged for donation!"); // Step 8: System updates item status
    } catch (err) {
      alert("Error processing donation");
    }
  };

  const handlePlanMeal = () => {
    navigate('/meal-plan');
  };

  const handleClaim = async (item) => {
    // 1. Show details first (Simulation of "Contacting/Locating")
    const confirm = window.confirm(
      `Claim this item?\n\nPickup Location: ${item.pickupLocation}\nAvailability: ${item.availability}\n\nClick OK to add this to your Inventory.`
    );

    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      // 2. Call the backend to transfer ownership
      await axios.put(`http://localhost:5000/api/inventory/${item._id}/claim`, {}, {
        headers: { 'x-auth-token': token }
      });

      // 3. Update UI: Remove the item from the Browse list
      setItems(items.filter(i => i._id !== item._id));
      alert("Success! Item added to your 'My Stock' tab.");
      
      // Optional: Redirect to inventory to see it
      navigate('/inventory');

    } catch (err) {
      alert(err.response?.data?.msg || "Error claiming item");
    }
  };

  // --- FILTER LOGIC ---
  const getFilteredItems = () => {
    let result = items;

    if (filters.type !== 'All') {
      result = result.filter(item => item.displayType === filters.type);
    }
    if (filters.category !== 'All') {
      result = result.filter(item => item.category === filters.category);
    }
    if (filters.storage !== 'All') {
      result = result.filter(item => item.storageLocation && item.storageLocation.toLowerCase().includes(filters.storage.toLowerCase()));
    }

    if (filters.sortBy === 'expiry') {
      result.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    } else if (filters.sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  };

  const filteredItems = getFilteredItems();

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4">
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Browse Food Items</h2>
        <p className="text-gray-500">Manage your stock and discover community donations.</p>
      </div>

      {/* FILTERING OPTIONS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">List Type</label>
          <select 
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="All">All Items</option>
            <option value="Inventory">My Inventory</option>
            <option value="Donation">Donations</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
          <select 
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="All">All Categories</option>
            <option value="Fresh">Fresh Produce</option>
            <option value="Canned">Canned Goods</option>
            <option value="Frozen">Frozen</option>
            <option value="Dry">Dry Goods</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Storage</label>
          <select 
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            value={filters.storage}
            onChange={(e) => setFilters({...filters, storage: e.target.value})}
          >
            <option value="All">Any Location</option>
            <option value="fridge">Fridge</option>
            <option value="freezer">Freezer</option>
            <option value="pantry">Pantry</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sort By</label>
          <select 
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
          >
            <option value="expiry">Expiry Date (Soonest)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* DISPLAY ITEM LIST OR ALTERNATIVE MESSAGE */}
      {filteredItems.length === 0 ? (
        // Alternative 4a: Display specific message if no items found
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <p className="text-xl font-bold text-gray-600 mb-2">No items found.</p>
          <p className="text-gray-500">Please adjust your filters.</p>
          <button 
            onClick={() => setFilters({ type: 'All', category: 'All', storage: 'All', sortBy: 'expiry' })}
            className="mt-4 text-emerald-600 font-bold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div 
              key={item._id} 
              onClick={() => { setSelectedItem(item); setShowDonateForm(false); }} 
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-emerald-600 transition">{item.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full font-bold ${item.displayType === 'Donation' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {item.displayType}
                </span>
              </div>
              <p className="text-sm text-gray-600">👤 {item.ownerName}</p>
              <p className={`text-sm ${new Date(item.expiryDate) < new Date() ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                📅 {new Date(item.expiryDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-400 mt-2 text-right text-xs">Click for details →</p>
            </div>
          ))}
        </div>
      )}

      {/* DETAILS MODAL & ACTIONS */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            
            <div className={`p-6 ${selectedItem.displayType === 'Donation' ? 'bg-purple-600' : 'bg-emerald-600'} text-white`}>
              <h3 className="text-2xl font-bold">{selectedItem.name}</h3>
              <p className="opacity-90">{selectedItem.displayType} • Owned by {selectedItem.ownerName}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase font-bold">Category</p>
                  <p className="text-gray-800">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-bold">Quantity</p>
                  <p className="text-gray-800">{selectedItem.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-bold">Expiry Date</p>
                  <p className="text-gray-800">{new Date(selectedItem.expiryDate).toDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-bold">Storage</p>
                  <p className="text-gray-800">{selectedItem.storageLocation || 'Not specified'}</p>
                </div>
              </div>

              {selectedItem.displayType === 'Donation' && (
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                   <p className="text-sm font-bold text-gray-700">📍 Pickup: {selectedItem.pickupLocation}</p>
                   <p className="text-sm font-bold text-gray-700">🕒 Availability: {selectedItem.availability}</p>
                 </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="mt-8 pt-4 border-t">
                {selectedItem.ownerName === 'Me' ? (
                  <>
                    {!showDonateForm ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm font-bold text-gray-500 mb-1">Actions:</p>
                        <button onClick={() => handleMarkUsed(selectedItem._id)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition">
                          ✅ Mark as Used
                        </button>
                        <button onClick={handlePlanMeal} className="w-full bg-blue-50 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-100 transition">
                          📅 Plan for Meal
                        </button>
                        <button onClick={() => setShowDonateForm(true)} className="w-full bg-purple-50 text-purple-600 py-3 rounded-lg font-bold hover:bg-purple-100 transition">
                          🎁 Flag for Donation
                        </button>
                      </div>
                    ) : (
                      // Alternative 7a: Form prompts for details (Location/Availability)
                      <div className="bg-purple-50 p-4 rounded-xl animate-fade-in">
                        <h4 className="font-bold text-purple-700 mb-2">Create Food Donation</h4>
                        <p className="text-xs text-gray-600 mb-3">Please provide pickup details as required.</p>
                        
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pickup Location</label>
                        <input 
                          className="w-full border p-2 rounded mb-2 text-sm" 
                          placeholder="e.g. Front Lobby"
                          value={donateDetails.pickupLocation}
                          onChange={e => setDonateDetails({...donateDetails, pickupLocation: e.target.value})}
                        />
                        
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Availability</label>
                        <input 
                          className="w-full border p-2 rounded mb-3 text-sm" 
                          placeholder="e.g. Weekdays 9am-5pm"
                          value={donateDetails.availability}
                          onChange={e => setDonateDetails({...donateDetails, availability: e.target.value})}
                        />
                        
                        <div className="flex gap-2">
                          <button onClick={handleDonateSubmit} className="flex-1 bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 transition">Confirm Donation</button>
                          <button onClick={() => setShowDonateForm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button onClick={() => handleClaim(selectedItem)} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
                    📞 Contact to Claim
                  </button>
                )}
              </div>
            </div>
            
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Browse;

// const Browse = () => {
//   const navigate = useNavigate();
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // 1. SYSTEM RESPONSE: Filtering Options
//   const [filters, setFilters] = useState({
//     type: 'All',        // Inventory vs Donation
//     category: 'All',    // Fresh, Canned, etc.
//     storage: 'All',     // Fridge, Pantry, etc.
//     sortBy: 'expiry'    // Expiry Date sorting
//   });

//   // Modal State for "User clicks on an item for more info" (Step 5)
//   const [selectedItem, setSelectedItem] = useState(null);
  
//   // Donation Logic State
//   const [showDonateForm, setShowDonateForm] = useState(false);
//   const [donateDetails, setDonateDetails] = useState({ pickupLocation: '', availability: '' });

//   useEffect(() => {
//     fetchBrowseData();
//   }, []);

//   const fetchBrowseData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get('http://localhost:5000/api/inventory/browse', {
//         headers: { 'x-auth-token': token }
//       });
//       setItems(res.data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching browse data", err);
//       setLoading(false);
//     }
//   };

//   // --- ACTIONS (Step 7) ---

//   // Action: Mark as Used (Consumed)
//   const handleMarkUsed = async (id) => {
//     if (!window.confirm("Mark this item as consumed/used? It will be removed from inventory.")) return;
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
//         headers: { 'x-auth-token': token }
//       });
//       setItems(items.filter(i => i._id !== id));
//       setSelectedItem(null); // Close modal
//       alert("Item marked as used!");
//     } catch (err) {
//       alert("Error updating status");
//     }
//   };

//   // Action: Flag for Donation
//   const handleDonateSubmit = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(`http://localhost:5000/api/inventory/${selectedItem._id}/donate`, donateDetails, {
//         headers: { 'x-auth-token': token }
//       });
//       // Refresh local data to show it as a Donation now
//       setItems(items.map(i => i._id === selectedItem._id ? { ...i, displayType: 'Donation', ...donateDetails } : i));
//       setShowDonateForm(false);
//       setSelectedItem(null);
//       alert("Item flagged for donation!");
//     } catch (err) {
//       alert("Error processing donation");
//     }
//   };

//   // Action: Plan for Meal
//   const handlePlanMeal = () => {
//     // Redirect to meal planner
//     navigate('/meal-plan');
//   };

//   // Action: Claim (For other people's donations)
//   const handleClaim = (item) => {
//     alert(`To claim this, please visit: ${item.pickupLocation}\n\nAvailable: ${item.availability}`);
//   };

//   // --- FILTER LOGIC (Step 3) ---
//   const getFilteredItems = () => {
//     let result = items;

//     // Filter by Type
//     if (filters.type !== 'All') {
//       result = result.filter(item => item.displayType === filters.type);
//     }
//     // Filter by Category
//     if (filters.category !== 'All') {
//       result = result.filter(item => item.category === filters.category);
//     }
//     // Filter by Storage (Simple text check)
//     if (filters.storage !== 'All') {
//       result = result.filter(item => item.storageLocation && item.storageLocation.toLowerCase().includes(filters.storage.toLowerCase()));
//     }

//     // Sort
//     if (filters.sortBy === 'expiry') {
//       result.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
//     }

//     return result;
//   };

//   const filteredItems = getFilteredItems();

//   if (loading) return <div className="text-center mt-10">Loading...</div>;

//   return (
//     <div className="max-w-6xl mx-auto px-4">
      
//       {/* HEADER */}
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold text-gray-800">Browse Food Items</h2>
//         <p className="text-gray-500">Manage your stock and discover community donations.</p>
//       </div>

//       {/* STEP 2: DISPLAY FILTERING OPTIONS */}
//       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        
//         {/* Type Filter */}
//         <div>
//           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">List Type</label>
//           <select 
//             className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
//             value={filters.type}
//             onChange={(e) => setFilters({...filters, type: e.target.value})}
//           >
//             <option value="All">All Items</option>
//             <option value="Inventory">My Inventory</option>
//             <option value="Donation">Donations</option>
//           </select>
//         </div>

//         {/* Category Filter */}
//         <div>
//           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
//           <select 
//             className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
//             value={filters.category}
//             onChange={(e) => setFilters({...filters, category: e.target.value})}
//           >
//             <option value="All">All Categories</option>
//             <option value="Fresh">Fresh Produce</option>
//             <option value="Canned">Canned Goods</option>
//             <option value="Frozen">Frozen</option>
//             <option value="Dry">Dry Goods</option>
//           </select>
//         </div>

//         {/* Storage Filter (Simplified) */}
//         <div>
//           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Storage</label>
//           <select 
//             className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
//             value={filters.storage}
//             onChange={(e) => setFilters({...filters, storage: e.target.value})}
//           >
//             <option value="All">Any Location</option>
//             <option value="fridge">Fridge</option>
//             <option value="freezer">Freezer</option>
//             <option value="pantry">Pantry</option>
//           </select>
//         </div>

//         {/* Sort */}
//         <div>
//           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sort By</label>
//           <select 
//             className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
//             value={filters.sortBy}
//             onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
//           >
//             <option value="expiry">Expiry Date (Soonest)</option>
//             <option value="name">Name (A-Z)</option>
//           </select>
//         </div>
//       </div>

//       {/* STEP 4: DISPLAY FULL ITEM LIST */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {filteredItems.map(item => (
//           <div 
//             key={item._id} 
//             onClick={() => { setSelectedItem(item); setShowDonateForm(false); }} // STEP 5: Click for more info
//             className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition cursor-pointer group"
//           >
//             <div className="flex justify-between items-start mb-2">
//               <h3 className="font-bold text-lg text-gray-800 group-hover:text-emerald-600 transition">{item.name}</h3>
//               <span className={`px-2 py-1 text-xs rounded-full font-bold ${item.displayType === 'Donation' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
//                 {item.displayType}
//               </span>
//             </div>
//             <p className="text-sm text-gray-600">👤 {item.ownerName}</p>
//             <p className={`text-sm ${new Date(item.expiryDate) < new Date() ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
//               📅 {new Date(item.expiryDate).toLocaleDateString()}
//             </p>
//             <p className="text-sm text-gray-400 mt-2 text-right text-xs">Click for details →</p>
//           </div>
//         ))}
//       </div>

//       {/* STEP 6 & 7: FULL ITEM DETAILS MODAL & ACTIONS */}
//       {selectedItem && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            
//             {/* Modal Header */}
//             <div className={`p-6 ${selectedItem.displayType === 'Donation' ? 'bg-purple-600' : 'bg-emerald-600'} text-white`}>
//               <h3 className="text-2xl font-bold">{selectedItem.name}</h3>
//               <p className="opacity-90">{selectedItem.displayType} • Owned by {selectedItem.ownerName}</p>
//             </div>

//             {/* Modal Body (Full Details) */}
//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-500 uppercase font-bold">Category</p>
//                   <p className="text-gray-800">{selectedItem.category}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 uppercase font-bold">Quantity</p>
//                   <p className="text-gray-800">{selectedItem.quantity}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 uppercase font-bold">Expiry Date</p>
//                   <p className="text-gray-800">{new Date(selectedItem.expiryDate).toDateString()}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 uppercase font-bold">Storage</p>
//                   <p className="text-gray-800">{selectedItem.storageLocation || 'Not specified'}</p>
//                 </div>
//               </div>

//               {selectedItem.displayType === 'Donation' && (
//                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
//                    <p className="text-sm font-bold text-gray-700">📍 Pickup: {selectedItem.pickupLocation}</p>
//                    <p className="text-sm font-bold text-gray-700">🕒 Availability: {selectedItem.availability}</p>
//                  </div>
//               )}

//               {/* ACTION BUTTONS (Step 7) */}
//               <div className="mt-8 pt-4 border-t">
                
//                 {/* View: If I own the item */}
//                 {selectedItem.ownerName === 'Me' ? (
//                   <>
//                     {!showDonateForm ? (
//                       <div className="flex flex-col gap-3">
//                         <p className="text-sm font-bold text-gray-500 mb-1">Actions:</p>
//                         <button onClick={() => handleMarkUsed(selectedItem._id)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition">
//                           ✅ Mark as Used
//                         </button>
//                         <button onClick={handlePlanMeal} className="w-full bg-blue-50 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-100 transition">
//                           📅 Plan for Meal
//                         </button>
//                         <button onClick={() => setShowDonateForm(true)} className="w-full bg-purple-50 text-purple-600 py-3 rounded-lg font-bold hover:bg-purple-100 transition">
//                           🎁 Flag for Donation
//                         </button>
//                       </div>
//                     ) : (
//                       // Sub-Form for Donation
//                       <div className="bg-purple-50 p-4 rounded-xl animate-fade-in">
//                         <h4 className="font-bold text-purple-700 mb-3">Donation Details</h4>
//                         <input 
//                           className="w-full border p-2 rounded mb-2" 
//                           placeholder="Pickup Location"
//                           value={donateDetails.pickupLocation}
//                           onChange={e => setDonateDetails({...donateDetails, pickupLocation: e.target.value})}
//                         />
//                         <input 
//                           className="w-full border p-2 rounded mb-3" 
//                           placeholder="Availability (e.g. 9am-5pm)"
//                           value={donateDetails.availability}
//                           onChange={e => setDonateDetails({...donateDetails, availability: e.target.value})}
//                         />
//                         <div className="flex gap-2">
//                           <button onClick={handleDonateSubmit} className="flex-1 bg-purple-600 text-white py-2 rounded font-bold">Confirm</button>
//                           <button onClick={() => setShowDonateForm(false)} className="px-4 py-2 text-gray-500">Cancel</button>
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   // View: If it is a Community Donation
//                   <button onClick={() => handleClaim(selectedItem)} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
//                     📞 Contact to Claim
//                   </button>
//                 )}
//               </div>
//             </div>
            
//             {/* Close Modal */}
//             <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold">✕</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Browse;

// const Browse = () => {
//   const navigate = useNavigate();
//   const [items, setItems] = useState([]);
//   const [filter, setFilter] = useState('All');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBrowseData();
//   }, []);

//   const fetchBrowseData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.get('http://localhost:5000/api/inventory/browse', {
//         headers: { 'x-auth-token': token }
//       });
//       setItems(res.data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching browse data", err);
//       setLoading(false);
//     }
//   };

//   const handleClaim = (item) => {
//     if (item.ownerName === 'Me') {
//       navigate('/inventory'); // Go to manage it
//     } else {
//       alert(`To claim this, please visit: ${item.pickupLocation}\n\nAvailable: ${item.availability}\n\n(In a real app, this would open a chat with ${item.ownerName})`);
//     }
//   };

//   // Filter Logic
//   const filteredItems = filter === 'All' 
//     ? items 
//     : items.filter(item => item.displayType === filter);

//   if (loading) return <div className="text-center mt-10">Loading community feed...</div>;

//   return (
//     <div className="max-w-5xl mx-auto">
//       {/* Header & Filter */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">Browse Food Items</h2>
//           <p className="text-gray-500">See what's available in your community and your pantry.</p>
//         </div>
        
//         <select 
//           onChange={(e) => setFilter(e.target.value)} 
//           className="border border-emerald-200 p-2 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none min-w-[200px]"
//         >
//           <option value="All">Show Everything</option>
//           <option value="Inventory">My Private Stock</option>
//           <option value="Donation">Community Donations</option>
//         </select>
//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {filteredItems.length === 0 ? (
//           <div className="col-span-3 text-center py-10 bg-gray-50 rounded-lg border border-dashed">
//             <p className="text-gray-500">No items found.</p>
//           </div>
//         ) : (
//           filteredItems.map(item => (
//             <div key={item._id} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition flex flex-col justify-between">
              
//               {/* Card Top */}
//               <div>
//                 <div className="flex justify-between items-start mb-2">
//                   <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
//                   <span className={`px-2 py-1 text-xs rounded-full font-bold ${
//                     item.displayType === 'Donation' 
//                       ? 'bg-purple-100 text-purple-600' 
//                       : 'bg-emerald-100 text-emerald-600'
//                   }`}>
//                     {item.displayType === 'Donation' ? '🎁 Donation' : '🏠 My Stock'}
//                   </span>
//                 </div>
                
//                 <div className="text-sm text-gray-600 space-y-2 mb-4">
//                   <p>👤 <b>Owner:</b> {item.ownerName}</p>
//                   <p>📅 <b>Expires:</b> {new Date(item.expiryDate).toLocaleDateString()}</p>
//                   {item.displayType === 'Donation' && (
//                     <div className="bg-gray-50 p-2 rounded text-xs">
//                       <p>📍 {item.pickupLocation}</p>
//                       <p>🕒 {item.availability}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Card Bottom (Action Button) */}
//               <button 
//                 onClick={() => handleClaim(item)}
//                 className={`w-full font-semibold py-2 rounded-lg transition shadow-sm ${
//                   item.ownerName === 'Me'
//                     ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' // Manage My Item
//                     : 'bg-emerald-600 text-white hover:bg-emerald-700' // Claim Donation
//                 }`}
//               >
//                 {item.ownerName === 'Me' ? 'Manage Item' : 'Request / Claim'}
//               </button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Browse;

// import React, { useState } from 'react';

// const Browse = () => {
//   const [filter, setFilter] = useState('All');
  
//   // Mock Data mimicking the database
//   const items = [
//     { id: 1, name: 'Canned Beans', type: 'Donation', expiry: '2026-05-20', location: 'Jakarta' },
//     { id: 2, name: 'Frozen Peas', type: 'Inventory', expiry: '2026-02-10', location: 'Home' },
//     { id: 3, name: 'Rice Bag (5kg)', type: 'Donation', expiry: '2026-12-01', location: 'Bali' },
//   ];

//   const filteredItems = filter === 'All' ? items : items.filter(item => item.type === filter);

//   return (
//     <div className="max-w-5xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-3xl font-bold text-gray-800">Browse Food Items</h2>
//         <select onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded bg-white shadow-sm">
//           <option value="All">All Items</option>
//           <option value="Inventory">My Inventory</option>
//           <option value="Donation">Donation Listings</option>
//         </select>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {filteredItems.map(item => (
//           <div key={item.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
//             <div className="flex justify-between items-start mb-2">
//               <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
//               <span className={`px-2 py-1 text-xs rounded-full ${item.type === 'Donation' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
//                 {item.type}
//               </span>
//             </div>
//             <p className="text-sm text-gray-600">📍 {item.location}</p>
//             <p className="text-sm text-gray-600">📅 Expires: {item.expiry}</p>
//             <button className="w-full mt-4 bg-gray-100 text-emerald-700 font-semibold py-2 rounded hover:bg-emerald-50 transition">
//               View Details
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Browse;