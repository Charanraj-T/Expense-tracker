import api from "../api/axios";

export const getTransactions = async (params) => {
  const { data } = await api.get("/transactions", { params });
  return data;
};

export const createTransaction = async (payload) => {
  const { data } = await api.post("/transactions", payload);
  return data;
};