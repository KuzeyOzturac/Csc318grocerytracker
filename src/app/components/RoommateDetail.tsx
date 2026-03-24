import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Lock, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

export const RoommateDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, roommates, feed, inventory, removeRoommate } = useApp();
  const [expandedActivities, setExpandedActivities] = useState<string[]>([]);

  const roommate =
    id === user.id ? user : roommates.find((candidate) => candidate.id === id);

  if (!roommate) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Roommate not found
          </h2>
          <p className="text-gray-600">
            We couldn't find that roommate profile in your household.
          </p>
          <button
            onClick={() => navigate("/roommates")}
            className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Roommates
          </button>
        </div>
      </div>
    );
  }

  const isCurrentUser = roommate.id === user.id;
  const history = feed.filter(
    (entry) =>
      entry.userId === roommate.id ||
      entry.userName === roommate.name ||
      entry.userInitials === roommate.initials,
  );

  const fallbackHistory = inventory
    .filter((item) => item.isShared && item.updatedBy === roommate.name)
    .map((item) => ({
      id: `fallback-${item.id}`,
      userId: roommate.id,
      userName: roommate.name,
      userInitials: roommate.initials,
      type: "shared" as const,
      items: [
        {
          name: item.name,
          quantity: item.quantity,
          isShared: item.isShared,
        },
      ],
      timestamp: item.lastAdded,
      date: item.expiryDate,
      action: "bought" as const,
    }));

  const roommateHistory = history.length > 0 ? history : fallbackHistory;
  const getActivityVerb = (action: (typeof roommateHistory)[number]["action"]) => {
    if (action === "used") return "used some";
    if (action === "removed") return "removed some";
    if (action === "added") return "added some";
    return "bought some";
  };

  const toggleExpanded = (activityId: string) => {
    setExpandedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId],
    );
  };

  const handleRemoveRoommate = () => {
    if (
      confirm(
        `Remove ${roommate.name} from your room? This will stop grocery sharing for them immediately.`,
      )
    ) {
      removeRoommate(roommate.id);
      toast.success("Roommate removed");
      navigate("/roommates");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <div className="p-2 border border-gray-300 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
          <h1
            className="text-3xl text-gray-900"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Bounty Biter
          </h1>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md">
            {user.initials}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {roommate.initials}
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {roommate.name}{" "}
                {isCurrentUser && (
                  <Lock className="inline w-6 h-6 text-gray-500" />
                )}
              </h2>
              <p className="text-2xl text-gray-600">{roommate.username}</p>
              <p className="text-sm text-gray-500 mt-2">
                {isCurrentUser
                  ? "This is your household profile."
                  : "Shares groceries with your room."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-center text-xl font-bold text-gray-900">
              Recent Grocery Sharing History
            </h3>

            {roommateHistory.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                No shared grocery activity yet.
              </div>
            ) : (
              roommateHistory.map((activity, index) => {
                const isExpanded = expandedActivities.includes(activity.id);
                const visibleItems = isExpanded
                  ? activity.items
                  : activity.items.slice(0, 2);
                const activityLabel =
                  activity.type === "mixed"
                    ? "Personal and Shared Groceries"
                    : activity.type === "personal"
                      ? "Personal Groceries"
                      : "Shared Groceries";

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`rounded-3xl p-6 border ${
                      activity.action === "used" ||
                      activity.action === "removed"
                        ? "bg-red-50 border-red-200"
                        : "bg-green-100 border-green-200"
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                        {activity.userInitials}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-lg">
                          <span className="font-bold text-gray-900">
                            {activity.userName}
                          </span>
                          <span className="text-gray-700">
                            {getActivityVerb(activity.action)}
                          </span>
                          <span className="font-bold text-green-700">
                            {activityLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {visibleItems.map((item, itemIndex) => {
                        const inventoryItem = inventory.find(
                          (candidate) => candidate.name === item.name,
                        );

                        return (
                          <div
                            key={`${activity.id}-${item.name}-${itemIndex}`}
                            className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-200"
                          >
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Users className="w-5 h-5 text-green-700" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {item.name} - {item.quantity}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {inventoryItem
                                ? `${inventoryItem.amount} ${inventoryItem.unit} available`
                                : "Unavailable"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {activity.items.length > 2 && (
                      <button
                        onClick={() => toggleExpanded(activity.id)}
                        className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        {isExpanded ? "Show Less" : "Show More"}
                      </button>
                    )}

                    <div className="mt-4 text-center text-sm font-medium text-gray-700">
                      {activity.timestamp}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {!isCurrentUser && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleRemoveRoommate}
                className="w-full py-4 border-2 border-red-300 text-red-500 rounded-full text-2xl font-medium hover:bg-red-50 transition-colors"
              >
                Remove from Room
              </button>

              <p className="mt-6 text-lg leading-8 text-gray-700 text-center">
                <strong>NOTE:</strong> This action is immediate.{" "}
                {roommate.username} will no longer be able to share groceries
                with your room or interact with your shared inventory. Shared
                items already in the inventory will remain available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
