import React, { createContext, useContext, useState, ReactNode } from "react";

export interface PurchaseRecord {
  buyerName: string;
  buyerInitials: string;
  quantity: string;
  date: string;
  expiry: string;
  action: "added" | "bought" | "removed" | "used";
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  isShared: boolean;
  status: "In Stock" | "Low" | "Out";
  lastAdded: string;
  updatedBy: string;
  quantity: string; // "1 L", "3 tomatoes", "500g", etc.
  expiryDate: string; // ISO date string
  unit: string;
  amount: number;
  purchaseHistory?: PurchaseRecord[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  addedBy: string;
  needed: boolean;
  quantity: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    amount: number;
  }>;
  matchPercentage: number;
  missingIngredients: string[];
  prepTime: string;
  difficulty: "Low" | "Medium" | "High";
  dietaryTags: string[];
  imageUrl?: string;
  steps: string[];
}

export interface User {
  id: string;
  name: string;
  initials: string;
  username: string;
}

export interface Roommate {
  id: string;
  name: string;
  initials: string;
  username: string;
  status: "active" | "pending";
}

interface FeedEntry {
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

interface AppContextType {
  // ...existing code...
  useInventoryItem: (itemId: string, usedAmount?: number) => void;
}

// ...existing code...

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Whole Milk",
    category: "Dairy",
    isShared: true,
    status: "Low",
    lastAdded: "2 days ago",
    updatedBy: "Vibhas",
    quantity: "1 L",
    expiryDate: "2026-03-18",
    unit: "L",
    amount: 1,
  },
  {
    id: "2",
    name: "Greek Yogurt",
    category: "Dairy",
    isShared: false,
    status: "In Stock",
    lastAdded: "Yesterday",
    updatedBy: "Kuzey",
    quantity: "2 tubs",
    expiryDate: "2026-03-25",
    unit: "tub",
    amount: 2,
  },
  {
    id: "3",
    name: "Eggs",
    category: "Dairy",
    isShared: true,
    status: "In Stock",
    lastAdded: "Today",
    updatedBy: "Areesha",
    quantity: "12 eggs",
    expiryDate: "2026-03-20",
    unit: "count",
    amount: 12,
  },
  {
    id: "4",
    name: "Basmati Rice",
    category: "Pantry",
    isShared: true,
    status: "In Stock",
    lastAdded: "1 week ago",
    updatedBy: "Vibhas",
    quantity: "1000 g",
    expiryDate: "2027-01-01",
    unit: "g",
    amount: 1000,
  },
  {
    id: "5",
    name: "Chicken Breast",
    category: "Meat",
    isShared: false,
    status: "Low",
    lastAdded: "3 days ago",
    updatedBy: "Kuzey",
    quantity: "500 g",
    expiryDate: "2026-03-14",
    unit: "g",
    amount: 500,
  },
  {
    id: "6",
    name: "Bread",
    category: "Bakery",
    isShared: true,
    status: "In Stock",
    lastAdded: "Today",
    updatedBy: "Areesha",
    quantity: "1 loaf",
    expiryDate: "2026-03-20",
    unit: "loaf",
    amount: 1,
  },
  {
    id: "7",
    name: "Tomatoes",
    category: "Produce",
    isShared: true,
    status: "In Stock",
    lastAdded: "Today",
    updatedBy: "Vibhas",
    quantity: "6 tomatoes",
    expiryDate: "2026-03-19",
    unit: "count",
    amount: 6,
  },
  {
    id: "8",
    name: "Cooking Oil",
    category: "Pantry",
    isShared: true,
    status: "Low",
    lastAdded: "5 days ago",
    updatedBy: "Kuzey",
    quantity: "250 mL",
    expiryDate: "2026-03-22",
    unit: "mL",
    amount: 250,
  },
  {
    id: "9",
    name: "Onions",
    category: "Produce",
    isShared: true,
    status: "In Stock",
    lastAdded: "Today",
    updatedBy: "Areesha",
    quantity: "4 onions",
    expiryDate: "2026-03-19",
    unit: "count",
    amount: 4,
  },
  {
    id: "10",
    name: "Yogurt",
    category: "Dairy",
    isShared: false,
    status: "In Stock",
    lastAdded: "Yesterday",
    updatedBy: "Vibhas",
    quantity: "1 tub",
    expiryDate: "2026-03-25",
    unit: "tub",
    amount: 1,
  },
];

