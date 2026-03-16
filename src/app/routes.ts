import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { MealIdeas } from "./components/MealIdeas";
import { ShoppingList } from "./components/ShoppingList";
import { Auth } from "./components/Auth";
import { Profile } from "./components/Profile";
import { Roommates } from "./components/Roommates";
import { AddItem } from "./components/AddItem";
import { ItemDetail } from "./components/ItemDetail";
import { Help } from "./components/Help";
import { RecipeDetail } from "./components/RecipeDetail";
import { ScanReceipt } from "./components/ScanReceipt";

export const router = createBrowserRouter([
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "inventory", Component: Inventory },
      { path: "inventory/:id", Component: ItemDetail },
      { path: "meals", Component: MealIdeas },
      { path: "meals/:id", Component: RecipeDetail },
      { path: "shopping", Component: ShoppingList },
      { path: "scan-receipt", Component: ScanReceipt },
      { path: "profile", Component: Profile },
      { path: "roommates", Component: Roommates },
      { path: "add-item", Component: AddItem },
      { path: "help", Component: Help },
    ],
  },
]);