import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Inventory'); // 'Inventory' or 'Donation'
  const [loading, setLoading] = useState(true);
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: '', quantity: '', expiryDate: '', category: 'Fresh', storageLocation: ''
  });
  const [editId, setEditId] = useState(null); // If set, we are editing this ID

  // --- DONATION MODAL STATE ---
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateTargetId, setDonateTargetId] = useState(null);
  const [donateDetails, setDonateDetails] = useState({ pickupLocation: '', availability: '' });

  // Load Data
  useEffect(() => {
    fetchItems();
  }, [activeTab]); // Reload when switching tabs

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/inventory?type=${activeTab}`, {
        headers: { 'x-auth-token': token }
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Change
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle Add / Edit Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };

    try {
      if (editId) {
        // --- EDIT MODE ---
        const res = await axios.put(`http://localhost:5000/api/inventory/${editId}`, formData, config);
        // Update local list
        setItems(items.map(item => item._id === editId ? res.data : item));
        setEditId(null);
        alert("Item updated!");
      } else {
        // --- ADD MODE ---
        const res = await axios.post('http://localhost:5000/api/inventory/add', formData, config);
        setItems([...items, res.data]);
      }
      // Reset Form
      setFormData({ name: '', quantity: '', expiryDate: '', category: 'Fresh', storageLocation: '' });
    } catch (err) {
      alert("Error saving item");
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      alert("Error deleting item");
    }
  };

  // Prepare Edit
  const handleEditClick = (item) => {
    setEditId(item._id);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      expiryDate: item.expiryDate.split('T')[0], // Format date for input
      category: item.category,
      storageLocation: item.storageLocation || ''
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- DONATION LOGIC ---
  const openDonateModal = (id) => {
    setDonateTargetId(id);
    setShowDonateModal(true);
  };

  const submitDonation = async () => {
    if(!donateDetails.pickupLocation || !donateDetails.availability) return alert("Please fill all fields");
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/inventory/${donateTargetId}/donate`, donateDetails, {
        headers: { 'x-auth-token': token }
      });
      
      // Remove from current list (it moves to 'Donation' tab)
      setItems(items.filter(item => item._id !== donateTargetId));
      setShowDonateModal(false);
      setDonateDetails({ pickupLocation: '', availability: '' });
      alert("Item moved to 'My Donations' tab!");
    } catch (err) {
      alert("Error processing donation");
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Inventory Management</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button 
          onClick={() => { setActiveTab('Inventory'); setEditId(null); }}
          className={`pb-2 px-4 font-medium transition ${activeTab === 'Inventory' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🏠 My Stock
        </button>
        <button 
          onClick={() => { setActiveTab('Donation'); setEditId(null); }}
          className={`pb-2 px-4 font-medium transition ${activeTab === 'Donation' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🎁 My Active Donations
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Form (Hidden if viewing Donations tab, optional) */}
        {activeTab === 'Inventory' && (
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24">
              <h3 className="text-xl font-semibold text-emerald-700 mb-4">
                {editId ? '✏️ Edit Item' : '+ Add New Item'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option>Fresh</option><option>Canned</option><option>Frozen</option><option>Dry</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Storage Location</label>
                  <input name="storageLocation" value={formData.storageLocation} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className={`flex-1 text-white font-bold py-2 rounded-lg transition ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    {editId ? 'Update Item' : 'Add Item'}
                  </button>
                  {editId && (
                    <button type="button" onClick={() => { setEditId(null); setFormData({ name: '', quantity: '', expiryDate: '', category: 'Fresh', storageLocation: '' }); }} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: List */}
        <div className={activeTab === 'Inventory' ? "lg:col-span-2" : "lg:col-span-3"}>
          {loading ? <p>Loading...</p> : items.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No items found in {activeTab}.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${activeTab === 'Inventory' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
              {items.map(item => (
                <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between relative group">
                  
                  {/* Delete Button (Top Right) */}
                  <button onClick={() => handleDelete(item._id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                    ✕
                  </button>

                  <div>
                    <div className="flex justify-between items-start pr-6">
                      <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>📦 <b>Qty:</b> {item.quantity} | 🏷️ {item.category}</p>
                      <p className={`${new Date(item.expiryDate) < new Date() ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                        ⏳ Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                      {activeTab === 'Donation' && (
                         <div className="bg-blue-50 p-2 rounded mt-2 text-xs text-blue-800">
                           <p>📍 {item.pickupLocation}</p>
                           <p>🕒 {item.availability}</p>
                         </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    {activeTab === 'Inventory' ? (
                      <>
                        <button onClick={() => handleEditClick(item)} className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded hover:bg-gray-200 text-sm font-medium">
                          Edit
                        </button>
                        <button onClick={() => openDonateModal(item._id)} className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded hover:bg-blue-100 text-sm font-medium">
                          Donate
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleDelete(item._id)} className="w-full bg-red-50 text-red-600 py-1.5 rounded hover:bg-red-100 text-sm font-medium">
                        Remove Listing
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DONATION MODAL OVERLAY */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Donate Food Item</h3>
            <p className="text-gray-500 text-sm mb-4">Please provide details so neighbors can pick this up.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Location</label>
                <input 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g. Lobby, Front Porch"
                  value={donateDetails.pickupLocation}
                  onChange={(e) => setDonateDetails({...donateDetails, pickupLocation: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Availability / Time</label>
                <input 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g. Weekdays after 6pm"
                  value={donateDetails.availability}
                  onChange={(e) => setDonateDetails({...donateDetails, availability: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={submitDonation} className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700">
                Confirm Donation
              </button>
              <button onClick={() => setShowDonateModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;

// const Inventory = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false); // Prevents spamming
  
//   // Form State
//   const [newItem, setNewItem] = useState({
//     name: '', 
//     quantity: '', 
//     expiryDate: '', 
//     category: 'Fresh', 
//     storageLocation: ''
//   });

//   // Fetch Inventory on Load
//   useEffect(() => {
//     fetchItems();
//   }, []);

//   const fetchItems = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       // HEADERS ADDED HERE:
//       const res = await axios.get('http://localhost:5000/api/inventory', {
//         headers: { 'x-auth-token': token } 
//       });
//       setItems(res.data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching items:", err);
//       // If 401 (Unauthorized), user might need to login again
//       if (err.response && err.response.status === 401) {
//         setError("Session expired. Please logout and login again.");
//       } else {
//         setError("Could not connect to the server.");
//       }
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setNewItem({ ...newItem, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true); // Disable button immediately

//     try {
//       const token = localStorage.getItem('token');
//       const res = await axios.post('http://localhost:5000/api/inventory/add', newItem, {
//         headers: { 'x-auth-token': token }
//       });
      
//       // INSTANTLY UPDATE TABLE:
//       setItems([...items, res.data]); 
      
//       // Reset form
//       setNewItem({ name: '', quantity: '', expiryDate: '', category: 'Fresh', storageLocation: '' });
//       // alert("Item added successfully!"); // Removed alert to be smoother
//     } catch (err) {
//       alert("Error adding item");
//     } finally {
//       setSubmitting(false); // Re-enable button
//     }
//   };

//   const handleDonate = async (id) => {
//     if(window.confirm("Are you sure you want to donate this item?")) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.put(`http://localhost:5000/api/inventory/${id}/donate`, {}, {
//             headers: { 'x-auth-token': token }
//         });
//         // Remove item from local list
//         setItems(items.filter(item => item._id !== id));
//       } catch (err) {
//         alert("Error updating item");
//       }
//     }
//   };

//   if (loading) return <div className="text-center mt-10">Loading inventory...</div>;
//   if (error) return <div className="text-center mt-10 text-red-600 font-bold">{error}</div>;

//   return (
//     <div className="max-w-6xl mx-auto">
//       <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">My Food Inventory</h2>
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* LEFT COLUMN: Add New Item Form */}
//         <div className="lg:col-span-1">
//           <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-4">
//             <h3 className="text-xl font-semibold text-emerald-700 mb-4">Add New Item</h3>
//             <form onSubmit={handleSubmit} className="space-y-4">
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Item Name</label>
//                 <input name="name" value={newItem.name} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" required placeholder="e.g. Milk" />
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Quantity</label>
//                   <input name="quantity" type="number" value={newItem.quantity} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Category</label>
//                   <select name="category" value={newItem.category} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none">
//                     <option value="Fresh">Fresh</option>
//                     <option value="Canned">Canned</option>
//                     <option value="Frozen">Frozen</option>
//                     <option value="Dry">Dry</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
//                 <input name="expiryDate" type="date" value={newItem.expiryDate} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Storage Location</label>
//                 <input name="storageLocation" value={newItem.storageLocation} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Top Shelf" />
//               </div>

//               <button 
//                 type="submit" 
//                 disabled={submitting}
//                 className={`w-full text-white font-bold py-2 rounded-lg transition shadow-sm ${
//                     submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
//                 }`}
//               >
//                 {submitting ? 'Adding...' : '+ Add Item'}
//               </button>
//             </form>
//           </div>
//         </div>

//         {/* RIGHT COLUMN: Inventory List */}
//         <div className="lg:col-span-2">
//           <h3 className="text-xl font-semibold text-gray-700 mb-4">Current Stock ({items.length})</h3>
          
//           {items.length === 0 ? (
//             <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
//               <p className="text-gray-500">Your inventory is empty. Start adding food!</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {items.map(item => (
//                 <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
//                   <div>
//                     <div className="flex justify-between items-start">
//                       <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
//                       <span className={`text-xs px-2 py-1 rounded-full ${
//                         new Date(item.expiryDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
//                       }`}>
//                         {new Date(item.expiryDate).toLocaleDateString()}
//                       </span>
//                     </div>
//                     <div className="mt-2 text-sm text-gray-600 space-y-1">
//                       <p>📦 <b>Qty:</b> {item.quantity}</p>
//                       <p>🏷️ <b>Type:</b> {item.category}</p>
//                       <p>📍 <b>Loc:</b> {item.storageLocation || 'N/A'}</p>
//                     </div>
//                   </div>
                  
//                   <div className="mt-4 pt-4 border-t border-gray-100">
//                     <button 
//                       onClick={() => handleDonate(item._id)}
//                       className="w-full text-sm bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
//                     >
//                       🤝 Convert to Donation
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Inventory;

// const Inventory = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Form State
//   const [newItem, setNewItem] = useState({
//     name: '', 
//     quantity: '', 
//     expiryDate: '', 
//     category: 'Fresh', 
//     storageLocation: ''
//   });

//   // Fetch Inventory on Load
//   useEffect(() => {
//     fetchItems();
//   }, []);

//   const fetchItems = async () => {
//     try {
//       // Make sure this URL matches your Backend Port (5000)
//       const token = localStorage.getItem('token'); // <--- GET TOKEN
//       const res = await axios.get('http://localhost:5000/api/inventory', {
//         headers: { 'x-auth-token': token } // <--- SEND TOKEN
//       });
//       setItems(res.data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching items:", err);
//       setError("Could not connect to the server. Is the backend running on port 5000?");
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setNewItem({ ...newItem, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem('token'); // <--- GET TOKEN
//       const res = await axios.post('http://localhost:5000/api/inventory/add', newItem, {
//         headers: { 'x-auth-token': token } // <--- SEND TOKEN
//       });
//     } catch (err) {
//       alert("Error adding item");
//     }
//   };

//   const handleDonate = async (id) => {
//     if(window.confirm("Are you sure you want to donate this item?")) {
//       try {
//         const token = localStorage.getItem('token'); // <--- GET TOKEN
//         await axios.put(`http://localhost:5000/api/inventory/${id}/donate`, {}, {
//             headers: { 'x-auth-token': token } // <--- SEND TOKEN
//         });
//       } catch (err) {
//         alert("Error updating item");
//       }
//     }
//   };

//   if (loading) {
//     return <div className="text-center mt-10">Loading inventory...</div>;
//   }
//   if (error) return <div className="text-center mt-10 text-red-600 font-bold">{error}</div>;

//   return (
//     <div className="max-w-6xl mx-auto">
//       <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">My Food Inventory</h2>
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* LEFT COLUMN: Add New Item Form */}
//         <div className="lg:col-span-1">
//           <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-4">
//             <h3 className="text-xl font-semibold text-emerald-700 mb-4">Add New Item</h3>
//             <form onSubmit={handleSubmit} className="space-y-4">
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Item Name</label>
//                 <input name="name" value={newItem.name} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" required placeholder="e.g. Milk" />
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Quantity</label>
//                   <input name="quantity" type="number" value={newItem.quantity} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Category</label>
//                   <select name="category" value={newItem.category} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none">
//                     <option value="Fresh">Fresh</option>
//                     <option value="Canned">Canned</option>
//                     <option value="Frozen">Frozen</option>
//                     <option value="Dry">Dry</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
//                 <input name="expiryDate" type="date" value={newItem.expiryDate} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Storage Location</label>
//                 <input name="storageLocation" value={newItem.storageLocation} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Top Shelf" />
//               </div>

//               <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm">
//                 + Add Item
//               </button>
//             </form>
//           </div>
//         </div>

//         {/* RIGHT COLUMN: Inventory List */}
//         <div className="lg:col-span-2">
//           <h3 className="text-xl font-semibold text-gray-700 mb-4">Current Stock ({items.length})</h3>
          
//           {items.length === 0 ? (
//             <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
//               <p className="text-gray-500">Your inventory is empty. Start adding food!</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {items.map(item => (
//                 <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
//                   <div>
//                     <div className="flex justify-between items-start">
//                       <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
//                       <span className={`text-xs px-2 py-1 rounded-full ${
//                         new Date(item.expiryDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
//                       }`}>
//                         {new Date(item.expiryDate).toLocaleDateString()}
//                       </span>
//                     </div>
//                     <div className="mt-2 text-sm text-gray-600 space-y-1">
//                       <p>📦 <b>Qty:</b> {item.quantity}</p>
//                       <p>🏷️ <b>Type:</b> {item.category}</p>
//                       <p>📍 <b>Loc:</b> {item.storageLocation || 'N/A'}</p>
//                     </div>
//                   </div>
                  
//                   <div className="mt-4 pt-4 border-t border-gray-100">
//                     <button 
//                       onClick={() => handleDonate(item._id)}
//                       className="w-full text-sm bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
//                     >
//                       🤝 Convert to Donation
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Inventory;