const mockShoppingList: ShoppingItem[] = [
  {
    id: "1",
    name: "Eggs",
    category: "Dairy",
    addedBy: "Areesha",
    needed: true,
    quantity: "12 eggs",
  },
  {
    id: "2",
    name: "Bread",
    category: "Bakery",
    addedBy: "Kuzey",
    needed: true,
    quantity: "1 loaf",
  },
  {
    id: "3",
    name: "Rice",
    category: "Pantry",
    addedBy: "Vibhas",
    needed: false,
    quantity: "1 kg",
  },
];

const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Avocado Toast",
    ingredients: [
      { name: "Bread", quantity: "1/4 loaf", amount: 0.25 },
      { name: "Avocados", quantity: "1 avocado", amount: 1 },
      { name: "Tomatoes", quantity: "1 tomato", amount: 1 },
    ],
    matchPercentage: 66,
    missingIngredients: ["Avocados"],
    prepTime: "10 min",
    difficulty: "Low",
    dietaryTags: ["Vegetarian", "Vegan"],
    steps: [
      "Toast the bread slices until golden brown",
      "Mash the avocados in a bowl",
      "Spread mashed avocado on toast",
      "Top with sliced tomatoes",
      "Season with salt and pepper",
    ],
  },
  {
    id: "2",
    name: "Spinach Omelette",
    ingredients: [
      { name: "Eggs", quantity: "2 eggs", amount: 2 },
      { name: "Cooking Oil", quantity: "15 mL", amount: 15 },
      { name: "Onions", quantity: "1 onion", amount: 1 },
      { name: "Yogurt", quantity: "1/2 tub", amount: 0.5 },
    ],
    matchPercentage: 75,
    missingIngredients: ["Yogurt"],
    prepTime: "15 min",
    difficulty: "Low",
    dietaryTags: ["Vegetarian"],
    steps: [
      "Beat eggs in a bowl",
      "Sauté onions in oil",
      "Add eggs and cook",
      "Add yogurt and fold",
      "Cook until set",
    ],
  },
  {
    id: "3",
    name: "Chicken Rice Bowl",
    ingredients: [
      { name: "Chicken Breast", quantity: "250 g", amount: 250 },
      { name: "Basmati Rice", quantity: "200 g", amount: 200 },
      { name: "Tomatoes", quantity: "2 tomatoes", amount: 2 },
      { name: "Onions", quantity: "1 onion", amount: 1 },
    ],
    matchPercentage: 80,
    missingIngredients: ["Chicken Breast"],
    prepTime: "30 min",
    difficulty: "Medium",
    dietaryTags: ["High Protein"],
    steps: [
      "Cook rice according to package",
      "Season and grill chicken breast",
      "Sauté onions with tomatoes",
      "Slice cooked chicken",
      "Assemble bowl with rice, chicken, tomatoes, and onions",
    ],
  },
];

const mockRoommates: Roommate[] = [
  {
    id: "1",
    name: "Kuzey",
    initials: "KO",
    username: "@kuzey.ozturac",
    status: "active",
  },
  {
    id: "2",
    name: "Areesha",
    initials: "AA",
    username: "@areeshaabidi",
    status: "active",
  },
];

