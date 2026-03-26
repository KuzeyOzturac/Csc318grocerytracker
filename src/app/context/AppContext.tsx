import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
  isShared?: boolean;
}

export interface PurchaseHistoryItem {
  id: string;
  name: string;
  quantity: string;
  buyerName: string;
  purchaseDate: string;
  isShared: boolean;
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
  cuisine: string;
  allergens: string[];
  imageUrl?: string;
  steps: string[];
}

export interface User {
  id: string;
  name: string;
  initials: string;
  username: string;
  preferences?: {
    dietary: string[];
    cuisine: string[];
    allergens: string[];
  };
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
  eventId?: string; // Groups multiple ingredients from same cooking event
  recipeId?: string;
  recipeName?: string;
}

interface AppContextType {
  user: User;
  inventory: InventoryItem[];
  shoppingList: ShoppingItem[];
  recipes: Recipe[];
  roommates: Roommate[];
  feed: FeedEntry[];
  purchaseHistory: PurchaseHistoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  addShoppingItem: (item: Omit<ShoppingItem, "id">) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  addRoommate: (roommate: Omit<Roommate, "id">) => void;
  removeRoommate: (id: string) => void;
  updateUser: (updates: Partial<User>) => void;
  addPurchaseRecord: (itemId: string, record: PurchaseRecord, addAmount?: number) => void;
  addFeedEntry: (entry: FeedEntry) => void;
  useInventoryItem: (itemId: string, usedAmount?: number, eventId?: string, recipeId?: string, recipeName?: string) => void;
  addPurchaseHistoryItem: (item: Omit<PurchaseHistoryItem, "id">) => void;
  calculateEstimatedExpiry: (purchaseDate: string, category: string) => string;
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

const mockShoppingList: ShoppingItem[] = [];

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
    cuisine: "Italian",
    allergens: ["Gluten"],
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
    dietaryTags: ["Vegetarian", "High Protein"],
    cuisine: "Indian",
    allergens: ["Eggs", "Dairy"],
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
    cuisine: "Mexican",
    allergens: ["Gluten"],
    steps: [
      "Cook rice according to package",
      "Season and grill chicken breast",
      "Sauté onions with tomatoes",
      "Slice cooked chicken",
      "Assemble bowl with rice, chicken, tomatoes, and onions",
    ],
  },
  {
    id: "4",
    name: "Greek Salad",
    ingredients: [
      { name: "Tomatoes", quantity: "3 tomatoes", amount: 3 },
      { name: "Greek Yogurt", quantity: "1/2 tub", amount: 0.5 },
      { name: "Onions", quantity: "1/2 onion", amount: 0.5 },
      { name: "Cooking Oil", quantity: "30 mL", amount: 30 },
    ],
    matchPercentage: 100,
    missingIngredients: [],
    prepTime: "15 min",
    difficulty: "Low",
    dietaryTags: ["Vegetarian", "Gluten-Free"],
    cuisine: "Greek",
    allergens: ["Dairy"],
    steps: [
      "Chop tomatoes and onions",
      "Mix yogurt with oil for dressing",
      "Combine vegetables in bowl",
      "Drizzle with yogurt dressing",
      "Season with herbs and serve",
    ],
  },
  {
    id: "5",
    name: "Tomato Pasta",
    ingredients: [
      { name: "Tomatoes", quantity: "4 tomatoes", amount: 4 },
      { name: "Onions", quantity: "1 onion", amount: 1 },
      { name: "Cooking Oil", quantity: "20 mL", amount: 20 },
      { name: "Basmati Rice", quantity: "100 g", amount: 100 },
    ],
    matchPercentage: 75,
    missingIngredients: ["Basmati Rice"],
    prepTime: "25 min",
    difficulty: "Low",
    dietaryTags: ["Vegan", "Vegetarian"],
    cuisine: "Italian",
    allergens: [],
    steps: [
      "Chop tomatoes and onions",
      "Heat oil in pan",
      "Sauté onions until soft",
      "Add tomatoes and simmer",
      "Serve over cooked rice or pasta",
    ],
  },
  {
    id: "6",
    name: "Egg Fried Rice",
    ingredients: [
      { name: "Eggs", quantity: "2 eggs", amount: 2 },
      { name: "Basmati Rice", quantity: "300 g", amount: 300 },
      { name: "Onions", quantity: "1 onion", amount: 1 },
      { name: "Cooking Oil", quantity: "25 mL", amount: 25 },
    ],
    matchPercentage: 100,
    missingIngredients: [],
    prepTime: "20 min",
    difficulty: "Low",
    dietaryTags: ["Vegetarian"],
    cuisine: "Chinese",
    allergens: ["Eggs"],
    steps: [
      "Cook rice and let cool",
      "Beat eggs in a bowl",
      "Heat oil and scramble eggs",
      "Add onions and cook",
      "Mix in rice and stir-fry",
    ],
  },
  {
    id: "7",
    name: "Chicken Stir Fry",
    ingredients: [
      { name: "Chicken Breast", quantity: "300 g", amount: 300 },
      { name: "Onions", quantity: "2 onions", amount: 2 },
      { name: "Tomatoes", quantity: "2 tomatoes", amount: 2 },
      { name: "Cooking Oil", quantity: "30 mL", amount: 30 },
    ],
    matchPercentage: 75,
    missingIngredients: ["Chicken Breast"],
    prepTime: "25 min",
    difficulty: "Medium",
    dietaryTags: ["High Protein"],
    cuisine: "Chinese",
    allergens: [],
    steps: [
      "Slice chicken into strips",
      "Chop onions and tomatoes",
      "Heat oil in wok",
      "Stir-fry chicken until cooked",
      "Add vegetables and cook until tender",
    ],
  },
  {
    id: "8",
    name: "Yogurt Parfait",
    ingredients: [
      { name: "Greek Yogurt", quantity: "1 tub", amount: 1 },
      { name: "Bread", quantity: "1 slice", amount: 1 },
    ],
    matchPercentage: 100,
    missingIngredients: [],
    prepTime: "5 min",
    difficulty: "Low",
    dietaryTags: ["Vegetarian", "Gluten-Free"],
    cuisine: "American",
    allergens: ["Dairy", "Gluten"],
    steps: [
      "Layer yogurt in glass",
      "Crumble bread on top",
      "Repeat layers if desired",
      "Chill and serve",
    ],
  },
  {
    id: "9",
    name: "Simple Omelette",
    ingredients: [
      { name: "Eggs", quantity: "3 eggs", amount: 3 },
      { name: "Cooking Oil", quantity: "10 mL", amount: 10 },
      { name: "Onions", quantity: "1/2 onion", amount: 0.5 },
    ],
    matchPercentage: 100,
    missingIngredients: [],
    prepTime: "10 min",
    difficulty: "Low",
    dietaryTags: ["Vegetarian", "High Protein"],
    cuisine: "French",
    allergens: ["Eggs"],
    steps: [
      "Beat eggs thoroughly",
      "Heat oil in pan",
      "Pour in eggs",
      "Add chopped onions",
      "Fold when set and serve",
    ],
  },
  {
    id: "10",
    name: "Rice Pudding",
    ingredients: [
      { name: "Basmati Rice", quantity: "150 g", amount: 150 },
      { name: "Milk", quantity: "500 mL", amount: 500 },
      { name: "Greek Yogurt", quantity: "1/4 tub", amount: 0.25 },
    ],
    matchPercentage: 67,
    missingIngredients: ["Milk"],
    prepTime: "45 min",
    difficulty: "Medium",
    dietaryTags: ["Vegetarian"],
    cuisine: "Indian",
    allergens: ["Dairy"],
    steps: [
      "Cook rice with milk",
      "Stir frequently while cooking",
      "Sweeten to taste",
      "Mix in yogurt",
      "Serve warm or chilled",
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

/**
 * Calculates estimated expiry date based on food category and purchase date
 * Uses food science data for typical shelf lives
 */
const calculateEstimatedExpiry = (
  purchaseDate: string,
  category: string,
): string => {
  const date = new Date(purchaseDate);
  
  // Define shelf life in days by category
  const shelfLifeByCategory: Record<string, number> = {
    // Dairy - short shelf life
    "Dairy": 14,
    
    // Proteins
    "Meat": 3,
    "Fish": 2,
    
    // Vegetables - variable
    "Vegetables": 7,
    "Produce": 7,
    
    // Fruits
    "Fruits": 7,
    
    // Bakery
    "Bakery": 3,
    
    // Pantry - long shelf life
    "Pantry": 180,
    
    // Default fallback
    "General": 14,
  };
  
  // Get shelf life, with fallback to default
  let shelfLife = shelfLifeByCategory[category];
  if (!shelfLife) {
    // Try to find a matching category by checking if it's contained in category name
    const matchedCategory = Object.keys(shelfLifeByCategory).find(
      key => category.toLowerCase().includes(key.toLowerCase())
    );
    shelfLife = matchedCategory ? shelfLifeByCategory[matchedCategory] : 14;
  }
  
  // Add shelf life to purchase date
  date.setDate(date.getDate() + shelfLife);
  
  // Return as ISO date string
  return date.toISOString().split('T')[0];
};

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
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>(() => {
    // Load purchase history from localStorage on mount
    try {
      const savedHistory = localStorage.getItem("purchaseHistory");
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error("Failed to load purchase history from localStorage:", e);
      return [];
    }
  });

  // Persist purchase history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("purchaseHistory", JSON.stringify(purchaseHistory));
    } catch (e) {
      console.error("Failed to save purchase history to localStorage:", e);
    }
  }, [purchaseHistory]);

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

  const useInventoryItem = (itemId: string, usedAmount: number = 1, eventId?: string, recipeId?: string, recipeName?: string) => {
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
        id: eventId || Date.now().toString(),
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
        eventId: eventId,
        recipeId: recipeId,
        recipeName: recipeName,
      });
    }
  };

  const [shoppingList, setShoppingList] =
    useState<ShoppingItem[]>(mockShoppingList);
  const [recipes] = useState<Recipe[]>(mockRecipes);
  const [roommates, setRoommates] = useState<Roommate[]>(mockRoommates);
  const [sessionPurchaseHistory, setSessionPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);

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

  const addPurchaseHistoryItem = (item: Omit<PurchaseHistoryItem, "id">) => {
    const newItem = { ...item, id: Date.now().toString() };
    // Prepend to maintain most recent first
    setPurchaseHistory((prev) => [newItem, ...prev]);
  };

  const addSessionPurchaseHistoryItem = (items: PurchaseHistoryItem[]) => {
    // Prepend to maintain most recent first
    setSessionPurchaseHistory((prev) => [...items, ...prev]);
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
        purchaseHistory,
        sessionPurchaseHistory,
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
        addPurchaseHistoryItem,
        addSessionPurchaseHistoryItem,
        calculateEstimatedExpiry,
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
