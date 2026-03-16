import React from "react";
import { Link, Outlet, useLocation } from "react-router";
import {
  Home,
  ClipboardList,
  Receipt,
  ShoppingCart,
  Coffee,
  Utensils,
} from "lucide-react";
import { Toaster } from "sonner";
import { useApp } from "../context/AppContext";

export const Layout = () => {
  const location = useLocation();
  const { user } = useApp();

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
          className="text-3xl text-gray-900"
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
    </div>
  );
};