const mockFeed: FeedEntry[] = [
  {
    id: "feed-1",
    userId: "me",
    userName: "Vibhas",
    userInitials: "VR",
    type: "shared",
    items: [
      { name: "Whole Milk", quantity: "1 L", isShared: true },
      { name: "Basmati Rice", quantity: "1 kg", isShared: true },
      { name: "Tomatoes", quantity: "6 tomatoes", isShared: true },
    ],
    timestamp: "Friday, March 13 at 6:17 PM",
    date: "2026-03-13",
    action: "bought",
  },
  {
    id: "feed-2",
    userId: "1",
    userName: "Kuzey",
    userInitials: "KO",
    type: "shared",
    items: [
      { name: "Cooking Oil", quantity: "250 mL", isShared: true },
      { name: "Bread", quantity: "1 loaf", isShared: true },
    ],
    timestamp: "Thursday, March 12 at 7:42 PM",
    date: "2026-03-12",
    action: "bought",
  },
  {
    id: "feed-3",
    userId: "2",
    userName: "Areesha",
    userInitials: "AA",
    type: "shared",
    items: [
      { name: "Eggs", quantity: "12 eggs", isShared: true },
      { name: "Onions", quantity: "4 onions", isShared: true },
    ],
    timestamp: "Wednesday, March 11 at 5:08 PM",
    date: "2026-03-11",
    action: "bought",
  },
];

const normalizeItemName = (name: string) => name.trim().toLowerCase();

