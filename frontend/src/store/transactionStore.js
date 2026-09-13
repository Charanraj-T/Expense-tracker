import { create } from "zustand";
import { getCurrentMonthString, getCustomMonthRange, getTodayDateString } from "../utils/dateRange";
import {
  getTransactions,
  getTodayTransactions,
  getTransactionSummary,
  createTransaction,
  deleteTransaction as deleteTransactionApi,
  updateTransaction as updateTransactionApi,
} from "../services/transactionService";

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
  }
};

export const useTransactionStore = create((set, get) => ({
  currentMonth: getCurrentMonthString(),
  datePreference: getStoredPreference("date_preference", "last-day"),

  summary: { income: 0, expense: 0, investment: 0, dailyAverage: 0, daysInPeriod: 30 },
  transactions: [],
  todayTransactions: [],
  chartTransactions: [],
  pagination: { page: 1, limit: 50, total: 0, pages: 1 },
  filterType: "",
  search: "",

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
      get().fetchTodayTransactions(),
      get().fetchChartTransactions(),
    ]);
  },

  setMonth: (monthStr) => {
    set({
      currentMonth: monthStr,
      pagination: { ...get().pagination, page: 1 },
    });
    get().refreshAllData();
  },

  resetToCurrentMonth: () => {
    get().setMonth(getCurrentMonthString());
  },

  setDatePreference: (preference) => {
    setStoredPreference("date_preference", preference);
    set({ datePreference: preference });
    get().refreshAllData();
  },

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

  editingTransaction: null,
  openAddModal: () =>
    set({ isAddModalOpen: true, editingTransaction: null }),
  openEditModal: (transaction) =>
    set({ isAddModalOpen: true, editingTransaction: transaction }),
  closeAddModal: () =>
    set({ isAddModalOpen: false, editingTransaction: null }),

  fetchSummary: async () => {
    try {
      const params = get().buildRangeParams();
      const data = await getTransactionSummary(params);
      set({
        summary: {
          income: data?.income || 0,
          expense: data?.expense || 0,
          investment: data?.investment || 0,
          dailyAverage: data?.dailyAverage || 0,
          daysInPeriod: data?.daysInPeriod || 30,
        },
      });
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  },

  fetchTodayTransactions: async () => {
    try {
      const data = await getTodayTransactions({ clientDate: getTodayDateString() });
      set({ todayTransactions: data?.transactions || [] });
    } catch (err) {
      console.error("Failed to fetch today transactions:", err);
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
      const params = get().buildRangeParams({ limit: 1000 });
      const data = await getTransactions(params);
      set({ chartTransactions: data?.transactions || [] });
    } catch (err) {
      console.error("Failed to fetch chart transactions:", err);
    }
  },

  addTransaction: async (payload) => {
    const res = await createTransaction(payload);
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