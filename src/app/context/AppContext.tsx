import React, { createContext, useContext, useState, ReactNode } from "react";

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
  ingredients: string[];
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
}

export interface Roommate {
  id: string;
  name: string;
  initials: string;
  status: "active" | "pending";
}

interface AppContextType {
  user: User;
  inventory: InventoryItem[];
  shoppingList: ShoppingItem[];
  recipes: Recipe[];
  roommates: Roommate[];
  addInventoryItem: (item: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  addShoppingItem: (item: Omit<ShoppingItem, "id">) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  addRoommate: (roommate: Omit<Roommate, "id">) => void;
  removeRoommate: (id: string) => void;
  updateUser: (updates: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockInventory: InventoryItem[] = [
  { id: "1", name: "Whole Milk", category: "Dairy", isShared: true, status: "Low", lastAdded: "2 days ago", updatedBy: "JD", quantity: "1 L", expiryDate: "2026-03-18", unit: "L", amount: 1 },
  { id: "2", name: "Greek Yogurt", category: "Dairy", isShared: false, status: "In Stock", lastAdded: "Yesterday", updatedBy: "ME", quantity: "3 cups", expiryDate: "2026-03-25", unit: "cups", amount: 3 },
  { id: "3", name: "Avocados", category: "Produce", isShared: true, status: "Low", lastAdded: "4 days ago", updatedBy: "AL", quantity: "2 avocados", expiryDate: "2026-03-16", unit: "avocados", amount: 2 },
  { id: "4", name: "Basmati Rice", category: "Pantry", isShared: true, status: "In Stock", lastAdded: "1 week ago", updatedBy: "JD", quantity: "500 g", expiryDate: "2027-01-01", unit: "g", amount: 500 },
  { id: "5", name: "Chicken Breast", category: "Meat", isShared: false, status: "Out", lastAdded: "3 days ago", updatedBy: "ME", quantity: "0 kg", expiryDate: "2026-03-14", unit: "kg", amount: 0 },
  { id: "6", name: "Organic Spinach", category: "Produce", isShared: true, status: "In Stock", lastAdded: "Today", updatedBy: "AL", quantity: "1 bag", expiryDate: "2026-03-20", unit: "bag", amount: 1 },
  { id: "7", name: "Tomatoes", category: "Produce", isShared: true, status: "In Stock", lastAdded: "Today", updatedBy: "ME", quantity: "6 tomatoes", expiryDate: "2026-03-19", unit: "tomatoes", amount: 6 },
  { id: "8", name: "Cheddar Cheese", category: "Dairy", isShared: false, status: "Low", lastAdded: "5 days ago", updatedBy: "ME", quantity: "200 g", expiryDate: "2026-03-22", unit: "g", amount: 200 },
];

const mockShoppingList: ShoppingItem[] = [
  { id: "1", name: "Eggs", category: "Dairy", addedBy: "JD", needed: true, quantity: "12 eggs" },
  { id: "2", name: "Bread", category: "Bakery", addedBy: "AL", needed: true, quantity: "1 loaf" },
  { id: "3", name: "Bananas", category: "Produce", addedBy: "ME", needed: false, quantity: "6 bananas" },
];

const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Avocado Toast",
    ingredients: ["Avocados", "Bread", "Tomatoes"],
    matchPercentage: 66,
    missingIngredients: ["Bread"],
    prepTime: "10 min",
    difficulty: "Low",
    dietaryTags: ["Vegetarian", "Vegan"],
    steps: [
      "Toast the bread slices until golden brown",
      "Mash the avocados in a bowl",
      "Spread mashed avocado on toast",
      "Top with sliced tomatoes",
      "Season with salt and pepper"
    ]
  },
  {
    id: "2",
    name: "Spinach Omelette",
    ingredients: ["Eggs", "Organic Spinach", "Cheddar Cheese"],
    matchPercentage: 66,
    missingIngredients: ["Eggs"],
    prepTime: "15 min",
    difficulty: "Low",
    dietaryTags: ["Vegetarian"],
    steps: [
      "Beat eggs in a bowl",
      "Sauté spinach in a pan",
      "Pour eggs over spinach",
      "Add cheese and fold",
      "Cook until set"
    ]
  },
  {
    id: "3",
    name: "Chicken Rice Bowl",
    ingredients: ["Chicken Breast", "Basmati Rice", "Organic Spinach"],
    matchPercentage: 66,
    missingIngredients: ["Chicken Breast"],
    prepTime: "30 min",
    difficulty: "Medium",
    dietaryTags: ["High Protein"],
    steps: [
      "Cook rice according to package",
      "Season and grill chicken breast",
      "Sauté spinach with garlic",
      "Slice cooked chicken",
      "Assemble bowl with rice, chicken, and spinach"
    ]
  },
];

const mockRoommates: Roommate[] = [
  { id: "1", name: "John Doe", initials: "JD", status: "active" },
  { id: "2", name: "Alex Lee", initials: "AL", status: "active" },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ id: "me", name: "You", initials: "ME" });
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(mockShoppingList);
  const [recipes] = useState<Recipe[]>(mockRecipes);
  const [roommates, setRoommates] = useState<Roommate[]>(mockRoommates);

  const addInventoryItem = (item: Omit<InventoryItem, "id">) => {
    const newItem = { ...item, id: Date.now().toString() };
    setInventory([...inventory, newItem]);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(inventory.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const addShoppingItem = (item: Omit<ShoppingItem, "id">) => {
    const newItem = { ...item, id: Date.now().toString() };
    setShoppingList([...shoppingList, newItem]);
  };

  const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingList(shoppingList.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  const addRoommate = (roommate: Omit<Roommate, "id">) => {
    const newRoommate = { ...roommate, id: Date.now().toString() };
    setRoommates([...roommates, newRoommate]);
  };

  const removeRoommate = (id: string) => {
    setRoommates(roommates.filter(r => r.id !== id));
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
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        addRoommate,
        removeRoommate,
        updateUser,
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