const buildInventoryWithSeededHistory = (
  items: InventoryItem[],
  feed: FeedEntry[],
) =>
  items.map((item) => {
    const seededHistory = feed.flatMap((entry) =>
      entry.items
        .filter(
          (feedItem) =>
            normalizeItemName(feedItem.name) === normalizeItemName(item.name),
        )
        .map<PurchaseRecord>((feedItem) => ({
          buyerName: entry.userName,
          buyerInitials: entry.userInitials,
          quantity: feedItem.quantity,
          date: entry.date,
          expiry: item.expiryDate,
          action: entry.action,
        })),
    );

    if (seededHistory.length === 0) {
      return item;
    }

    return {
      ...item,
      purchaseHistory: item.purchaseHistory
        ? [...seededHistory, ...item.purchaseHistory]
        : seededHistory,
    };
  });

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({
    id: "me",
    name: "Vibhas",
    initials: "VR",
    username: "@vibraizada",
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    buildInventoryWithSeededHistory(mockInventory, mockFeed),
  );
  const [feed, setFeed] = useState<FeedEntry[]>(mockFeed);
  const addPurchaseRecord = (
    itemId: string,
    record: PurchaseRecord,
    addAmount: number = 1,
  ) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          // Parse numeric value from record.quantity if possible
          let addNum = addAmount;
          const match = record.quantity.match(/^(\d+)/);
          if (match) {
            addNum = parseInt(match[1], 10);
          }
          const newAmount = (item.amount || 0) + addNum;
          return {
            ...item,
            amount: newAmount,
            quantity: `${newAmount} ${item.unit}`,
            purchaseHistory: item.purchaseHistory
              ? [...item.purchaseHistory, record]
              : [record],
          };
        }
        return item;
      }),
    );
  };

  const addFeedEntry = (entry: FeedEntry) => {
    setFeed((prev) => [entry, ...prev]);
  };

  const getInventoryStatus = (amount: number) => {
    if (amount === 0) return "Out";
    if (amount < 3) return "Low";
    return "In Stock";
  };

  const useInventoryItem = (itemId: string, usedAmount: number = 1) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newAmount = Math.max((item.amount || 0) - usedAmount, 0);
          const newQuantity = `${newAmount} ${item.unit}`;
          // Add a usage record to history
          const usageRecord: PurchaseRecord = {
            buyerName: user.name,
            buyerInitials: user.initials,
            quantity: `- ${usedAmount} ${item.unit}`,
            date: new Date().toISOString().split("T")[0],
            expiry: item.expiryDate,
            action: "used",
          };
          return {
            ...item,
            amount: newAmount,
            quantity: newQuantity,
            purchaseHistory: item.purchaseHistory
              ? [...item.purchaseHistory, usageRecord]
              : [usageRecord],
          };
        }
        return item;
      }),
    );
    // Add feed entry
    const inv = inventory.find((i) => i.id === itemId);
    if (inv) {
      addFeedEntry({
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userInitials: user.initials,
        type: inv.isShared ? "shared" : "personal",
        items: [
          {
            name: inv.name,
            quantity: `- ${usedAmount} ${inv.unit}`,
            isShared: inv.isShared,
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
        action: "used",
      });
    }
  };

  const [shoppingList, setShoppingList] =
    useState<ShoppingItem[]>(mockShoppingList);
  const [recipes] = useState<Recipe[]>(mockRecipes);
  const [roommates, setRoommates] = useState<Roommate[]>(mockRoommates);

  const addInventoryItem = (item: Omit<InventoryItem, "id">) => {
    const normalizedName = item.name.trim().toLowerCase();
    const today = new Date().toISOString().split("T")[0];
    const timestamp = "Just now";
    const isRemoval = item.amount < 0;
    const matchingItem = inventory.find(
      (inventoryItem) =>
        inventoryItem.name.trim().toLowerCase() === normalizedName &&
        inventoryItem.isShared === item.isShared,
    );
    const quantityValue = isRemoval
      ? `- ${Math.abs(item.amount)} ${item.unit}`
      : item.quantity;
    const purchaseRecord: PurchaseRecord = {
      buyerName: user.name,
      buyerInitials: user.initials,
      quantity: quantityValue,
      date: today,
      expiry: item.expiryDate,
      action: isRemoval ? "removed" : "added",
    };

    if (matchingItem) {
      const updatedAmount = Math.max(matchingItem.amount + item.amount, 0);
      const earliestExpiryDate =
        isRemoval ||
        new Date(`${item.expiryDate}T00:00:00`) >=
          new Date(`${matchingItem.expiryDate}T00:00:00`)
          ? matchingItem.expiryDate
          : item.expiryDate;

      setInventory((prev) =>
        prev.map((inventoryItem) =>
          inventoryItem.id === matchingItem.id
            ? {
                ...inventoryItem,
                amount: updatedAmount,
                quantity: `${updatedAmount} ${inventoryItem.unit}`,
                expiryDate: earliestExpiryDate,
                status: getInventoryStatus(updatedAmount),
                lastAdded: timestamp,
                updatedBy: user.name,
                purchaseHistory: inventoryItem.purchaseHistory
                  ? [...inventoryItem.purchaseHistory, purchaseRecord]
                  : [purchaseRecord],
              }
            : inventoryItem,
        ),
      );

      addFeedEntry({
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userInitials: user.initials,
        type: matchingItem.isShared ? "shared" : "personal",
        items: [
          {
            name: matchingItem.name,
            quantity: quantityValue,
            isShared: matchingItem.isShared,
          },
        ],
        timestamp: new Date().toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: today,
        action: isRemoval ? "removed" : "added",
      });

      return;
    }

    const newItem = {
      ...item,
      id: Date.now().toString(),
      status: getInventoryStatus(item.amount),
      lastAdded: timestamp,
      updatedBy: user.name,
      purchaseHistory: [purchaseRecord],
    };
    setInventory([...inventory, newItem]);

    addFeedEntry({
      id: `${Date.now()}-feed`,
      userId: user.id,
      userName: user.name,
      userInitials: user.initials,
      type: newItem.isShared ? "shared" : "personal",
      items: [
        {
          name: newItem.name,
          quantity: quantityValue,
          isShared: newItem.isShared,
        },
      ],
      timestamp: new Date().toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: today,
      action: isRemoval ? "removed" : "added",
    });
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(
      inventory.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    );
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
  };

  const addShoppingItem = (item: Omit<ShoppingItem, "id">) => {
    const newItem = { ...item, id: Date.now().toString() };
    setShoppingList([...shoppingList, newItem]);
  };

  const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingList(
      shoppingList.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    );
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList(shoppingList.filter((item) => item.id !== id));
  };

  const addRoommate = (roommate: Omit<Roommate, "id">) => {
    const newRoommate = { ...roommate, id: Date.now().toString() };
    setRoommates([...roommates, newRoommate]);
  };

  const removeRoommate = (id: string) => {
    setRoommates(roommates.filter((r) => r.id !== id));
  };

  const updateUser = (updates: Partial<User>) => {
    setUser({ ...user, ...updates });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        inventory,
        shoppingList,
        recipes,
        roommates,
        feed,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        addRoommate,
        removeRoommate,
        updateUser,
        addPurchaseRecord,
        addFeedEntry,
        useInventoryItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
