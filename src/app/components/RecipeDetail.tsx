import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Circle, Clock, ChefHat, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export const RecipeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { recipes, inventory, updateInventoryItem } = useApp();

  const recipe = recipes.find((r) => r.id === id);
  const [currentStep, setCurrentStep] = useState(0);
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

  const handleFinishCooking = () => {
    setSelectedIngredients(recipe.ingredients);
    setShowConfirmDialog(true);
  };

  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleConfirmUsage = () => {
    // Deduct used ingredients from inventory
    selectedIngredients.forEach((ingredientName) => {
      const item = inventory.find(
        (i) => i.name.toLowerCase() === ingredientName.toLowerCase()
      );
      if (item && item.amount > 0) {
        const newAmount = Math.max(0, item.amount - 1);
        const newQuantity = `${newAmount} ${item.unit}`;
        const newStatus = newAmount === 0 ? "Out" : newAmount < 3 ? "Low" : "In Stock";
        
        updateInventoryItem(item.id, {
          amount: newAmount,
          quantity: newQuantity,
          status: newStatus,
          lastAdded: "Just now",
          updatedBy: "ME",
        });
      }
    });

    toast.success(`Recipe completed! ${selectedIngredients.length} ingredients deducted from inventory.`);
    navigate("/inventory");
  };

  const difficultyColor =
    recipe.difficulty === "Low"
      ? "bg-green-100 text-green-700"
      : recipe.difficulty === "Medium"
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700";

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
              <span className="text-sm font-bold">{recipe.difficulty} Effort</span>
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
              const inInventory = inventory.find(
                (i) => i.name.toLowerCase() === ingredient.toLowerCase()
              );
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    inInventory ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  {inInventory ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <span className="flex-1 font-medium text-gray-900">{ingredient}</span>
                  {inInventory && (
                    <span className="text-xs font-bold text-green-600">
                      {inInventory.quantity}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {recipe.missingIngredients.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-red-600">
                <span className="font-bold">Missing:</span> {recipe.missingIngredients.join(", ")}
              </p>
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
                        {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`leading-relaxed ${
                          isCompleted ? "text-gray-500 line-through" : "text-gray-900"
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
                  <h2 className="text-2xl font-black text-gray-900">Confirm Ingredients Used</h2>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <p className="text-gray-600">
                  Select the ingredients you actually used. These will be deducted from your inventory.
                </p>

                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient) => {
                    const item = inventory.find(
                      (i) => i.name.toLowerCase() === ingredient.toLowerCase()
                    );
                    const isSelected = selectedIngredients.includes(ingredient);
                    
                    return (
                      <div
                        key={ingredient}
                        onClick={() => toggleIngredient(ingredient)}
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
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span className="flex-1 font-medium text-gray-900">{ingredient}</span>
                          {item && (
                            <span className="text-xs font-bold text-gray-500">
                              Current: {item.quantity}
                            </span>
                          )}
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
