import React, { useState } from "react";
import { Search, Plus, Users, User, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";

export const Inventory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const [activeFilter, setActiveFilter] = useState<"all" | "personal" | "shared">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { inventory, shoppingList, user, roommates } = useApp();

  const normalizeItemName = (name: string) => name.trim().toLowerCase();
  const shoppingListNames = new Set(
    shoppingList
      .filter((item) => item.needed)
      .map((item) => normalizeItemName(item.name)),
  );

  const filteredItems = inventory.filter(item => {
    const matchesFilter = 
      activeFilter === "all" || 
      (activeFilter === "shared" && item.isShared) || 
      (activeFilter === "personal" && !item.isShared);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUpdaterInitials = (updatedBy: string) => {
    const householdMember = [user, ...roommates].find(
      (member) =>
        member.initials === updatedBy ||
        member.name.toLowerCase() === updatedBy.toLowerCase(),
    );

    if (householdMember) {
      return householdMember.initials;
    }

    return updatedBy
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-6 space-y-4">
        {typeParam && (
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-4"
          >
            <div className="p-2 border border-gray-300 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
        )}

        <h2 className="text-2xl font-bold text-gray-900">Grocery Inventory</h2>
        
        {/* Filter Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${
              activeFilter === "all"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              activeFilter === "all" ? "bg-green-200" : "bg-gray-100"
            }`}>
              <Users className={`w-5 h-5 ${
                activeFilter === "all" ? "text-green-700" : "text-gray-600"
              }`} />
            </div>
            <span className="text-xs font-medium text-gray-700">View All</span>
          </button>

          <button
            onClick={() => setActiveFilter("personal")}
            className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${
              activeFilter === "personal"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              activeFilter === "personal" ? "bg-blue-200" : "bg-gray-100"
            }`}>
              <User className={`w-5 h-5 ${
                activeFilter === "personal" ? "text-blue-700" : "text-gray-600"
              }`} />
            </div>
            <span className="text-xs font-medium text-gray-700">View Personal</span>
          </button>

          <button
            onClick={() => setActiveFilter("shared")}
            className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${
              activeFilter === "shared"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              activeFilter === "shared" ? "bg-green-200" : "bg-gray-100"
            }`}>
              <Users className={`w-5 h-5 ${
                activeFilter === "shared" ? "text-green-700" : "text-gray-600"
              }`} />
            </div>
            <span className="text-xs font-medium text-gray-700">View Shared</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search Item" 
            className="w-full pl-4 pr-12 py-3 bg-gray-100 border border-gray-200 rounded-lg outline-none focus:border-gray-300 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
            const expiryColor = daysUntilExpiry < 3 ? 'bg-red-100 border-red-300' : 
                                daysUntilExpiry < 7 ? 'bg-orange-100 border-orange-300' : 
                                'bg-white border-gray-200';
            const inShoppingList = shoppingListNames.has(
              normalizeItemName(item.name),
            );
            
            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/inventory/${item.id}`)}
                className={`relative p-4 rounded-2xl border-2 ${expiryColor} shadow-sm cursor-pointer hover:shadow-md transition-all`}
              >
                {/* Shopping list badge */}
                {inShoppingList && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    In Your List
                  </div>
                )}

                <div className={`${inShoppingList ? "mt-10" : ""}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.isShared ? "bg-green-200" : "bg-blue-200"
                    }`}>
                      {item.isShared ? (
                        <Users className="w-4 h-4 text-green-700" />
                      ) : (
                        <User className="w-4 h-4 text-blue-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                      <div className="text-sm text-blue-600">{item.quantity}</div>
                    </div>
                  </div>

                  {daysUntilExpiry <= 7 && (
                    <div className={`text-xs font-medium mb-2 ${
                      daysUntilExpiry < 3 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      Earliest expiry: {formatExpiryDate(item.expiryDate)}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Last bought: {item.lastAdded} 
                    <span className="inline-flex items-center ml-1">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white text-[8px] font-bold">
                        {getUpdaterInitials(item.updatedBy)}
                      </div>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No items found</p>
        </div>
      )}
      
      <Link to="/add-item" className="fixed bottom-24 right-6">
        <button className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 active:scale-95 transition-all">
          <Plus className="w-8 h-8" />
        </button>
      </Link>
    </div>
  );
};
