import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Camera, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

type AddMode = "manual" | "receipt" | "recipe";

export const AddItem = () => {
  const navigate = useNavigate();
  const { addInventoryItem } = useApp();
  const [mode, setMode] = useState<AddMode>("manual");

  // Manual add form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Produce");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("items");
  const [isShared, setIsShared] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");

  const categories = ["Produce", "Dairy", "Meat", "Pantry", "Bakery", "Frozen", "Other"];
  const units = ["items", "g", "kg", "mL", "L", "cups", "oz", "lbs"];

  const handleManualAdd = () => {
    if (!name || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quantity = `${amount} ${unit}`;
    const numAmount = parseFloat(amount);

    addInventoryItem({
      name,
      category,
      isShared,
      status: numAmount > 0 ? "In Stock" : "Out",
      lastAdded: "Just now",
      updatedBy: "ME",
      quantity,
      expiryDate: expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      unit,
      amount: numAmount,
    });

    toast.success(`${name} added to inventory!`);
    navigate("/inventory");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 pb-12">
        <button
          onClick={() => navigate("/inventory")}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-3xl font-black text-white mb-2">Add Items</h1>
          <p className="text-green-100">Choose how to add items to your inventory</p>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Mode Selection */}
        <div className="flex gap-3 bg-white rounded-3xl shadow-lg p-2">
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
              mode === "manual"
                ? "bg-green-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setMode("receipt")}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
              mode === "receipt"
                ? "bg-green-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Scan Receipt
          </button>
          <button
            onClick={() => setMode("recipe")}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
              mode === "recipe"
                ? "bg-green-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            From Recipe
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-3xl shadow-lg p-6 space-y-6"
            >
              <h2 className="text-xl font-black text-gray-900">Manual Entry</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Item Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Whole Milk"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-green-300 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-green-300 transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Amount *</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g., 2"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-green-300 transition-all"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Unit</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-green-300 transition-all"
                    >
                      {units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-green-300 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="font-bold text-gray-700">Shared with Household</span>
                  <button
                    onClick={() => setIsShared(!isShared)}
                    className={`w-14 h-7 rounded-full transition-colors relative ${
                      isShared ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                        isShared ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={handleManualAdd}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add to Inventory
              </button>
            </motion.div>
          )}

          {mode === "receipt" && (
            <motion.div
              key="receipt"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-3xl shadow-lg p-6 space-y-6"
            >
              <h2 className="text-xl font-black text-gray-900">Scan Receipt</h2>
              <p className="text-gray-600">Upload a receipt to automatically add items</p>

              <div className="border-4 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 hover:border-green-300 transition-colors cursor-pointer">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Camera className="w-10 h-10 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">Take Photo or Upload</p>
                  <p className="text-sm text-gray-500">We'll scan and add items automatically</p>
                </div>
                <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
                  Choose File
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Tip: Make sure the receipt is clear and all items are visible
              </p>
            </motion.div>
          )}

          {mode === "recipe" && (
            <motion.div
              key="recipe"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-3xl shadow-lg p-6 space-y-6"
            >
              <h2 className="text-xl font-black text-gray-900">Auto-deduct from Recipe</h2>
              <p className="text-gray-600">
                After cooking a recipe, PantryPal can automatically deduct the ingredients used
              </p>

              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">How it works</h3>
                    <p className="text-sm text-gray-600">Complete a recipe and confirm ingredients used</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">To use this feature:</p>
                <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                  <li>Go to Meal Ideas</li>
                  <li>Select a recipe to cook</li>
                  <li>Follow the cooking steps</li>
                  <li>Confirm ingredients used at the end</li>
                </ol>
              </div>

              <button
                onClick={() => navigate("/meals")}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all"
              >
                Go to Meal Ideas
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
