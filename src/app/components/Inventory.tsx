import React, { useState } from "react";
import { Search, Plus, Users, User, ArrowLeft, Boxes, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Inventory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const [activeFilter, setActiveFilter] = useState<"all" | "personal" | "shared">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "expiring-soon" | "expired">("all");
  const [quantityFilter, setQuantityFilter] = useState<"all" | "low" | "out">("all");
  const [sortBy, setSortBy] = useState<"name" | "expiry" | "quantity">("name");
  const { inventory, shoppingList, user, roommates } = useApp();

  const normalizeItemName = (name: string) => name.trim().toLowerCase();
  const neededShoppingItems = shoppingList.filter((item) => item.needed);

  const isCurrentUserListOwner = (addedBy: string) =>
    ["me", user.name, user.initials, user.username].some(
      (value) => value.toLowerCase() === addedBy.toLowerCase(),
    );

  const filteredItems = inventory.filter(item => {
    const matchesFilter = 
      activeFilter === "all" || 
      (activeFilter === "shared" && item.isShared) || 
      (activeFilter === "personal" && !item.isShared);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpiry = (() => {
      if (expiryFilter === "all") return true;
      const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
      if (expiryFilter === "expired") return daysUntilExpiry < 0;
      if (expiryFilter === "expiring-soon") return daysUntilExpiry >= 0 && daysUntilExpiry <= 6;
      return true;
    })();
    
    const matchesQuantity = (() => {
      if (quantityFilter === "all") return true;
      if (quantityFilter === "low") return item.status === "Low";
      if (quantityFilter === "out") return item.status === "Out";
      return true;
    })();
    
    return matchesFilter && matchesSearch && matchesExpiry && matchesQuantity;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "expiry":
        const daysA = getDaysUntilExpiry(a.expiryDate);
        const daysB = getDaysUntilExpiry(b.expiryDate);
        return daysA - daysB;
      case "quantity":
        // Sort by amount (numeric value)
        return b.amount - a.amount;
      default:
        return 0;
    }
  });

  const getDaysUntilExpiry = (expiryDate: string) => {
    try {
      const expiry = new Date(expiryDate + 'T00:00:00'); // Ensure it's parsed as local time
      // Use a fixed date for demo purposes to match the mock data
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

        {/* Additional Filters */}
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium flex items-center justify-between hover:bg-gray-800 transition-colors">
                {expiryFilter === "all" ? "All Expiry Dates" : 
                 expiryFilter === "expiring-soon" ? "Expiring Soon (≤7 days)" : 
                 "Expired"}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuRadioGroup
                value={expiryFilter}
                onValueChange={(value) => setExpiryFilter(value as typeof expiryFilter)}
              >
                <DropdownMenuRadioItem value="all">
                  All Expiry Dates
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="expiring-soon">
                  Expiring Soon (≤7 days)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="expired">
                  Expired
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium flex items-center justify-between hover:bg-gray-800 transition-colors">
                {quantityFilter === "all" ? "All Quantities" : 
                 quantityFilter === "low" ? "Low Stock" : 
                 "Out of Stock"}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuRadioGroup
                value={quantityFilter}
                onValueChange={(value) => setQuantityFilter(value as typeof quantityFilter)}
              >
                <DropdownMenuRadioItem value="all">
                  All Quantities
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium flex items-center justify-between hover:bg-gray-800 transition-colors">
                Sort by {sortBy === "name" ? "Name" : sortBy === "expiry" ? "Expiry" : "Quantity"}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
              >
                <DropdownMenuRadioItem value="name">
                  Name
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="expiry">
                  Expiry
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="quantity">
                  Quantity
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
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-gray-400 bg-gray-100 flex-shrink-0`}
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
