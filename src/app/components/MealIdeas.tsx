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
    effort: [] as string[],
    cuisine: [] as string[],
    dietary: [] as string[],
    protein: [] as string[],
    time: [] as string[],
    expiringSoon: false,
  });

  const recipeFilters = [
    "High Protein",
    "Vegan",
    "Vegetarian",
    "Halal",
    "Lactose-Free",
    "Gluten-Free",
    "Italian",
    "Indian",
    "Mexican",
    "Chinese",
    "Low Effort",
    "Med-Low Effort",
  ];
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
      filters.effort.includes(value) ||
      filters.cuisine.includes(value) ||
      filters.dietary.includes(value) ||
      filters.protein.includes(value) ||
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

  const matchesEffortFilter = (recipe: (typeof recipes)[number], filter: string) => {
    if (recipe.dietaryTags.includes(filter)) {
      return true;
    }

    const normalizedDifficulty =
      filter === "Med-Low Effort" ? "Medium" : filter.replace(" Effort", "");

    return recipe.difficulty === normalizedDifficulty;
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
    const effortMatch =
      filters.effort.length === 0 ||
      filters.effort.some((filter) => matchesEffortFilter(recipe, filter));
    const dietaryMatch =
      filters.dietary.length === 0 ||
      recipe.dietaryTags.some((tag) => filters.dietary.includes(tag));
    const timeMatch =
      filters.time.length === 0 ||
      filters.time.some((filter) => matchesTimeFilter(prepTimeMinutes, filter));
    const expiringSoonMatch =
      !filters.expiringSoon || (minExpiryDays !== null && minExpiryDays <= 3);

    return effortMatch && dietaryMatch && timeMatch && expiringSoonMatch;
  });

  // Sort by expiry-based prioritization
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    return (getMinExpiryDays(a) ?? Infinity) - (getMinExpiryDays(b) ?? Infinity);
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
    if (filter === "<15 mins") return "bg-sky-500 text-white";
    if (filter === "15-30 mins") return "bg-cyan-500 text-white";
    if (filter === "30-60 mins") return "bg-indigo-500 text-white";
    if (filter === "1+ hours") return "bg-slate-500 text-white";
    return "bg-gray-400 text-white";
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
                    Recipe Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recipeFilters.map((filter) => {
                      const isActive = isFilterActive(filter);
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => toggleFilter("effort", filter)}
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
            <h2 className="text-2xl font-bold text-gray-900">Cooking</h2>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md">
              {user.initials}
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            Choose a recipe to make using the ingredients you have available!
          </p>

          <div
            ref={filterAnchorRef}
            className="relative mb-6 flex items-center gap-2 text-gray-700"
          >
            <div className="flex items-center gap-2 p-2 rounded-lg">
              <Utensils className="w-5 h-5" />
              <span>Cooking</span>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2 rounded-full transition-colors ${
                showFilters ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
            >
              <FilterIcon className="w-5 h-5" />
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
                    {isPriority && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        Uses Ingredients Expiring Soon!
                      </div>
                    )}

                    <div className="space-y-4">
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
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getFilterColor(recipe.difficulty + " Effort")}`}
                          >
                            {recipe.difficulty} Effort
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
