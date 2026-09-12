import { create } from "zustand";
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
} from "../utils/token";
import { login as loginRequest, register as registerRequest, logout as logoutRequest } from "../services/authService";

const persistedUser = getUser();
const persistedToken = getToken();

export const useAuthStore = create((set) => ({
  user: persistedUser,
  token: persistedToken,

  login: async (email, password) => {
    const data = await loginRequest(email, password);
    const { token, ...user } = data;

    setToken(token);
    setUser(user);
    set({ user, token });
    return data;
  },

  register: async (email, username, password) => {
    return registerRequest(email, username, password);
  },

  logout: () => {
    logoutRequest().catch(() => {});
    removeToken();
    removeUser();
    set({ user: null, token: null });
  },
}));