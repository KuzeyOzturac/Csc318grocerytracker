import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import {
  Home,
  ClipboardList,
  Receipt,
  ShoppingCart,
  Coffee,
  Utensils,
  X,
} from "lucide-react";
import { Toaster } from "sonner";
import { useApp } from "../context/AppContext";

export const Layout = () => {
  const location = useLocation();
  const { user } = useApp();
  const [showChefCat, setShowChefCat] = useState(false);
  const [quote, setQuote] = useState("");

  const chefQuotes = [
    "The secret ingredient is always love... and a little bit of catnip seasoning!",
    "I'm paws-itively the best chef in the kitchen!",
    "Life is too short for kibble cuisine.",
    "I didn't choose the cook life, the cook life chose meow.",
    "Cooking is like meow-gic... but delicious!",
    "Every meal is a purr-fection waiting to happen.",
    "I knead the dough like I knead your love.",
    "That's not how you cut a fish... let me show you with my claws!",
    "A balanced diet is a snack in each paw.",
    "I'm whisker-lickin' good at what I do!",
    "Cooking is 90% confidence and 10% hoping nobody sees the mess.",
    "I've got 9 lives, and I've perfected this recipe in all of them.",
    "Keep calm and let Chef Whiskers handle it.",
    "This kitchen is no place for mice... only for fine dining!",
    "I make food so good, even dogs would approve.",
  ];

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * chefQuotes.length);
    setQuote(chefQuotes[randomIndex]);
  };

  const handleOpenChefCat = () => {
    getRandomQuote();
    setShowChefCat(true);
  };

  const navItems = [
    { icon: Home, label: "Feed", path: "/" },
    { icon: ClipboardList, label: "Inventory", path: "/inventory" },
    { icon: Receipt, label: "Scan Receipt", path: "/scan-receipt" },
    { icon: ShoppingCart, label: "Shopping List", path: "/shopping" },
    { icon: Utensils, label: "Cooking", path: "/meals" },
  ];

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-100"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1
          onClick={handleOpenChefCat}
          className="text-3xl text-gray-900 cursor-pointer hover:text-green-600 transition-colors"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Bounty Biter
        </h1>
        <Link to="/profile" className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md">
            {user.initials}
          </div>
        </Link>
      </header>

      <main className="flex-1 pb-24 overflow-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === "/inventory" &&
              location.pathname.startsWith("/inventory")) ||
            (item.path === "/meals" && location.pathname.startsWith("/meals"));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all py-2 px-3 rounded-lg ${
                isActive
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Toaster position="top-center" />

      {/* Chef Cat Easter Egg Modal */}
      {showChefCat && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
          onClick={() => setShowChefCat(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowChefCat(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            <div className="text-center space-y-4">
              {/* Chef Cat Card */}
              <div className="text-7xl mb-4">
                🐱👨‍🍳
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                Chef Whiskers
              </h2>
              <p className="text-gray-600 text-lg italic">
                "{quote}"
              </p>

              <button
                onClick={() => setShowChefCat(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors"
              >
                Back to Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
