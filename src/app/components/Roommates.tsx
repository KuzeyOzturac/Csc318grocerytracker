import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

const discoverableAccounts = [
  {
    id: "search-kubra",
    name: "Kubra",
    username: "@kubrans",
    initials: "KB",
    status: "available" as const,
  },
  {
    id: "search-nazafarin",
    name: "Nazafarin",
    username: "@nazafarin2003",
    initials: "NA",
    status: "shared-elsewhere" as const,
  },
];

export const Roommates = () => {
  const navigate = useNavigate();
  const { roommates, user, removeRoommate } = useApp();
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      username: string;
      initials: string;
      status: "available" | "in-room" | "shared-elsewhere";
    }>
  >([]);

  const searchableAccounts = [
    ...[user, ...roommates].map((person) => ({
      id: person.id,
      name: person.name,
      username: person.username,
      initials: person.initials,
      status: "in-room" as const,
    })),
    ...discoverableAccounts,
  ];

  const updateSearchResults = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      setSearchResults([]);
      return;
    }

    setSearchResults(
      searchableAccounts.filter((account) =>
        account.username.toLowerCase().includes(normalizedQuery),
      ),
    );
  };

  const handleSearch = () => {
    updateSearchResults(searchUsername);
  };

  const handleSendRequest = (username: string) => {
    toast.success(`Request sent to ${username}`);
  };

  const handleRemoveRoommate = (id: string, name: string) => {
    if (confirm(`Remove ${name} from your household?`)) {
      removeRoommate(id);
      toast.success("Roommate removed");
    }
  };

  const allRoommates = [user, ...roommates];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
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

        <h2 className="text-xl font-medium text-gray-900 mb-4">
          Find Your Roommates
        </h2>

        <div className="relative">
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => {
              const nextValue = e.target.value;
              setSearchUsername(nextValue);
              updateSearchResults(nextValue);
            }}
            placeholder="Search Username (i.e. @johnsmith)"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none focus:border-gray-400 transition-all"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <p className="text-sm text-gray-600 text-center mt-4">
          Search for your roommates by entering in their Username.
          <br />
          (i.e. @johnsmith)
          <br />
          <br />
          Only exact search results will appear.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {searchResults.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-start gap-4">
              {result.status === "available" && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                  {result.username} is not currently in a shared Room!
                </div>
              )}
              {result.status === "shared-elsewhere" && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                  {result.username} is already in a shared Room!
                </div>
              )}
              {result.status === "in-room" && (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                  {result.username} is already in your Room!
                </div>
              )}

              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                {result.initials}
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  {result.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{result.username}</p>

                {result.status !== "in-room" && (
                  <button
                    onClick={() => handleSendRequest(result.username)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Send a Request to Join
                  </button>
                )}
              </div>
            </div>

            {result.status === "shared-elsewhere" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>IMPORTANT:</strong> It seems {result.username} already
                  shares groceries with other roommates. You can send a request.
                  If {result.username} accepts, their grocery list, as well as
                  their roommates', will merge with you and your roommates'
                  grocery list.
                </p>
              </div>
            )}
          </motion.div>
        ))}

        {searchUsername && searchResults.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No results found for "{searchUsername}"
          </div>
        )}

        {!searchUsername && (
          <div className="text-center py-12 text-gray-400">
            Enter a username to search for roommates
          </div>
        )}
      </div>

      {/* Current Roommates Section */}
      <div className="p-6 pt-0">
        <h3 className="text-sm font-medium text-gray-600 mb-4">
          Current Roommates
        </h3>
        <div className="space-y-3">
          {allRoommates.map((roommate, index) => (
            <motion.div
              key={roommate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 cursor-pointer"
              onClick={() => navigate(`/roommates/${roommate.id}`)}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md">
                {roommate.initials}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{roommate.name}</h4>
              </div>
              {roommate.id !== user.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRoommate(roommate.id, roommate.name);
                  }}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
