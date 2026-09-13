import {
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Home,
  Zap,
  Car,
  Film,
  HeartPulse,
  BookOpen,
  CreditCard,
  Banknote,
  Briefcase,
  Gift,
  HandCoins,
  TrendingUp,
  Landmark,
  Gem,
} from "lucide-react";

export const CATEGORY_GROUPS = {
  expense: [
    { name: "food", label: "Food & Dining", icon: Utensils },
    { name: "groceries", label: "Groceries", icon: ShoppingCart },
    { name: "shopping", label: "Shopping", icon: ShoppingBag },
    { name: "rent", label: "Rent & Living", icon: Home },
    { name: "bills", label: "Utilities & Bills", icon: Zap },
    { name: "travel", label: "Travel & Transit", icon: Car },
    { name: "entertainment", label: "Entertainment", icon: Film },
    { name: "health", label: "Health & Fitness", icon: HeartPulse },
    { name: "books", label: "Books & Learning", icon: BookOpen },
    { name: "other", label: "Other", icon: CreditCard },
  ],
  income: [
    { name: "salary", label: "Salary", icon: Banknote },
    { name: "freelance", label: "Freelance", icon: Briefcase },
    { name: "gift", label: "Gift", icon: Gift },
    { name: "refund", label: "Refund", icon: HandCoins },
    { name: "other", label: "Other", icon: CreditCard },
  ],
  investment: [
    { name: "sip", label: "SIP", icon: TrendingUp },
    { name: "mutual_funds", label: "Mutual Funds", icon: TrendingUp },
    { name: "stocks", label: "Stocks", icon: TrendingUp },
    { name: "ppf", label: "PPF", icon: Landmark },
    { name: "gold", label: "Gold", icon: Gem },
    { name: "fixed_deposit", label: "Fixed Deposit", icon: Landmark },
    { name: "investment", label: "Investments", icon: TrendingUp },
    { name: "other", label: "Other", icon: CreditCard },
  ],
};

export const getCategoriesForType = (type) => CATEGORY_GROUPS[type] || [];

export const getCategoryByName = (name) => {
  for (const group of Object.values(CATEGORY_GROUPS)) {
    const found = group.find((c) => c.name === name);
    if (found) return found;
  }
  return undefined;
};