import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { ChevronDown, Users } from "lucide-react";
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
}

type DateFilter = "all" | "today" | "last7" | "last30";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, roommates, feed, inventory } = useApp();
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

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
              <span className="font-medium">TC203</span>
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
          {activities.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              No feed activity matches the selected filters.
            </div>
          )}

          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl p-6 shadow-sm ${
                activity.action === "used" || activity.action === "removed"
                  ? "bg-red-100"
                  : "bg-green-100"
              }`}
            >
                <div className="flex items-start gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => navigate(getRoommateRoute(activity.userId))}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0"
                >
                  {activity.userInitials}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {activity.userName}
                    </span>
                    <span className="text-gray-600">
                      {getActivityVerb(activity.action)}
                    </span>
                    {activity.type === "shared" && (
                      <span className="font-medium text-green-700">
                        Shared Groceries
                      </span>
                    )}
                    {activity.type === "personal" && (
                      <span className="font-medium text-blue-700">
                        Personal Groceries
                      </span>
                    )}
                    {activity.type === "mixed" && (
                      <>
                        <span className="font-medium text-blue-700">
                          Personal Groceries
                        </span>
                        <span className="text-gray-600">and</span>
                        <span className="font-medium text-green-700">
                          Shared Groceries
                        </span>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    {activity.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-200"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.isShared ? "bg-green-200" : "bg-blue-200"
                          }`}
                        >
                          <Users
                            className={`w-5 h-5 ${
                              item.isShared ? "text-green-700" : "text-blue-700"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {item.name} - {item.quantity}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const invItem = inventory.find(
                              (inv) => inv.name === item.name,
                            );
                            return invItem
                              ? `${invItem.amount} ${invItem.unit} available`
                              : "0 available";
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {activity.items.length > 2 && (
                    <button className="mt-3 px-6 py-2 bg-gray-700 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                      Show More
                    </button>
                  )}
                </div>
              </div>

              <div className="text-center text-sm text-gray-700 font-medium">
                {activity.timestamp}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
