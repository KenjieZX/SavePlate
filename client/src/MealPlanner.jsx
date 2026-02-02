import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- MOCK RECIPE DATABASE ---
const RECIPE_DB = [
  { name: 'Omelette', ingredients: ['Eggs', 'Cheese', 'Milk', 'Butter'] },
  { name: 'Fruit Salad', ingredients: ['Apple', 'Banana', 'Orange', 'Yogurt'] },
  { name: 'Grilled Cheese', ingredients: ['Bread', 'Cheese', 'Butter'] },
  { name: 'Pasta & Sauce', ingredients: ['Pasta', 'Tomato Sauce', 'Cheese'] },
  { name: 'Chicken Stir Fry', ingredients: ['Chicken', 'Rice', 'Vegetables'] },
  { name: 'Vegetable Soup', ingredients: ['Carrots', 'Potatoes', 'Onion', 'Broth'] },
  { name: 'Cereal', ingredients: ['Milk', 'Cereal'] },
  { name: 'Tuna Sandwich', ingredients: ['Bread', 'Tuna', 'Mayo', 'Lettuce'] },
];

const MealPlanner = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack']; 

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [meals, setMeals] = useState([]);
  const [inventory, setInventory] = useState([]); 
  
  const [activeSlot, setActiveSlot] = useState(null); 
  const [newMealName, setNewMealName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      const [mealsRes, invRes] = await Promise.all([
        axios.get('http://localhost:5000/api/meals', config),
        axios.get('http://localhost:5000/api/inventory', config)
      ]);

      setMeals(mealsRes.data);
      setInventory(invRes.data);
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  const getSuggestions = () => {
    const suggestions = RECIPE_DB.map(recipe => {
      const matches = recipe.ingredients.filter(ingName => 
        inventory.some(invItem => invItem.name.toLowerCase().includes(ingName.toLowerCase()))
      );
      return { ...recipe, matchCount: matches.length, matchedIngredients: matches };
    });
    return suggestions.sort((a, b) => b.matchCount - a.matchCount);
  };

  const applyRecipe = (recipe) => {
    setNewMealName(recipe.name);
    const inventoryMatches = inventory
      .filter(invItem => recipe.ingredients.some(rIng => invItem.name.toLowerCase().includes(rIng.toLowerCase())))
      .map(i => i.name);
    setSelectedIngredients(inventoryMatches);
  };

  const handleSaveMeal = async () => {
    if (!newMealName) return alert("Please enter a meal name");

    try {
      const token = localStorage.getItem('token');
      const payload = {
        day: selectedDay,
        type: activeSlot,
        mealName: newMealName,
        ingredients: selectedIngredients
      };

      const res = await axios.post('http://localhost:5000/api/meals', payload, {
        headers: { 'x-auth-token': token }
      });

      const updatedMeals = meals.filter(m => !(m.day === selectedDay && m.type === activeSlot));
      setMeals([...updatedMeals, res.data]);
      
      setActiveSlot(null);
      setNewMealName('');
      setSelectedIngredients([]);
    } catch (err) {
      alert("Error saving meal");
    }
  };

  const handleDeleteMeal = async (id) => {
    if(!window.confirm("Remove this meal?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/meals/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setMeals(meals.filter(m => m._id !== id));
    } catch (err) {
      alert("Error deleting meal");
    }
  };

  // --- NEW FUNCTION: COOK MEAL ---
  const handleCookMeal = async (id, mealName) => {
    if(!window.confirm(`Mark '${mealName}' as cooked? This will reduce ingredient quantities in your inventory.`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/meals/${id}/cook`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Refresh inventory to show new quantities
      fetchData(); 
      alert(`Success! \n${res.data.updates.join('\n')}`);

    } catch (err) {
      alert("Error processing cooking");
    }
  };

  const toggleIngredient = (itemName) => {
    if (selectedIngredients.includes(itemName)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== itemName));
    } else {
      setSelectedIngredients([...selectedIngredients, itemName]);
    }
  };

  const getMeal = (type) => meals.find(m => m.day === selectedDay && m.type === type);
  const sortedRecipes = getSuggestions();

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Weekly Meal Planner</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* SIDEBAR */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 h-fit">
          <h3 className="font-bold text-lg mb-4 text-emerald-700">Select Day</h3>
          <div className="space-y-2">
            {days.map(day => (
              <button 
                key={day} 
                onClick={() => { setSelectedDay(day); setActiveSlot(null); }}
                className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${
                  selectedDay === day ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 min-h-[500px]">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex justify-between">
              <span>{selectedDay}'s Menu</span>
            </h3>
            
            {mealTypes.map(type => {
              const meal = getMeal(type);
              const isEditing = activeSlot === type;

              return (
                <div key={type} className="mb-6 last:mb-0">
                  <h4 className="font-bold text-emerald-700 mb-2 uppercase tracking-wide text-sm">{type}</h4>
                  
                  {isEditing ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Meal Name</label>
                        <input 
                          className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-emerald-500 outline-none" 
                          placeholder="e.g. Chicken Salad" 
                          value={newMealName}
                          onChange={(e) => setNewMealName(e.target.value)}
                          autoFocus
                        />
                        <label className="block text-sm font-bold text-gray-700 mb-2">Link Inventory Ingredients:</label>
                        <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto">
                          {inventory.length > 0 ? inventory.map(item => (
                            <button 
                              key={item._id}
                              onClick={() => toggleIngredient(item.name)}
                              className={`text-xs px-3 py-1 rounded-full border transition ${
                                selectedIngredients.includes(item.name) 
                                ? 'bg-emerald-600 text-white border-emerald-600' 
                                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                              }`}
                            >
                              {selectedIngredients.includes(item.name) ? '✓ ' : '+ '} {item.name} <span className="text-[10px] opacity-70">({item.quantity})</span>
                            </button>
                          )) : <p className="text-xs text-gray-400 italic">No items in inventory.</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleSaveMeal} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700">Save Plan</button>
                          <button onClick={() => setActiveSlot(null)} className="text-gray-500 px-4 py-2 text-sm hover:underline">Cancel</button>
                        </div>
                      </div>
                      <div className="flex-1 border-l pl-6 border-gray-200">
                        <h5 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><span>💡</span> Smart Suggestions</h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {sortedRecipes.map((recipe, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => applyRecipe(recipe)}
                              className={`p-3 rounded-lg border cursor-pointer transition hover:shadow-sm ${
                                recipe.matchCount > 0 ? 'bg-white border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-70'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-sm text-gray-800">{recipe.name}</span>
                                {recipe.matchCount > 0 && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">{recipe.matchCount} matched</span>}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Requires: {recipe.ingredients.join(', ')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    meal ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center group hover:shadow-sm transition">
                        <div>
                          <p className="font-bold text-xl text-gray-800">{meal.mealName}</p>
                          {meal.ingredients.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              Using: {meal.ingredients.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {/* COOK BUTTON */}
                          <button 
                            onClick={() => handleCookMeal(meal._id, meal.mealName)} 
                            className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-200 transition flex items-center gap-1"
                            title="Mark as Cooked (Uses Inventory)"
                          >
                            ✅ Cooked
                          </button>
                          <button onClick={() => handleDeleteMeal(meal._id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => { setActiveSlot(type); setNewMealName(''); setSelectedIngredients([]); }}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center text-gray-400 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 transition h-20"
                      >
                        <span className="font-medium">+ Plan {type}</span>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// // --- MOCK RECIPE DATABASE (The "Smart Chef" Brain) ---
// const RECIPE_DB = [
//   { name: 'Omelette', ingredients: ['Eggs', 'Cheese', 'Milk', 'Butter'] },
//   { name: 'Fruit Salad', ingredients: ['Apple', 'Banana', 'Orange', 'Yogurt'] },
//   { name: 'Grilled Cheese', ingredients: ['Bread', 'Cheese', 'Butter'] },
//   { name: 'Pasta & Sauce', ingredients: ['Pasta', 'Tomato Sauce', 'Cheese'] },
//   { name: 'Chicken Stir Fry', ingredients: ['Chicken', 'Rice', 'Vegetables'] },
//   { name: 'Vegetable Soup', ingredients: ['Carrots', 'Potatoes', 'Onion', 'Broth'] },
//   { name: 'Cereal', ingredients: ['Milk', 'Cereal'] },
//   { name: 'Tuna Sandwich', ingredients: ['Bread', 'Tuna', 'Mayo', 'Lettuce'] },
// ];

// const MealPlanner = () => {
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//   // Added 'Snack' as per Actor Action 3
//   const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack']; 

//   const [selectedDay, setSelectedDay] = useState('Monday');
//   const [meals, setMeals] = useState([]);
//   const [inventory, setInventory] = useState([]); 
  
//   // State for the "Add Meal" Form
//   const [activeSlot, setActiveSlot] = useState(null); 
//   const [newMealName, setNewMealName] = useState('');
//   const [selectedIngredients, setSelectedIngredients] = useState([]);

//   // Load Data (System Response 2)
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const config = { headers: { 'x-auth-token': token } };
      
//       const [mealsRes, invRes] = await Promise.all([
//         axios.get('http://localhost:5000/api/meals', config),
//         axios.get('http://localhost:5000/api/inventory', config)
//       ]);

//       setMeals(mealsRes.data);
//       setInventory(invRes.data);
//     } catch (err) {
//       console.error("Error loading data", err);
//     }
//   };

//   // --- SMART SUGGESTION LOGIC (System Response 4) ---
//   const getSuggestions = () => {
//     // 1. Find matches between Inventory and Recipe DB
//     const suggestions = RECIPE_DB.map(recipe => {
//       // Find how many ingredients the user actually has
//       const matches = recipe.ingredients.filter(ingName => 
//         inventory.some(invItem => invItem.name.toLowerCase().includes(ingName.toLowerCase()))
//       );
//       return { ...recipe, matchCount: matches.length, matchedIngredients: matches };
//     });

//     // 2. Sort by "Best Match" (most ingredients owned)
//     return suggestions.sort((a, b) => b.matchCount - a.matchCount);
//   };

//   const applyRecipe = (recipe) => {
//     setNewMealName(recipe.name);
//     // Auto-tag ingredients that we have in inventory
//     const inventoryMatches = inventory
//       .filter(invItem => recipe.ingredients.some(rIng => invItem.name.toLowerCase().includes(rIng.toLowerCase())))
//       .map(i => i.name);
    
//     setSelectedIngredients(inventoryMatches);
//   };

//   // --- SAVE LOGIC (System Response 6 & 8) ---
//   const handleSaveMeal = async () => {
//     if (!newMealName) return alert("Please enter a meal name");

//     try {
//       const token = localStorage.getItem('token');
//       const payload = {
//         day: selectedDay,
//         type: activeSlot,
//         mealName: newMealName,
//         ingredients: selectedIngredients
//       };

//       const res = await axios.post('http://localhost:5000/api/meals', payload, {
//         headers: { 'x-auth-token': token }
//       });

//       const updatedMeals = meals.filter(m => !(m.day === selectedDay && m.type === activeSlot));
//       setMeals([...updatedMeals, res.data]);
      
//       setActiveSlot(null);
//       setNewMealName('');
//       setSelectedIngredients([]);
//     } catch (err) {
//       alert("Error saving meal");
//     }
//   };

//   const handleDeleteMeal = async (id) => {
//     if(!window.confirm("Remove this meal?")) return;
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`http://localhost:5000/api/meals/${id}`, {
//         headers: { 'x-auth-token': token }
//       });
//       setMeals(meals.filter(m => m._id !== id));
//     } catch (err) {
//       alert("Error deleting meal");
//     }
//   };

//   const toggleIngredient = (itemName) => {
//     if (selectedIngredients.includes(itemName)) {
//       setSelectedIngredients(selectedIngredients.filter(i => i !== itemName));
//     } else {
//       setSelectedIngredients([...selectedIngredients, itemName]);
//     }
//   };

//   const getMeal = (type) => meals.find(m => m.day === selectedDay && m.type === type);
//   const sortedRecipes = getSuggestions();

//   return (
//     <div className="max-w-6xl mx-auto">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6">Weekly Meal Planner</h2>
      
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
//         {/* SIDEBAR: Days Selector */}
//         <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 h-fit">
//           <h3 className="font-bold text-lg mb-4 text-emerald-700">Select Day</h3>
//           <div className="space-y-2">
//             {days.map(day => (
//               <button 
//                 key={day} 
//                 onClick={() => { setSelectedDay(day); setActiveSlot(null); }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${
//                   selectedDay === day ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'
//                 }`}
//               >
//                 {day}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* MAIN: Meal Slots */}
//         <div className="md:col-span-3 space-y-6">
//           <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 min-h-[500px]">
//             <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex justify-between">
//               <span>{selectedDay}'s Menu</span>
//             </h3>
            
//             {mealTypes.map(type => {
//               const meal = getMeal(type);
//               const isEditing = activeSlot === type;

//               return (
//                 <div key={type} className="mb-6 last:mb-0">
//                   <h4 className="font-bold text-emerald-700 mb-2 uppercase tracking-wide text-sm">{type}</h4>
                  
//                   {isEditing ? (
//                     <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in flex flex-col md:flex-row gap-6">
                      
//                       {/* Left Side: Manual Entry */}
//                       <div className="flex-1">
//                         <label className="block text-sm font-bold text-gray-700 mb-1">Meal Name</label>
//                         <input 
//                           className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-emerald-500 outline-none" 
//                           placeholder="e.g. Chicken Salad" 
//                           value={newMealName}
//                           onChange={(e) => setNewMealName(e.target.value)}
//                           autoFocus
//                         />
                        
//                         <label className="block text-sm font-bold text-gray-700 mb-2">Link Inventory Ingredients:</label>
//                         <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto">
//                           {inventory.length > 0 ? inventory.map(item => (
//                             <button 
//                               key={item._id}
//                               onClick={() => toggleIngredient(item.name)}
//                               className={`text-xs px-3 py-1 rounded-full border transition ${
//                                 selectedIngredients.includes(item.name) 
//                                 ? 'bg-emerald-600 text-white border-emerald-600' 
//                                 : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
//                               }`}
//                             >
//                               {selectedIngredients.includes(item.name) ? '✓ ' : '+ '} {item.name}
//                             </button>
//                           )) : <p className="text-xs text-gray-400 italic">No items in inventory.</p>}
//                         </div>

//                         <div className="flex gap-2">
//                           <button onClick={handleSaveMeal} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700">Save Plan</button>
//                           <button onClick={() => setActiveSlot(null)} className="text-gray-500 px-4 py-2 text-sm hover:underline">Cancel</button>
//                         </div>
//                       </div>

//                       {/* Right Side: Smart Suggestions (System Response 4 & 4a) */}
//                       <div className="flex-1 border-l pl-6 border-gray-200">
//                         <h5 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
//                           <span>💡</span> Smart Suggestions
//                         </h5>
//                         <p className="text-xs text-gray-500 mb-3">Based on your inventory</p>
                        
//                         <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
//                           {sortedRecipes.map((recipe, idx) => (
//                             <div 
//                               key={idx} 
//                               onClick={() => applyRecipe(recipe)}
//                               className={`p-3 rounded-lg border cursor-pointer transition hover:shadow-sm ${
//                                 recipe.matchCount > 0 ? 'bg-white border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-70'
//                               }`}
//                             >
//                               <div className="flex justify-between items-center">
//                                 <span className="font-bold text-sm text-gray-800">{recipe.name}</span>
//                                 {recipe.matchCount > 0 && (
//                                   <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
//                                     {recipe.matchCount} matched
//                                   </span>
//                                 )}
//                               </div>
//                               <p className="text-xs text-gray-500 mt-1">
//                                 Requires: {recipe.ingredients.join(', ')}
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                     </div>
//                   ) : (
//                     // View Mode
//                     meal ? (
//                       <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-start group hover:shadow-sm transition">
//                         <div>
//                           <p className="font-bold text-xl text-gray-800">{meal.mealName}</p>
//                           {meal.ingredients.length > 0 && (
//                             <p className="text-sm text-gray-500 mt-1">
//                               Using: {meal.ingredients.join(', ')}
//                             </p>
//                           )}
//                         </div>
//                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
//                           <button onClick={() => handleDeleteMeal(meal._id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
//                         </div>
//                       </div>
//                     ) : (
//                       <div 
//                         onClick={() => { setActiveSlot(type); setNewMealName(''); setSelectedIngredients([]); }}
//                         className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center text-gray-400 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 transition h-20"
//                       >
//                         <span className="font-medium">+ Plan {type}</span>
//                       </div>
//                     )
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MealPlanner;












// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const MealPlanner = () => {
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//   const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

//   const [selectedDay, setSelectedDay] = useState('Monday');
//   const [meals, setMeals] = useState([]);
//   const [inventory, setInventory] = useState([]); // To show available food
  
//   // State for the "Add Meal" Form
//   const [activeSlot, setActiveSlot] = useState(null); // { type: 'Lunch' }
//   const [newMealName, setNewMealName] = useState('');
//   const [selectedIngredients, setSelectedIngredients] = useState([]);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const config = { headers: { 'x-auth-token': token } };
      
//       // Fetch both Meals and Inventory in parallel
//       const [mealsRes, invRes] = await Promise.all([
//         axios.get('http://localhost:5000/api/meals', config),
//         axios.get('http://localhost:5000/api/inventory', config)
//       ]);

//       setMeals(mealsRes.data);
//       setInventory(invRes.data);
//     } catch (err) {
//       console.error("Error loading data", err);
//     }
//   };

//   const handleSaveMeal = async () => {
//     if (!newMealName) return alert("Please enter a meal name");

//     try {
//       const token = localStorage.getItem('token');
//       const payload = {
//         day: selectedDay,
//         type: activeSlot,
//         mealName: newMealName,
//         ingredients: selectedIngredients
//       };

//       const res = await axios.post('http://localhost:5000/api/meals', payload, {
//         headers: { 'x-auth-token': token }
//       });

//       // Update local state (remove old slot if exists, add new one)
//       const updatedMeals = meals.filter(m => !(m.day === selectedDay && m.type === activeSlot));
//       setMeals([...updatedMeals, res.data]);
      
//       // Close form
//       setActiveSlot(null);
//       setNewMealName('');
//       setSelectedIngredients([]);
//     } catch (err) {
//       alert("Error saving meal");
//     }
//   };

//   const handleDeleteMeal = async (id) => {
//     if(!window.confirm("Remove this meal?")) return;
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`http://localhost:5000/api/meals/${id}`, {
//         headers: { 'x-auth-token': token }
//       });
//       setMeals(meals.filter(m => m._id !== id));
//     } catch (err) {
//       alert("Error deleting meal");
//     }
//   };

//   const toggleIngredient = (itemName) => {
//     if (selectedIngredients.includes(itemName)) {
//       setSelectedIngredients(selectedIngredients.filter(i => i !== itemName));
//     } else {
//       setSelectedIngredients([...selectedIngredients, itemName]);
//     }
//   };

//   // Helper to find a meal for the current day/slot
//   const getMeal = (type) => meals.find(m => m.day === selectedDay && m.type === type);

//   return (
//     <div className="max-w-6xl mx-auto">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6">Weekly Meal Planner</h2>
      
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
//         {/* SIDEBAR: Days Selector */}
//         <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 h-fit">
//           <h3 className="font-bold text-lg mb-4 text-emerald-700">Select Day</h3>
//           <div className="space-y-2">
//             {days.map(day => (
//               <button 
//                 key={day} 
//                 onClick={() => { setSelectedDay(day); setActiveSlot(null); }}
//                 className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${
//                   selectedDay === day ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'
//                 }`}
//               >
//                 {day}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* MAIN: Meal Slots for Selected Day */}
//         <div className="md:col-span-3 space-y-6">
//           <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 min-h-[500px]">
//             <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex justify-between">
//               <span>{selectedDay}'s Menu</span>
//               <span className="text-sm font-normal text-gray-500 mt-2">Plan your nutrition</span>
//             </h3>
            
//             {mealTypes.map(type => {
//               const meal = getMeal(type);
//               const isEditing = activeSlot === type;

//               return (
//                 <div key={type} className="mb-6 last:mb-0">
//                   <h4 className="font-bold text-emerald-700 mb-2 uppercase tracking-wide text-sm">{type}</h4>
                  
//                   {isEditing ? (
//                     // --- EDIT MODE ---
//                     <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
//                       <label className="block text-sm font-bold text-gray-700 mb-1">Meal Name</label>
//                       <input 
//                         className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-emerald-500 outline-none" 
//                         placeholder="e.g. Chicken Salad" 
//                         value={newMealName}
//                         onChange={(e) => setNewMealName(e.target.value)}
//                         autoFocus
//                       />
                      
//                       <label className="block text-sm font-bold text-gray-700 mb-2">Use Inventory Items:</label>
//                       <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
//                         {inventory.length > 0 ? inventory.map(item => (
//                           <button 
//                             key={item._id}
//                             onClick={() => toggleIngredient(item.name)}
//                             className={`text-xs px-3 py-1 rounded-full border transition ${
//                               selectedIngredients.includes(item.name) 
//                               ? 'bg-emerald-600 text-white border-emerald-600' 
//                               : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
//                             }`}
//                           >
//                             {selectedIngredients.includes(item.name) ? '✓ ' : '+ '} {item.name}
//                           </button>
//                         )) : <p className="text-xs text-gray-400 italic">No items in inventory.</p>}
//                       </div>

//                       <div className="flex gap-2">
//                         <button onClick={handleSaveMeal} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700">Save Plan</button>
//                         <button onClick={() => setActiveSlot(null)} className="text-gray-500 px-4 py-2 text-sm hover:underline">Cancel</button>
//                       </div>
//                     </div>
//                   ) : (
//                     // --- VIEW MODE ---
//                     meal ? (
//                       <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-start group hover:shadow-sm transition">
//                         <div>
//                           <p className="font-bold text-xl text-gray-800">{meal.mealName}</p>
//                           {meal.ingredients.length > 0 && (
//                             <p className="text-sm text-gray-500 mt-1">
//                               Using: {meal.ingredients.join(', ')}
//                             </p>
//                           )}
//                         </div>
//                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
//                           <button onClick={() => handleDeleteMeal(meal._id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
//                         </div>
//                       </div>
//                     ) : (
//                       <div 
//                         onClick={() => { setActiveSlot(type); setNewMealName(''); setSelectedIngredients([]); }}
//                         className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center text-gray-400 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 transition h-20"
//                       >
//                         <span className="font-medium">+ Plan {type}</span>
//                       </div>
//                     )
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MealPlanner;

















// import React, { useState } from 'react';

// const MealPlanner = () => {
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
//   const [selectedDay, setSelectedDay] = useState('Monday');

//   return (
//     <div className="max-w-6xl mx-auto">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6">Weekly Meal Planner</h2>
      
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         {/* Sidebar: Days */}
//         <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
//           <h3 className="font-bold text-lg mb-4 text-emerald-700">Select Day</h3>
//           <div className="space-y-2">
//             {days.map(day => (
//               <button 
//                 key={day} 
//                 onClick={() => setSelectedDay(day)}
//                 className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedDay === day ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
//               >
//                 {day}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Main Content: Meals for the Day */}
//         <div className="md:col-span-3 space-y-6">
//           <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedDay}'s Plan</h3>
            
//             {['Breakfast', 'Lunch', 'Dinner'].map(slot => (
//               <div key={slot} className="mb-6 last:mb-0">
//                 <h4 className="font-semibold text-emerald-600 mb-2">{slot}</h4>
//                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer h-24">
//                   <span className="text-2xl">+</span>
//                   <span className="text-sm">Add meal from inventory</span>
//                 </div>
//               </div>
//             ))}
            
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MealPlanner;