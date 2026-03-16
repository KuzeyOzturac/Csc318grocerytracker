import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, User, Pencil, ToggleLeft } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export const ItemDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    inventory,
    updateInventoryItem,
    deleteInventoryItem,
    addShoppingItem,
    roommates,
    user,
    addPurchaseRecord,
    // useInventoryItem, // Removed: no longer used here
  } = useApp();

  const item = inventory.find((i) => i.id === id);

  const [amount, setAmount] = useState(item?.amount || 0);
  const [isShared, setIsShared] = useState(item?.isShared || false);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Item not found</p>
      </div>
    );
  }

  const purchases = item.purchaseHistory || [];

  const handleUpdateQuantity = (newAmount: number) => {
    if (newAmount < 0) return;
    setAmount(newAmount);

    const newQuantity = `${newAmount} ${item.unit}`;
    const newStatus =
      newAmount === 0 ? "Out" : newAmount < 3 ? "Low" : "In Stock";

    updateInventoryItem(item.id, {
      amount: newAmount,
      quantity: newQuantity,
      status: newStatus,
      lastAdded: "Just now",
      updatedBy: user.initials,
    });

    addPurchaseRecord(item.id, {
      buyerName: user.name,
      buyerInitials: user.initials,
      quantity: newQuantity,
      date: new Date().toISOString().split("T")[0],
      expiry: item.expiryDate,
      action: "bought",
    });

    toast.success("Quantity updated");
  };

  const handleToggleShared = () => {
    const newIsShared = !isShared;
    setIsShared(newIsShared);
    updateInventoryItem(item.id, { isShared: newIsShared });
    toast.success(
      newIsShared ? "Item shared with household" : "Item marked as personal",
    );
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };
  const getPurchaseVerb = (action: string) => {
    if (action === "used") return "Used by";
    if (action === "removed") return "Removed by";
    if (action === "added") return "Added by";
    return "Bought by";
  };

  // Removed manual use item handler. Items are now used automatically when cooking a meal.

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/inventory")}
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
          <div className="w-12 h-12"></div>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Item Header */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {item.name}
              </h2>
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                {item.quantity}
              </div>
            </div>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isShared ? "bg-green-200" : "bg-blue-200"
              }`}
            >
              {isShared ? (
                <Users className="w-8 h-8 text-green-700" />
              ) : (
                <User className="w-8 h-8 text-blue-700" />
              )}
            </div>
          </div>

          <div className="text-center py-6 border-t border-gray-200">
            <h3
              className={`text-2xl font-bold mb-2 ${
                isShared ? "text-green-600" : "text-blue-600"
              }`}
            >
              {isShared ? "Shared" : "Personal"}
            </h3>
          </div>
        </div>

        {/* Purchase History */}
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <div className="text-gray-400 text-center">
              No purchase history yet.
            </div>
          ) : (
            purchases.map((purchase: any, index: number) => (
              <div
                key={index}
                className={`rounded-2xl border-2 p-6 ${
                  purchase.action === "used" || purchase.action === "removed"
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="text-lg font-bold text-gray-900">
                      {purchase.quantity}
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  {(purchase.action === "bought" || purchase.action === "added") && (
                    <div className="text-sm text-gray-600">
                      Expires on {purchase.expiry}
                      <button className="ml-1 p-1 text-gray-400 hover:text-gray-600">
                        <Pencil className="w-3 h-3 inline" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-md">
                    {purchase.buyerInitials}
                  </div>
                  <div className="text-sm text-gray-700">
                    {getPurchaseVerb(purchase.action)}{" "}
                    <span className="font-medium">{purchase.buyerName}</span> on{" "}
                    <span className="font-medium">{purchase.date}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add to Shopping List Button */}
        <button
          onClick={() => {
            addShoppingItem({
              name: item.name,
              category: item.category,
              addedBy: "ME",
              needed: true,
              quantity: `1 ${item.unit}`,
            });
            toast.success("Added to shopping list!");
          }}
          className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-lg"
        >
          Add to Shopping List
        </button>

        {/* Removed Use Item Button: Items are now used automatically when cooking a meal. */}
      </div>
    </div>
  );
};
