import api from "../api/axios";

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const register = async (email, username, password) => {
  const { data } = await api.post("/auth/register", { email, username, password });
  return data;
};

export const logout = async () => {
  await api.post("/auth/logout");
};