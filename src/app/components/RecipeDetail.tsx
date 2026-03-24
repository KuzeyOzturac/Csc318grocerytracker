import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Clock, ChefHat, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export const RecipeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { recipes, inventory, useInventoryItem, addShoppingItem, user } = useApp();

  const recipe = recipes.find((r) => r.id === id);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Recipe not found</p>
      </div>
    );
  }

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((s) => s !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const getIngredientName = (ingredient: (typeof recipe.ingredients)[number]) =>
    typeof ingredient === "string" ? ingredient : ingredient.name;

  const getIngredientAmount = (
    ingredient: (typeof recipe.ingredients)[number],
  ) => (typeof ingredient === "string" ? 1 : ingredient.amount);

  const getIngredientQuantity = (
    ingredient: (typeof recipe.ingredients)[number],
  ) => (typeof ingredient === "string" ? "1 unit" : ingredient.quantity);

  const getInventoryItem = (ingredientName: string) =>
    inventory.find(
      (item) => item.name.toLowerCase() === ingredientName.toLowerCase(),
    );

  const hasEnoughInventory = (
    ingredientName: string,
    requiredAmount: number,
  ) => {
    const item = getInventoryItem(ingredientName);
    return item ? item.amount >= requiredAmount : false;
  };

  const handleFinishCooking = () => {
    setSelectedIngredients(
      recipe.ingredients.map((ingredient) => getIngredientName(ingredient)),
    );
    setShowConfirmDialog(true);
  };

  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(
        selectedIngredients.filter((i) => i !== ingredient),
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleConfirmUsage = () => {
    // Deduct used ingredients from inventory and update feed
    const eventId = `cooking-${Date.now()}`; // Unique ID for this cooking event
    let deductedCount = 0;

    selectedIngredients.forEach((ingredientName) => {
      const ingredient = recipe.ingredients.find(
        (candidate) => getIngredientName(candidate) === ingredientName,
      );
      const item = getInventoryItem(ingredientName);

      if (
        ingredient &&
        item &&
        item.amount >= getIngredientAmount(ingredient)
      ) {
        useInventoryItem(
          item.id,
          getIngredientAmount(ingredient),
          eventId,
          recipe.id,
          recipe.name
        );
        deductedCount += 1;
      }
    });

    // Close dialog and navigate immediately
    setShowConfirmDialog(false);
    toast.success(
      `Recipe completed! ${deductedCount} ingredient${deductedCount === 1 ? "" : "s"} deducted from inventory.`,
    );
    navigate("/inventory");
  };

  const handleAddMissingToShoppingList = () => {
    if (missingIngredients.length === 0) {
      toast.info("No missing ingredients!");
      return;
    }

    let addedCount = 0;
    missingIngredients.forEach((ingredientName) => {
      const ingredient = recipe.ingredients.find(
        (candidate) => getIngredientName(candidate) === ingredientName,
      );
      if (ingredient) {
        const ingredientQuantity = getIngredientQuantity(ingredient);
        addShoppingItem({
          name: ingredientName,
          category: "Other",
          addedBy: user.name,
          needed: true,
          quantity: ingredientQuantity,
        });
        addedCount += 1;
      }
    });

    toast.success(
      `Added ${addedCount} ingredient${addedCount === 1 ? "" : "s"} to shopping list!`,
    );
  };

  const difficultyColor =
    recipe.difficulty === "Low"
      ? "bg-green-100 text-green-700"
      : recipe.difficulty === "Medium"
        ? "bg-orange-100 text-orange-700"
        : "bg-red-100 text-red-700";

  const missingIngredients = recipe.ingredients
    .filter((ingredient) => {
      const ingredientName = getIngredientName(ingredient);
      const ingredientAmount = getIngredientAmount(ingredient);
      return !hasEnoughInventory(ingredientName, ingredientAmount);
    })
    .map((ingredient) => getIngredientName(ingredient));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 pb-12">
        <button
          onClick={() => navigate("/meals")}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white">{recipe.name}</h1>

          <div className="flex gap-3">
            <div className="px-4 py-2 bg-white/20 rounded-full border-2 border-white/30">
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">{recipe.prepTime}</span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full ${difficultyColor}`}>
              <span className="text-sm font-bold">
                {recipe.difficulty} Effort
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {recipe.dietaryTags.map((tag) => (
              <div key={tag} className="px-3 py-1 bg-white/90 rounded-full">
                <span className="text-xs font-bold text-green-700">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Ingredients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-6 space-y-4"
        >
          <h2 className="text-xl font-black text-gray-900">Ingredients</h2>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => {
              const ingredientName = getIngredientName(ingredient);
              const ingredientAmount = getIngredientAmount(ingredient);
              const ingredientQuantity = getIngredientQuantity(ingredient);
              const inInventory = getInventoryItem(ingredientName);
              const hasEnough = hasEnoughInventory(
                ingredientName,
                ingredientAmount,
              );
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    hasEnough ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  {hasEnough ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {ingredientName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Recipe needs {ingredientQuantity}
                    </div>
                  </div>
                  {inInventory && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-green-600">
                        {inInventory.quantity}
                      </div>
                      <div className="text-[11px] text-gray-500">on hand</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {missingIngredients.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <p className="text-sm text-red-600">
                <span className="font-bold">Missing:</span>{" "}
                {missingIngredients.join(", ")}
              </p>
              <button
                onClick={handleAddMissingToShoppingList}
                className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add Missing to Shopping List
              </button>
            </div>
          )}
        </motion.div>

        {/* Cooking Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">Cooking Steps</h2>
            <div className="text-sm font-bold text-gray-500">
              {completedSteps.length}/{recipe.steps.length}
            </div>
          </div>

          <div className="space-y-3">
            {recipe.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              return (
                <motion.div
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleStep(index)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isCompleted
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                          isCompleted
                            ? "bg-green-600 text-white"
                            : "bg-white border-2 border-gray-300 text-gray-600"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`leading-relaxed ${
                          isCompleted
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Finish Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleFinishCooking}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
          >
            <ChefHat className="w-5 h-5" />
            Finish Cooking
          </button>
        </motion.div>
      </div>

      {/* Confirm Ingredients Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmDialog(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto max-h-[80vh] overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">
                    Confirm Ingredients Used
                  </h2>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <p className="text-gray-600">
                  Select the ingredients you actually used. These will be
                  deducted from your inventory.
                </p>

                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient) => {
                    const ingredientName = getIngredientName(ingredient);
                    const ingredientAmount = getIngredientAmount(ingredient);
                    const ingredientQuantity = getIngredientQuantity(ingredient);
                    const item = getInventoryItem(ingredientName);
                    const isSelected = selectedIngredients.includes(
                      ingredientName,
                    );

                    return (
                      <div
                        key={ingredientName}
                        onClick={() => toggleIngredient(ingredientName)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-green-50 border-green-300"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "bg-green-600 border-green-600"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {ingredientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Deduct {ingredientQuantity}
                            </div>
                          </div>
                          <div className="text-right">
                            {item && (
                              <div className="text-xs font-bold text-gray-500">
                                Current: {item.quantity}
                              </div>
                            )}
                            {!hasEnoughInventory(
                              ingredientName,
                              ingredientAmount,
                            ) && (
                              <div className="text-xs font-medium text-red-500">
                                Not enough in inventory
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleConfirmUsage}
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors"
                  >
                    Confirm & Update Inventory
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
