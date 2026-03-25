import React, { useState } from "react";
import { Search, Plus, Users, User, ArrowLeft, Boxes, ChevronDown, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";

export const Inventory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const [activeFilter, setActiveFilter] = useState<"all" | "personal" | "shared">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "expiry-asc" | "expiry-desc" | "quantity-asc" | "quantity-desc" | "lastBought-asc" | "lastBought-desc">("name-asc");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "expiring-soon" | "expired">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [showCookingBubble, setShowCookingBubble] = useState(true);
  const { inventory, shoppingList, user, roommates, recipes } = useApp();

  const normalizeItemName = (name: string) => name.trim().toLowerCase();
  const neededShoppingItems = shoppingList.filter((item) => item.needed);

  const isCurrentUserListOwner = (addedBy: string) =>
    ["me", user.name, user.initials, user.username].some(
      (value) => value.toLowerCase() === addedBy.toLowerCase(),
    );

  const getDaysUntilExpiry = (expiryDate: string) => {
    try {
      const expiry = new Date(expiryDate + 'T00:00:00');
      const today = new Date('2026-03-24T00:00:00');
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating days until expiry:', error, expiryDate);
      return Infinity;
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredItems = inventory.filter(item => {
    const matchesFilter = 
      activeFilter === "all" || 
      (activeFilter === "shared" && item.isShared) || 
      (activeFilter === "personal" && !item.isShared);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply expiry filter
    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
    const matchesExpiryFilter = (() => {
      if (expiryFilter === "all") return true;
      if (expiryFilter === "expiring-soon") return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
      if (expiryFilter === "expired") return daysUntilExpiry < 0;
      return true;
    })();
    
    // Apply stock filter
    const matchesStockFilter = (() => {
      if (stockFilter === "all") return true;
      if (stockFilter === "low") return item.status === "Low";
      if (stockFilter === "out") return item.status === "Out";
      return true;
    })();
    
    return matchesFilter && matchesSearch && matchesExpiryFilter && matchesStockFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const isDescending = sortBy.includes("-desc");
    const sortType = sortBy.replace("-asc", "").replace("-desc", "");
    let comparison = 0;
    
    if (sortType === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortType === "expiry") {
      comparison = getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate);
    } else if (sortType === "quantity") {
      comparison = a.amount - b.amount;
    } else if (sortType === "lastBought") {
      const lastAddedOrder: Record<string, number> = {
        "Just now": 0,
        "Today": 1,
        "Yesterday": 2,
        "1": 3,
        "2": 4,
        "3": 5,
        "4": 6,
        "5": 7,
        "week": 8,
        "month": 9,
      };
      const aOrder = Object.entries(lastAddedOrder).find(([key]) => a.lastAdded.includes(key))?.[1] ?? 999;
      const bOrder = Object.entries(lastAddedOrder).find(([key]) => b.lastAdded.includes(key))?.[1] ?? 999;
      comparison = aOrder - bOrder;
    }
    
    return isDescending ? -comparison : comparison;
  });

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

  const getListBadge = (itemName: string) => {
    const matchedItems = neededShoppingItems.filter(
      (shoppingItem) =>
        normalizeItemName(shoppingItem.name) === normalizeItemName(itemName),
    );

    if (matchedItems.some((shoppingItem) => isCurrentUserListOwner(shoppingItem.addedBy))) {
      return {
        label: "In Your List",
        className: "bg-orange-500 text-white",
      };
    }

    if (matchedItems.length > 0) {
      return {
        label: "In Roommate's List",
        className: "bg-blue-500 text-white",
      };
    }

    return null;
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
        
        {/* Cooking Popup Bubble */}
        {showCookingBubble && recipes && recipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-200 rounded-full"
          >
            <button
              onClick={() => navigate("/meals")}
              className="flex-1 text-left hover:opacity-80 transition-opacity"
            >
              <span className="text-sm font-semibold text-orange-900">
                🧑‍🍳 get cooking! <span className="font-bold text-orange-600">{recipes.length}</span> recipes available
              </span>
            </button>
            <button
              onClick={() => setShowCookingBubble(false)}
              className="flex-shrink-0 text-orange-600 hover:text-orange-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
        
        {/* Filter Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${
              activeFilter === "all"
                ? "border-yellow-500 bg-yellow-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              activeFilter === "all" ? "bg-yellow-200" : "bg-gray-100"
            }`}>
              <Boxes className={`w-5 h-5 ${
                activeFilter === "all" ? "text-yellow-700" : "text-gray-600"
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

        {/* Sorting and Filtering */}
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium flex items-center justify-between hover:bg-gray-800 transition-colors">
                Sort by {sortBy.includes("name") ? "Name" : sortBy.includes("expiry") ? "Expiry Date" : sortBy.includes("quantity") ? "Quantity" : "Last Bought"} {sortBy.includes("-desc") ? "↓" : "↑"}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
              >
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Name</div>
                <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
                
                <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase">Expiry Date</div>
                <DropdownMenuRadioItem value="expiry-asc">Expiring Soon First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="expiry-desc">Expiring Last</DropdownMenuRadioItem>
                
                <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase">Quantity</div>
                <DropdownMenuRadioItem value="quantity-asc">Lowest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="quantity-desc">Highest First</DropdownMenuRadioItem>
                
                <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase">Last Bought</div>
                <DropdownMenuRadioItem value="lastBought-asc">Oldest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="lastBought-desc">Most Recent First</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium flex items-center justify-between hover:bg-gray-800 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Expiry Status
              </div>
              <DropdownMenuRadioGroup
                value={expiryFilter}
                onValueChange={(value) => setExpiryFilter(value as typeof expiryFilter)}
              >
                <DropdownMenuRadioItem value="all">
                  All Items
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="expiring-soon">
                  Expiring Soon (≤7 days)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="expired">
                  Expired
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              
              <div className="my-1 h-px bg-gray-200" />
              
              <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Stock Status
              </div>
              <DropdownMenuRadioGroup
                value={stockFilter}
                onValueChange={(value) => setStockFilter(value as typeof stockFilter)}
              >
                <DropdownMenuRadioItem value="all">
                  All Stock
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="low">
                  Low Stock
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="out">
                  Out of Stock
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedItems.map((item, index) => {
            const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
            const listBadge = getListBadge(item.name);
            
            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/inventory/${item.id}`)}
                className={`relative p-4 rounded-2xl border-2 bg-white border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 border-2 ${
                      item.isShared ? "border-green-300" : "border-blue-300"
                    }`}>
                      {item.isShared ? (
                        <Users className="w-4 h-4 text-gray-500" />
                      ) : (
                        <User className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 flex-1">{item.name}</h4>
                    {listBadge && (
                      <div
                        className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-gray-400 bg-gray-100 flex-shrink-0 whitespace-nowrap`}
                      >
                        {listBadge.label}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{item.quantity}</div>

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

      {sortedItems.length === 0 && (
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
