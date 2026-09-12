import { create } from "zustand";
import {
  getCurrentMonthString,
  getPreviousMonth,
  getNextMonth,
  getCustomMonthRange,
} from "../utils/dateRange";
import {
  getTransactions,
  getTransactionSummary,
  createTransaction,
  deleteTransaction as deleteTransactionApi,
  updateTransaction as updateTransactionApi,
} from "../services/transactionService";

const DEFAULT_CATEGORIES = [
  "food",
  "rent",
  "groceries",
  "salary",
  "utilities",
  "investment",
  "entertainment",
  "transport",
];

const getStoredPreference = (key, defaultValue) => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStoredPreference = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or access errors
  }
};

const getStoredRecentCategories = () => {
  try {
    const raw = localStorage.getItem("recent_categories");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_CATEGORIES;
};

export const useTransactionStore = create((set, get) => ({
  currentMonth: getCurrentMonthString(),
  datePreference: getStoredPreference("date_preference", "last-day"),
  currency: getStoredPreference("currency", "₹"),
  recentCategories: getStoredRecentCategories(),

  // Data
  summary: { income: 0, expense: 0, investment: 0 },
  transactions: [],
  chartTransactions: [],
  pagination: { page: 1, limit: 50, total: 0, pages: 1 },
  filterType: "", // '' means all
  search: "",

  // UI state
  isAddModalOpen: false,
  loading: false,

  buildRangeParams: (extra = {}) => {
    const { currentMonth, datePreference } = get();
    const range = getCustomMonthRange(currentMonth, datePreference);
    return { startDate: range.startDateStr, endDate: range.endDateStr, ...extra };
  },

  refreshAllData: async () => {
    return Promise.all([
      get().fetchSummary(),
      get().fetchTransactions(),
      get().fetchChartTransactions(),
    ]);
  },

  // Month actions
  setMonth: (monthStr) => {
    set({
      currentMonth: monthStr,
      pagination: { ...get().pagination, page: 1 },
    });
    get().refreshAllData();
  },

  nextMonth: () => {
    const next = getNextMonth(get().currentMonth);
    get().setMonth(next);
  },

  prevMonth: () => {
    const prev = getPreviousMonth(get().currentMonth);
    get().setMonth(prev);
  },

  resetToCurrentMonth: () => {
    get().setMonth(getCurrentMonthString());
  },

  // Preference actions
  setDatePreference: (preference) => {
    setStoredPreference("date_preference", preference);
    set({ datePreference: preference });
    get().refreshAllData();
  },

  setCurrency: (currency) => {
    setStoredPreference("currency", currency);
    set({ currency });
  },

  // Filter and pagination
  setFilterType: (filterType) => {
    set({ filterType, pagination: { ...get().pagination, page: 1 } });
    get().fetchTransactions();
  },

  setSearch: (query) => {
    set({ search: query, pagination: { ...get().pagination, page: 1 } });
    get().fetchTransactions();
  },

  setPage: (page) => {
    set({ pagination: { ...get().pagination, page } });
    get().fetchTransactions();
  },

  // Modal actions
  editingTransaction: null,
  openAddModal: () =>
    set({ isAddModalOpen: true, editingTransaction: null }),
  openEditModal: (transaction) =>
    set({ isAddModalOpen: true, editingTransaction: transaction }),
  closeAddModal: () =>
    set({ isAddModalOpen: false, editingTransaction: null }),

  // Data fetching
  fetchSummary: async () => {
    try {
      const params = get().buildRangeParams();
      const data = await getTransactionSummary(params);
      set({
        summary: {
          income: data?.income || 0,
          expense: data?.expense || 0,
          investment: data?.investment || 0,
        },
      });
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  },

  fetchTransactions: async (extraParams = {}) => {
    set({ loading: true });
    try {
      const { filterType, pagination, search } = get();
      const params = get().buildRangeParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...extraParams,
      });
      if (filterType && !params.type) {
        params.type = filterType;
      }
      const data = await getTransactions(params);
      set({
        transactions: data?.transactions || [],
        pagination: data?.pagination || pagination,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      console.error(
        "Failed to fetch transactions:",
        err?.response?.data?.message || err?.message,
      );
    }
  },

  fetchChartTransactions: async () => {
    try {
      const params = get().buildRangeParams({ limit: 100 });
      const data = await getTransactions(params);
      set({ chartTransactions: data?.transactions || [] });
    } catch (err) {
      console.error("Failed to fetch chart transactions:", err);
    }
  },

  addTransaction: async (payload) => {
    const res = await createTransaction(payload);

    if (payload.category) {
      const cat = payload.category.trim().toLowerCase();
      const currentList = get().recentCategories.filter((c) => c !== cat);
      const updatedList = [cat, ...currentList].slice(0, 10);
      set({ recentCategories: updatedList });
      setStoredPreference("recent_categories", JSON.stringify(updatedList));
    }

    await get().refreshAllData();

    return res;
  },

  deleteTransaction: async (id) => {
    await deleteTransactionApi(id);
    await get().refreshAllData();
  },

  updateTransaction: async (payload) => {
    const editing = get().editingTransaction;
    if (!editing) return null;
    const res = await updateTransactionApi(editing._id, payload);
    await get().refreshAllData();
    get().closeAddModal();
    return res;
  },
}));