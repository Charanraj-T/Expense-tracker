import api from "../api/axios";

export const getTransactions = async (params) => {
  const { data } = await api.get("/transactions", { params });
  return data;
};

export const getTodayTransactions = async (params) => {
  const { data } = await api.get("/transactions/today", { params });
  return data;
};

export const createTransaction = async (payload) => {
  const { data } = await api.post("/transactions", payload);
  return data;
};

export const getTransactionSummary = async (params) => {
  const { data } = await api.get("/transactions/summary", { params });
  return data;
};

export const deleteTransaction = async (id) => {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
};

export const updateTransaction = async (id, payload) => {
  const { data } = await api.patch(`/transactions/${id}`, payload);
  return data;
};

export const exportTransactionsCsv = async (params) => {
  const { data } = await api.get("/transactions/export/csv", {
    params,
    responseType: "blob",
  });
  return data;
};
