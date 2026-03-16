import React, { useState } from "react";
import { Users, User, Pencil, Trash2, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export const ShoppingList = () => {
  const {
    shoppingList,
    updateShoppingItem,
    deleteShoppingItem,
    user,
    inventory,
    addPurchaseRecord,
    addFeedEntry,
  } = useApp();
  const [view, setView] = useState<"list" | "confirm">("list");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [lowStockAutomationEnabled, setLowStockAutomationEnabled] =
    useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<string>("");
  const [itemExpiries, setItemExpiries] = useState<Record<string, string>>({});
  const [editingExpiryItemId, setEditingExpiryItemId] = useState<string | null>(
    null,
  );

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getItemExpiry = (itemId: string) => itemExpiries[itemId] ?? getTodayDate();
  const formatExpiryDate = (dateString: string) =>
    new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const togglePurchased = (id: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEditingQuantity = (itemId: string, currentQuantity: string) => {
    setEditingItemId(itemId);
    setEditingQuantity(currentQuantity);
  };

  const saveEditedQuantity = (itemId: string) => {
    if (editingQuantity.trim()) {
      updateShoppingItem(itemId, { quantity: editingQuantity });
      setEditingItemId(null);
      setEditingQuantity("");
    }
  };

  const handleCheckOffList = () => {
    if (checkedItems.size === 0) {
      toast.error("Please select items to check off");
      return;
    }
    setView("confirm");
  };

  const handleAddAllToInventory = () => {
    const purchasedItems = [];
    Array.from(checkedItems).forEach((id) => {
      const item = shoppingList.find((i) => i.id === id);
      if (!item) return;
      const invItem = inventory.find((inv) => inv.name === item.name);
      if (invItem) {
        addPurchaseRecord(invItem.id, {
          buyerName: user.name,
          buyerInitials: user.initials,
          quantity: item.quantity,
          date: new Date().toISOString().split("T")[0],
          expiry: getItemExpiry(item.id),
          action: "bought",
        });
        purchasedItems.push({
          name: invItem.name,
          quantity: item.quantity,
          isShared: invItem.isShared,
        });
      }
    });
    if (purchasedItems.length > 0) {
      addFeedEntry({
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userInitials: user.initials,
        type: purchasedItems.every((i) => i.isShared)
          ? "shared"
          : purchasedItems.every((i) => !i.isShared)
            ? "personal"
            : "mixed",
        items: purchasedItems,
        timestamp: new Date().toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date().toISOString().split("T")[0],
        action: "bought",
      });
    }
    toast.success("All items added to inventory!");
    setView("list");
    setCheckedItems(new Set());
  };

  if (view === "confirm") {
    const checkedItemsList = Array.from(checkedItems)
      .map((id) => shoppingList.find((item) => item.id === id))
      .filter(Boolean);

    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Shopping List
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              You've Checked Off Your List!
            </h3>
            <p className="text-green-700">
              Review and add purchased items to your inventory
            </p>
          </div>

          <div className="space-y-3">
            {checkedItemsList.map((item) => {
              if (!item) return null;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.addedBy === "ME" ? "bg-blue-200" : "bg-green-200"
                      }`}
                    >
                      {item.addedBy === "ME" ? (
                        <User className="w-5 h-5 text-blue-700" />
                      ) : (
                        <Users className="w-5 h-5 text-green-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                    </div>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        const invItem = inventory.find(
                          (inv) => inv.name === item.name,
                        );
                        if (invItem) {
                          addPurchaseRecord(invItem.id, {
                            buyerName: user.name,
                            buyerInitials: user.initials,
                            quantity: item.quantity,
                            date: new Date().toISOString().split("T")[0],
                            expiry: getItemExpiry(item.id),
                            action: "bought",
                          });
                          addFeedEntry({
                            id: Date.now().toString(),
                            userId: user.id,
                            userName: user.name,
                            userInitials: user.initials,
                            type: invItem.isShared ? "shared" : "personal",
                            items: [
                              {
                                name: invItem.name,
                                quantity: item.quantity,
                                isShared: invItem.isShared,
                              },
                            ],
                            timestamp: new Date().toLocaleString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                            date: new Date().toISOString().split("T")[0],
                          });
                          toast.success(`${item.name} added to inventory!`);
                        }
                      }}
                    >
                      Add to Inventory
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiry:</span>
                      {editingExpiryItemId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={getItemExpiry(item.id)}
                            onChange={(e) =>
                              setItemExpiries((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="rounded-lg border border-gray-300 px-2 py-1 text-gray-900"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setEditingExpiryItemId(null)}
                            className="text-sm font-medium text-blue-500 hover:text-blue-600"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingExpiryItemId(item.id)}
                          className="flex items-center gap-1 text-gray-900 hover:text-gray-700"
                        >
                          <span>{formatExpiryDate(getItemExpiry(item.id))}</span>
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <button className="text-sm text-blue-500 mt-2 font-medium">
                    Add More
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleAddAllToInventory}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Add All Items
          </button>

          <button className="w-full py-4 bg-pink-400 text-white rounded-2xl font-bold hover:bg-pink-500 transition-colors shadow-lg flex items-center justify-center gap-2">
            <Receipt className="w-5 h-5" />
            Scan Receipt to Add Items
          </button>
        </div>
      </div>
    );
  }

  const neededItems = shoppingList.filter((item) => item.needed);
  const lowStockItems = [
    {
      id: "low1",
      name: "Rice",
      quantity: "<1 bag in inventory",
      isShared: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Shopping List</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Items in your list */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Items in your list
          </h3>
          <div className="space-y-3">
            {neededItems.map((item) => {
              const isChecked = checkedItems.has(item.id);
              const isShared =
                item.category === "Dairy" || item.name === "Milk";

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                    isChecked ? "border-green-400" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isShared ? "bg-green-200" : "bg-blue-200"
                      }`}
                    >
                      {isShared ? (
                        <Users className="w-5 h-5 text-green-700" />
                      ) : (
                        <User className="w-5 h-5 text-blue-700" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-gray-600">
                              Quantity to Buy:
                            </span>
                            {editingItemId === item.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editingQuantity}
                                  onChange={(e) =>
                                    setEditingQuantity(e.target.value)
                                  }
                                  className="border border-orange-400 rounded px-2 py-1 text-sm font-medium text-orange-600 w-20"
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveEditedQuantity(item.id)}
                                  className="text-sm bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingItemId(null);
                                    setEditingQuantity("");
                                  }}
                                  className="text-sm bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  startEditingQuantity(item.id, item.quantity)
                                }
                                className="text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1"
                              >
                                {item.quantity}
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteShoppingItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {isShared && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-600">
                            'In List' Alert to Roommates
                          </span>
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mb-2">
                        3 cartons currently in Inventory
                      </div>

                      <button
                        onClick={() => togglePurchased(item.id)}
                        className={`px-6 py-2 rounded-full font-medium transition-colors ${
                          isChecked
                            ? "bg-green-600 text-white"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {isChecked ? "✓ Checked" : "Check Off"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Check Off List Button */}
        {checkedItems.size > 0 && (
          <button
            onClick={handleCheckOffList}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg"
          >
            Check Off List
          </button>
        )}

        {/* Low stock items */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            You are low on these items too
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Automatically add 'low stock' items to list?
            <button
              onClick={() =>
                setLowStockAutomationEnabled(!lowStockAutomationEnabled)
              }
              className={`ml-2 w-12 h-6 rounded-full transition-colors relative ${lowStockAutomationEnabled ? "bg-green-500" : "bg-gray-300"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${lowStockAutomationEnabled ? "left-7" : "left-1"}`}
              />
            </button>
          </p>

          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.isShared ? "bg-green-200" : "bg-blue-200"
                    }`}
                  >
                    {item.isShared ? (
                      <Users className="w-5 h-5 text-green-700" />
                    ) : (
                      <User className="w-5 h-5 text-blue-700" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                            In List ⚠
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          addShoppingItem({
                            name: item.name,
                            category: item.category,
                            addedBy: user.name,
                            needed: true,
                            quantity: item.quantity,
                          });
                          toast.success(
                            `${item.name} added to your shopping list!`,
                          );
                        }}
                        className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Add to My List
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">{item.quantity}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
