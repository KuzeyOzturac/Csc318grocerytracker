import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { ChevronDown, Users, User } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  DropdownMenuCheckboxItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  type: "shared" | "personal" | "mixed";
  items: Array<{
    name: string;
    quantity: string;
    isShared: boolean;
  }>;
  timestamp: string;
  date: string;
  action: "added" | "bought" | "removed" | "used";
  eventId?: string;
  recipeId?: string;
  recipeName?: string;
}

type DateFilter = "all" | "today" | "last7" | "last30";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, roommates, feed, inventory } = useApp();
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [roomName, setRoomName] = useState("TC203");
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);

  const allRoommates = [user, ...roommates];
  const allRoommateIds = allRoommates.map((roommate) => roommate.id);
  const [selectedRoommateIds, setSelectedRoommateIds] = useState<string[]>(
    allRoommateIds,
  );
  const getRoommateRoute = (userId: string) => `/roommates/${userId}`;
  const dateFilterLabel =
    dateFilter === "all"
      ? "Date Range"
      : dateFilter === "today"
        ? "Today"
        : dateFilter === "last7"
          ? "Last 7 Days"
          : "Last 30 Days";
  const roommateFilterLabel =
    selectedRoommateIds.length === allRoommateIds.length
      ? "From All Roommates"
      : selectedRoommateIds.length === 0
        ? "No Roommates Selected"
        : selectedRoommateIds.length === 1
          ? `From ${
              allRoommates.find(
                (roommate) => roommate.id === selectedRoommateIds[0],
              )?.name ?? "Selected Roommate"
            }`
          : `From ${selectedRoommateIds.length} Roommates`;

  useEffect(() => {
    setSelectedRoommateIds((currentSelection) => {
      const validSelection = currentSelection.filter((id) =>
        allRoommateIds.includes(id),
      );

      if (
        currentSelection.length === 0 ||
        currentSelection.length === allRoommateIds.length
      ) {
        return allRoommateIds;
      }

      return validSelection;
    });
  }, [user.id, roommates]);

  const isWithinDateRange = (activityDate: string) => {
    if (dateFilter === "all") {
      return true;
    }

    const today = new Date();
    const todayAtMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const targetDate = new Date(`${activityDate}T00:00:00`);
    const daysDifference = Math.floor(
      (todayAtMidnight.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDifference < 0) {
      return false;
    }

    if (dateFilter === "today") {
      return daysDifference === 0;
    }

    if (dateFilter === "last7") {
      return daysDifference <= 6;
    }

    return daysDifference <= 29;
  };

  const toggleRoommateFilter = (roommateId: string) => {
    setSelectedRoommateIds((currentSelection) =>
      currentSelection.includes(roommateId)
        ? currentSelection.filter((id) => id !== roommateId)
        : [...currentSelection, roommateId],
    );
  };

  const activities = feed.filter((activity: Activity) => {
    const matchesRoommate = selectedRoommateIds.includes(activity.userId);

    return matchesRoommate && isWithinDateRange(activity.date);
  });

  // Group cooking events with same eventId
  const groupedActivities = activities.reduce((acc: Activity[], activity: Activity) => {
    if (activity.action === "used" && activity.eventId) {
      // Check if we already have this cooking event grouped
      const existingIndex = acc.findIndex(
        (a) => a.eventId === activity.eventId && a.action === "used"
      );
      
      if (existingIndex >= 0) {
        // Merge items into existing grouped event
        const existing = acc[existingIndex];
        const combinedItems = [...existing.items, ...activity.items];
        
        // Determine type (shared/personal/mixed)
        const hasShared = combinedItems.some((item) => item.isShared);
        const hasPersonal = combinedItems.some((item) => !item.isShared);
        const newType: Activity["type"] = hasShared && hasPersonal
          ? "mixed"
          : hasShared
            ? "shared"
            : "personal";
        
        acc[existingIndex] = {
          ...existing,
          type: newType,
          items: combinedItems,
        };
      } else {
        // First item of this cooking event
        acc.push(activity);
      }
    } else {
      // Non-cooking events pass through unchanged
      acc.push(activity);
    }
    return acc;
  }, []);

  const getActivityVerb = (action: Activity["action"]) => {
    if (action === "used") return "used some";
    if (action === "removed") return "removed some";
    if (action === "added") return "added some";
    return "bought some";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-sm">Roommates of</span>
              {isEditingRoomName ? (
                <input
                  autoFocus
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onBlur={() => setIsEditingRoomName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsEditingRoomName(false);
                    if (e.key === "Escape") {
                      setRoomName("TC203");
                      setIsEditingRoomName(false);
                    }
                  }}
                  className="font-medium px-2 py-1 border border-gray-300 rounded outline-none focus:border-gray-500"
                />
              ) : (
                <button
                  onClick={() => setIsEditingRoomName(true)}
                  className="font-medium hover:underline cursor-pointer"
                >
                  {roomName}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {allRoommates.map((roommate, index) => (
                <button
                  key={roommate.id}
                  type="button"
                  onClick={() => navigate(getRoommateRoute(roommate.id))}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md border-2 border-white"
                  style={{
                    marginLeft: index > 0 ? "-12px" : "0",
                    zIndex: allRoommates.length - index,
                  }}
                >
                  {roommate.initials}
                </button>
              ))}
              <Link
                to="/roommates"
                className="w-14 h-14 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:border-gray-600 hover:text-gray-600 transition-colors bg-white"
                style={{ marginLeft: "-12px" }}
              >
                <Users className="w-6 h-6" />
              </Link>
            </div>
          </div>
          <Link
            to="/roommates"
            className="px-4 py-2 border border-red-300 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Leave Room
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
                {dateFilterLabel}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuRadioGroup
                value={dateFilter}
                onValueChange={(value) => setDateFilter(value as DateFilter)}
              >
                <DropdownMenuRadioItem value="all">
                  Date Range
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="today">
                  Today
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="last7">
                  Last 7 Days
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="last30">
                  Last 30 Days
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
                {roommateFilterLabel}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-52">
              <DropdownMenuCheckboxItem
                checked={selectedRoommateIds.length === allRoommateIds.length}
                onCheckedChange={(checked) =>
                  setSelectedRoommateIds(checked ? allRoommateIds : [])
                }
              >
                From All Roommates
              </DropdownMenuCheckboxItem>
              {allRoommates.map((roommate) => (
                <DropdownMenuCheckboxItem
                  key={roommate.id}
                  checked={selectedRoommateIds.includes(roommate.id)}
                  onCheckedChange={() => toggleRoommateFilter(roommate.id)}
                >
                  From {roommate.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {groupedActivities.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              No feed activity matches the selected filters.
            </div>
          )}

          {groupedActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl px-3 pt-3 pb-2 shadow-sm border transition-all hover:shadow-md ${
                activity.action === "used" || activity.action === "removed"
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => navigate(getRoommateRoute(activity.userId))}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 hover:scale-105 transition-transform"
                >
                  {activity.userInitials}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-base">
                        {activity.userName}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {getActivityVerb(activity.action)}
                      </span>
                      {activity.action === "used" && activity.recipeName && (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          🍳 {activity.recipeName}
                        </span>
                      )}
                    </div>
                    <div>
                      {activity.type === "shared" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Shared Groceries
                        </span>
                      )}
                      {activity.type === "personal" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          Personal Groceries
                        </span>
                      )}
                      {activity.type === "mixed" && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            Personal
                          </span>
                          <span className="text-gray-400 text-xs">+</span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Shared
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-2 mt-2">
                {activity.action === "used" || activity.action === "removed" ? (
                  <>
                    {activity.items.filter(item => item.isShared).length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-600 px-2">
                          Shared
                        </div>
                        {activity.items.filter(item => item.isShared).map((item, idx) => {
                          const inventoryItem = inventory.find(invItem => invItem.name.toLowerCase() === item.name.toLowerCase());
                          return (
                            <button
                              key={idx}
                              onClick={() => inventoryItem && navigate(`/inventory/${inventoryItem.id}`)}
                              className="w-full text-left hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 px-2 py-1 bg-gray-50 border border-gray-200"
                            >
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
                                <Users className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.name} <span className="font-normal text-gray-600">· {item.quantity}</span>
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {activity.items.filter(item => !item.isShared).length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-600 px-2">
                          Personal
                        </div>
                        {activity.items.filter(item => !item.isShared).map((item, idx) => {
                          const inventoryItem = inventory.find(invItem => invItem.name.toLowerCase() === item.name.toLowerCase());
                          return (
                            <button
                              key={idx}
                              onClick={() => inventoryItem && navigate(`/inventory/${inventoryItem.id}`)}
                              className="w-full text-left hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 px-2 py-1 bg-gray-50 border border-gray-200"
                            >
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.name} <span className="font-normal text-gray-600">· {item.quantity}</span>
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {activity.items.map((item, idx) => {
                      const inventoryItem = inventory.find(invItem => invItem.name.toLowerCase() === item.name.toLowerCase());
                      return (
                        <button
                          key={idx}
                          onClick={() => inventoryItem && navigate(`/inventory/${inventoryItem.id}`)}
                          className="w-full text-left hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 px-2 py-1 bg-gray-50 border border-gray-200"
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            item.isShared ? "bg-green-100" : "bg-blue-100"
                          }`}>
                            {item.isShared ? (
                              <Users className="w-4 h-4 text-green-600" />
                            ) : (
                              <User className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900">
                              {item.name} <span className="font-normal text-gray-600">· {item.quantity}</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500 flex justify-end">
                {activity.timestamp}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
