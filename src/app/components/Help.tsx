import React from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Home,
  ClipboardList,
  Utensils,
  ShoppingCart,
  Users,
  Plus,
  HelpCircle,
} from "lucide-react";
import { motion } from "motion/react";

export const Help = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Home className="w-8 h-8" />,
      title: "Home Screen",
      description: "Quick access to your personal and shared groceries",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <ClipboardList className="w-8 h-8" />,
      title: "Inventory",
      description:
        "Track what's in your pantry with real-time updates and expiry dates",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "Cooking",
      description: "Get recipe suggestions and cook meals using your inventory",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Shopping List",
      description: "Collaborate with roommates on shared shopping lists",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Shared vs Personal",
      description:
        "Color-coded labels help you distinguish between shared and personal items",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: <Plus className="w-8 h-8" />,
      title: "Add Items",
      description:
        "Multiple ways to add items: manual entry, receipt scanning, or from recipes",
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  const tips = [
    "Tap an item to view details and adjust quantities",
    "Use the toggle to mark items as shared or personal",
    "Filter your inventory by 'All', 'Shared', or 'Personal'",
    "Expiry dates help you prioritize what to use first",
    "Recipe suggestions show what percentage of ingredients you have",
    "Add roommates by sharing your User ID from the profile page",
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 pb-12">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Help & Tips</h1>
          <p className="text-green-100">Learn how to use PantryPal</p>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* App Purpose */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-6 space-y-3"
        >
          <h2 className="text-xl font-black text-gray-900">
            What is PantryPal?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            PantryPal is designed for shared households to track groceries, plan
            meals, and avoid duplicate purchases. Keep clear visibility into
            what's shared vs personal, get meal suggestions based on available
            ingredients, and shop confidently knowing what's already at home.
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
            Features & Icons
          </h2>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl shadow-lg p-6 space-y-4"
        >
          <h2 className="text-xl font-black text-green-900">Quick Tips</h2>
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">
                    {index + 1}
                  </span>
                </div>
                <p className="text-gray-700">{tip}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Color Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-lg p-6 space-y-4"
        >
          <h2 className="text-xl font-black text-gray-900">Status Colors</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">STOCK</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">In Stock</p>
                <p className="text-sm text-gray-500">Item is available</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-xs font-bold text-orange-700">LOW</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">Low Stock</p>
                <p className="text-sm text-gray-500">
                  Running low, consider restocking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-xs font-bold text-red-700">OUT</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">Out of Stock</p>
                <p className="text-sm text-gray-500">Need to purchase</p>
              </div>
            </div>
          </div>
        </motion.div>

        <button
          onClick={() => navigate("/")}
          className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition-all"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
};
