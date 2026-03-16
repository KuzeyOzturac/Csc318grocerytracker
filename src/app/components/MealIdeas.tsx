import React, { useState } from "react";
import { Clock, Filter as FilterIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

export const MealIdeas = () => {
  const navigate = useNavigate();
  const { recipes, inventory } = useApp();
  const { user } = useApp();
  
  const [filters, setFilters] = useState({
    effort: [] as string[],
    cuisine: [] as string[],
    dietary: [] as string[],
    protein: [] as string[],
    expiringSoon: false,
  });

  const effortLevels = ["High Protein", "Vegan", "Vegetarian", "Halal", "Lactose-Free", "Gluten-Free", "Italian", "Indian", "Mexican", "Chinese", "Low Effort", "Med-Low Effort"];
  const expiryOption = "Uses Ingredients Expiring Soon!";

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    if (category === "expiringSoon") {
      setFilters(prev => ({
        ...prev,
        expiringSoon: !prev.expiringSoon
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? (prev[category] as string[]).filter(v => v !== value)
          : [...(prev[category] as string[]), value]
      }));
    }
  };

  const isFilterActive = (value: string) => {
    return effortLevels.some(level => filters.effort.includes(value)) ||
           filters.cuisine.includes(value) ||
           filters.dietary.includes(value) ||
           filters.protein.includes(value);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const effortMatch = filters.effort.length === 0 || 
      filters.effort.some(e => recipe.dietaryTags.includes(e) || recipe.difficulty === e);
    const dietaryMatch = filters.dietary.length === 0 || 
      recipe.dietaryTags.some(tag => filters.dietary.includes(tag));
    
    return effortMatch && dietaryMatch;
  });

  // Sort by expiry-based prioritization
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    const getMinExpiry = (recipe: typeof a) => {
      let minDays = Infinity;
      recipe.ingredients.forEach(ing => {
        const item = inventory.find(i => i.name.toLowerCase() === ing.toLowerCase());
        if (item) {
          const expiry = new Date(item.expiryDate);
          const today = new Date();
          const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          minDays = Math.min(minDays, days);
        }
      });
      return minDays;
    };

    return getMinExpiry(a) - getMinExpiry(b);
  });

  const getFilterColor = (filter: string) => {
    if (filter === "High Protein") return "bg-pink-500 text-white";
    if (filter === "Vegan") return "bg-green-400 text-gray-900";
    if (filter === "Vegetarian") return "bg-green-200 text-gray-900";
    if (filter === "Halal") return "bg-yellow-600 text-white";
    if (filter === "Lactose-Free") return "bg-purple-400 text-white";
    if (filter === "Gluten-Free") return "bg-purple-200 text-gray-900";
    if (filter === "Italian") return "bg-red-500 text-white";
    if (filter === "Indian") return "bg-orange-500 text-white";
    if (filter === "Mexican") return "bg-green-600 text-white";
    if (filter === "Chinese") return "bg-yellow-400 text-gray-900";
    if (filter === "Low Effort") return "bg-green-500 text-white";
    if (filter === "Med-Low Effort") return "bg-yellow-300 text-gray-900";
    return "bg-gray-400 text-white";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Filters */}
      <div className="w-48 bg-white border-r border-gray-200 p-4 space-y-2 overflow-y-auto pb-24 flex-shrink-0">
        {effortLevels.map((filter) => {
          const isActive = isFilterActive(filter);
          return (
            <button
              key={filter}
              onClick={() => toggleFilter("effort", filter)}
              className={`w-full px-3 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? getFilterColor(filter)
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              {filter}
            </button>
          );
        })}
        
        <button
          onClick={() => toggleFilter("expiringSoon", expiryOption)}
          className={`w-full px-3 py-2 rounded-full text-sm font-medium transition-all ${
            filters.expiringSoon
              ? "bg-red-500 text-white"
              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
          }`}
        >
          {expiryOption}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto pb-24">
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cooking</h2>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md">
              {user.initials}
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            Choose a recipe to make using the ingredients you have available!
          </p>

          <button className="flex items-center gap-2 text-gray-700 mb-6 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FilterIcon className="w-5 h-5" />
          </button>

          {/* Recipe Cards */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedRecipes.map((recipe, index) => {
                const getMinExpiryDays = () => {
                  let minDays = Infinity;
                  recipe.ingredients.forEach(ing => {
                    const item = inventory.find(i => i.name.toLowerCase() === ing.toLowerCase());
                    if (item) {
                      const expiry = new Date(item.expiryDate);
                      const today = new Date();
                      const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      minDays = Math.min(minDays, days);
                    }
                  });
                  return minDays === Infinity ? null : minDays;
                };

                const minExpiryDays = getMinExpiryDays();
                const isPriority = minExpiryDays !== null && minExpiryDays <= 3;

                return (
                  <motion.div
                    key={recipe.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/meals/${recipe.id}`)}
                    className={`bg-white rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all relative border-2 ${
                      isPriority ? "border-red-300" : "border-gray-200"
                    }`}
                  >
                    {isPriority && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        Uses Ingredients Expiring Soon!
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.name}</h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{recipe.prepTime}</span>
                          </div>
                          {recipe.dietaryTags.map(tag => (
                            <div key={tag} className={`px-3 py-1 rounded-full text-xs font-medium ${getFilterColor(tag)}`}>
                              {tag}
                            </div>
                          ))}
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getFilterColor(recipe.difficulty + " Effort")}`}>
                            {recipe.difficulty} Effort
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Ingredient Match</span>
                          <span className="text-lg font-bold text-green-600">{recipe.matchPercentage}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${recipe.matchPercentage}%` }}
                          />
                        </div>
                      </div>

                      {recipe.missingIngredients.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Missing:</span> {recipe.missingIngredients.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {sortedRecipes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No recipes match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
