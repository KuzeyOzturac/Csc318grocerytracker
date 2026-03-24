import React, { useEffect, useRef, useState } from "react";
import { Clock, Filter as FilterIcon, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
import { useApp } from "../context/AppContext";

export const MealIdeas = () => {
  const [showFilters, setShowFilters] = useState(false);
  const filterAnchorRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { recipes, inventory } = useApp();
  const { user } = useApp();
  const [filterPanelStyle, setFilterPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const [filters, setFilters] = useState({
    dietary: [] as string[],
    cuisine: [] as string[],
    allergens: [] as string[],
    steps: [] as string[],
    time: [] as string[],
    expiringSoon: false,
  });

  // Auto-apply saved preferences on component mount
  useEffect(() => {
    if (user.preferences) {
      setFilters((prev) => ({
        ...prev,
        dietary: user.preferences?.dietary || [],
        cuisine: user.preferences?.cuisine || [],
        allergens: user.preferences?.allergens || [],
      }));
    }
  }, []);

  const dietaryFilters = [
    "High Protein",
    "Vegan",
    "Vegetarian",
    "Halal",
    "Lactose-Free",
    "Gluten-Free",
  ];

  const cuisineFilters = ["Italian", "Indian", "Mexican", "Chinese", "Thai", "Japanese", "Korean", "Mediterranean", "French", "American"];
  const allergenFilters = ["Dairy", "Eggs", "Gluten", "Nuts"];
  const stepFilters = ["1-3 steps", "4-5 steps", "6+ steps"];
  const timeFilters = ["<15 mins", "15-30 mins", "30-60 mins", "1+ hours"];
  const expiryOption = "Uses Ingredients Expiring Soon!";

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    if (category === "expiringSoon") {
      setFilters((prev) => ({
        ...prev,
        expiringSoon: !prev.expiringSoon,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? (prev[category] as string[]).filter((v) => v !== value)
          : [...(prev[category] as string[]), value],
      }));
    }
  };

  const isFilterActive = (value: string) => {
    return (
      filters.steps.includes(value) ||
      filters.cuisine.includes(value) ||
      filters.dietary.includes(value) ||
      filters.allergens.includes(value) ||
      filters.time.includes(value)
    );
  };

  const getIngredientName = (ingredient: (typeof recipes)[number]["ingredients"][number]) =>
    typeof ingredient === "string" ? ingredient : ingredient.name;

  const getIngredientAmount = (
    ingredient: (typeof recipes)[number]["ingredients"][number],
  ) => (typeof ingredient === "string" ? 1 : ingredient.amount);

  const getInventoryItem = (ingredientName: string) =>
    inventory.find(
      (item) => item.name.toLowerCase() === ingredientName.toLowerCase(),
    );

  const getPrepTimeMinutes = (prepTime: string) => {
    const normalizedPrepTime = prepTime.toLowerCase();
    const hourMatches = [
      ...normalizedPrepTime.matchAll(/(\d+)\s*(h|hr|hrs|hour|hours)/g),
    ];
    const minuteMatches = [
      ...normalizedPrepTime.matchAll(/(\d+)\s*(m|min|mins|minute|minutes)/g),
    ];
    const hours = hourMatches.reduce(
      (total, match) => total + Number(match[1]) * 60,
      0,
    );
    const minutes = minuteMatches.reduce(
      (total, match) => total + Number(match[1]),
      0,
    );

    if (hours > 0 || minutes > 0) {
      return hours + minutes;
    }

    const fallbackMatch = normalizedPrepTime.match(/\d+/);
    return fallbackMatch ? Number(fallbackMatch[0]) : 0;
  };

  const matchesTimeFilter = (prepTimeMinutes: number, filter: string) => {
    switch (filter) {
      case "<15 mins":
        return prepTimeMinutes < 15;
      case "15-30 mins":
        return prepTimeMinutes >= 15 && prepTimeMinutes < 30;
      case "30-60 mins":
        return prepTimeMinutes >= 30 && prepTimeMinutes < 60;
      case "1+ hours":
        return prepTimeMinutes >= 60;
      default:
        return false;
    }
  };

  const matchesStepsFilter = (recipe: (typeof recipes)[number], filter: string) => {
    const steps = recipe.steps.length;
    switch (filter) {
      case "1-3 steps":
        return steps >= 1 && steps <= 3;
      case "4-5 steps":
        return steps >= 4 && steps <= 5;
      case "6+ steps":
        return steps >= 6;
      default:
        return false;
    }
  };

  const getMinExpiryDays = (recipe: (typeof recipes)[number]) => {
    let minDays = Infinity;

    recipe.ingredients.forEach((ingredient) => {
      const ingredientName = getIngredientName(ingredient);
      const item = getInventoryItem(ingredientName);
      if (item) {
        const expiry = new Date(item.expiryDate);
        const today = new Date();
        const days = Math.ceil(
          (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        minDays = Math.min(minDays, days);
      }
    });

    return minDays === Infinity ? null : minDays;
  };

  const getRecipeMatchData = (recipe: (typeof recipes)[number]) => {
    const matchedIngredients = recipe.ingredients.filter((ingredient) => {
      const ingredientName = getIngredientName(ingredient);
      const ingredientAmount = getIngredientAmount(ingredient);
      const item = getInventoryItem(ingredientName);
      return item ? item.amount >= ingredientAmount : false;
    });

    const missingIngredients = recipe.ingredients
      .filter((ingredient) => !matchedIngredients.includes(ingredient))
      .map((ingredient) => getIngredientName(ingredient));

    const matchPercentage =
      recipe.ingredients.length === 0
        ? 0
        : Math.round(
            (matchedIngredients.length / recipe.ingredients.length) * 100,
          );

    return {
      matchPercentage,
      missingIngredients,
    };
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const prepTimeMinutes = getPrepTimeMinutes(recipe.prepTime);
    const minExpiryDays = getMinExpiryDays(recipe);
    const stepsMatch =
      filters.steps.length === 0 ||
      filters.steps.some((filter) => matchesStepsFilter(recipe, filter));
    const dietaryMatch =
      filters.dietary.length === 0 ||
      recipe.dietaryTags.some((tag) => filters.dietary.includes(tag));
    const cuisineMatch =
      filters.cuisine.length === 0 ||
      filters.cuisine.includes(recipe.cuisine);
    const allergensMatch =
      filters.allergens.length === 0 ||
      filters.allergens.every((allergen) => !recipe.allergens.includes(allergen));
    const timeMatch =
      filters.time.length === 0 ||
      filters.time.some((filter) => matchesTimeFilter(prepTimeMinutes, filter));
    const expiringSoonMatch =
      !filters.expiringSoon || (minExpiryDays !== null && minExpiryDays <= 3);

    return (
      stepsMatch &&
      dietaryMatch &&
      cuisineMatch &&
      allergensMatch &&
      timeMatch &&
      expiringSoonMatch
    );
  });

  // Sort by expiry-based prioritization
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    return (getMinExpiryDays(a) ?? Infinity) - (getMinExpiryDays(b) ?? Infinity);
  });

  // Map filter to its category for consistent color coding
  const getCategoryForFilter = (filter: string): string => {
    const dietaryFilters = ["High Protein", "Vegan", "Vegetarian", "Halal", "Lactose-Free", "Gluten-Free"];
    const cuisineFilters = ["Italian", "Indian", "Mexican", "Chinese", "Thai", "Japanese", "Korean", "Mediterranean", "French", "American"];
    const allergenFilters = ["Dairy", "Eggs", "Gluten", "Nuts"];
    
    if (dietaryFilters.includes(filter)) return "dietary";
    if (cuisineFilters.includes(filter)) return "cuisine";
    if (allergenFilters.includes(filter)) return "allergens";
    if (filter.includes("steps") || filter.includes("mins") || filter.includes("hours")) return "time";
    
    return "default";
  };

  // Subtle, accessible category-based color mapping
  const getFilterColor = (filter: string) => {
    const category = getCategoryForFilter(filter);
    
    switch (category) {
      case "dietary":
        // Green for Dietary Restrictions - subtle background with dark text
        return "bg-emerald-100 text-emerald-800";
      case "cuisine":
        // Blue for Cuisine Types - subtle background with dark text
        return "bg-blue-100 text-blue-800";
      case "allergens":
        // Rose/Red for Allergens - subtle background with dark text
        return "bg-rose-100 text-rose-800";
      case "time":
        // Amber for Prep Time - subtle background with dark text
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    if (!showFilters) {
      setFilterPanelStyle(null);
      return;
    }

    const updateFilterPanelPosition = () => {
      const anchor = filterAnchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const viewportPadding = 16;
      const width = Math.min(448, window.innerWidth - viewportPadding * 2);
      const left = Math.min(
        Math.max(rect.left, viewportPadding),
        window.innerWidth - width - viewportPadding,
      );
      const top = rect.bottom + 8;
      const maxHeight = Math.max(window.innerHeight - top - viewportPadding, 180);

      setFilterPanelStyle({
        top,
        left,
        width,
        maxHeight,
      });
    };

    updateFilterPanelPosition();

    window.addEventListener("resize", updateFilterPanelPosition);
    window.addEventListener("scroll", updateFilterPanelPosition, true);

    return () => {
      window.removeEventListener("resize", updateFilterPanelPosition);
      window.removeEventListener("scroll", updateFilterPanelPosition, true);
    };
  }, [showFilters]);

  const filterPanel =
    showFilters &&
    filterPanelStyle &&
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              style={filterPanelStyle}
              className="fixed z-[60] rounded-3xl border border-gray-200 bg-white p-4 shadow-xl overflow-y-auto"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Filter Recipes
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Dietary Restrictions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dietaryFilters.map((filter) => {
                      const isActive = isFilterActive(filter);
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => toggleFilter("dietary", filter)}
                          className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                            isActive
                              ? `${getFilterColor(filter)} border-transparent`
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Cuisine Type
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cuisineFilters.map((filter) => {
                      const isActive = isFilterActive(filter);
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => toggleFilter("cuisine", filter)}
                          className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                            isActive
                              ? `${getFilterColor(filter)} border-transparent`
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Allergens (exclude)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allergenFilters.map((filter) => {
                      const isActive = isFilterActive(filter);
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => toggleFilter("allergens", filter)}
                          className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                            isActive
                              ? `${getFilterColor(filter)} border-transparent`
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Number of Steps
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stepFilters.map((filter) => {
                      const isActive = isFilterActive(filter);
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => toggleFilter("steps", filter)}
                          className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                            isActive
                              ? `${getFilterColor(filter)} border-transparent`
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Time
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {timeFilters.map((filter) => {
                      const isActive = isFilterActive(filter);
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => toggleFilter("time", filter)}
                          className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                            isActive
                              ? `${getFilterColor(filter)} border-transparent`
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Priority
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleFilter("expiringSoon", expiryOption)}
                    className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                      filters.expiringSoon
                        ? "border-transparent bg-red-500 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {expiryOption}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Cooking</h2>
              <p className="text-sm text-gray-600 mt-1 mb-2">Find recipes based on what you have</p>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                  {sortedRecipes.length} recipes available
                </div>
                <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                  7 new recipes added
                </div>
              </div>
            </div>
            <button
              type="button"
              ref={filterAnchorRef}
              onClick={() => setShowFilters((prev) => !prev)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showFilters ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
            >
              <FilterIcon className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium">Filter Recipes</span>
            </button>
          </div>
          {filterPanel}

          {/* Recipe Cards */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedRecipes.map((recipe, index) => {
                const recipeMatchData = getRecipeMatchData(recipe);
                const minExpiryDays = getMinExpiryDays(recipe);
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
                    <div className="space-y-4">
                      {isPriority && (
                        <div className="flex justify-end">
                          <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full text-right">
                            Uses Ingredients Expiring Soon!
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {recipe.name}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {recipe.prepTime}
                            </span>
                          </div>
                          {recipe.dietaryTags.map((tag) => (
                            <div
                              key={tag}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getFilterColor(tag)}`}
                            >
                              {tag}
                            </div>
                          ))}
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getFilterColor(recipe.cuisine)}`}
                          >
                            {recipe.cuisine}
                          </div>
                          {recipe.allergens.length > 0 && (
                            <div
                              className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                            >
                              Allergens: {recipe.allergens.join(", ")}
                            </div>
                          )}
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getFilterColor(`${recipe.steps.length} steps`)}`}
                          >
                            {recipe.steps.length} steps
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Ingredient Match
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {recipeMatchData.matchPercentage}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{
                              width: `${recipeMatchData.matchPercentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      {recipeMatchData.missingIngredients.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Missing:</span>{" "}
                            {recipeMatchData.missingIngredients.join(", ")}
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
              <p className="text-gray-400 mb-4">
                No recipes match your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
