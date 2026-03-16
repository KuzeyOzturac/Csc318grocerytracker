import React, { useState } from "react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { ChevronDown, Users } from "lucide-react";
import { Link } from "react-router";

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
}

export const Dashboard = () => {
  const { user, roommates } = useApp();
  const [dateFilter, setDateFilter] = useState("Date Range");
  const [roommateFilter, setRoommateFilter] = useState("From All Roommates");

  // Mock activity feed
  const activities: Activity[] = [
    {
      id: "1",
      userId: "2",
      userName: "Tina",
      userInitials: "TN",
      type: "shared",
      items: [
        { name: "Milk", quantity: "2 cartons", isShared: true },
        { name: "Milk", quantity: "2 cartons", isShared: true },
      ],
      timestamp: "Friday, March 13th at 6:17 PM",
      date: "2026-03-13",
    },
    {
      id: "2",
      userId: "me",
      userName: "You",
      userInitials: "ME",
      type: "mixed",
      items: [
        { name: "Milk", quantity: "2 cartons", isShared: true },
        { name: "Milk", quantity: "2 cartons", isShared: false },
      ],
      timestamp: "Tuesday, March 10th at 3:02 PM",
      date: "2026-03-10",
    },
    {
      id: "3",
      userId: "me",
      userName: "You",
      userInitials: "ME",
      type: "personal",
      items: [
        { name: "Milk", quantity: "2 cartons", isShared: false },
      ],
      timestamp: "Friday, March 13th at 6:17 PM",
      date: "2026-03-13",
    },
  ];

  const allRoommates = [user, ...roommates];

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
                <div
                  key={roommate.id}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md border-2 border-white"
                  style={{
                    marginLeft: index > 0 ? "-12px" : "0",
                    zIndex: allRoommates.length - index,
                  }}
                >
                  {roommate.initials}
                </div>
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
          <button className="px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
            {dateFilter}
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
            {roommateFilter}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-green-100 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                  {activity.userInitials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{activity.userName}</span>
                    <span className="text-gray-600">bought some</span>
                    {activity.type === "shared" && (
                      <span className="font-medium text-green-700">Shared Groceries</span>
                    )}
                    {activity.type === "personal" && (
                      <span className="font-medium text-blue-700">Personal Groceries</span>
                    )}
                    {activity.type === "mixed" && (
                      <>
                        <span className="font-medium text-blue-700">Personal Groceries</span>
                        <span className="text-gray-600">and</span>
                        <span className="font-medium text-green-700">Shared Groceries</span>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {activity.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-200"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.isShared ? "bg-green-200" : "bg-blue-200"
                        }`}>
                          <Users className={`w-5 h-5 ${
                            item.isShared ? "text-green-700" : "text-blue-700"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.name} - {item.quantity}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          3 cartons available
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
