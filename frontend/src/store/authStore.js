import { create } from "zustand";
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
} from "../utils/token";
import { refreshAccessToken } from "../api/axios";
import { login as loginRequest, register as registerRequest, logout as logoutRequest } from "../services/authService";

const persistedUser = getUser();
const persistedToken = getToken();

export const useAuthStore = create((set) => ({
  user: persistedUser,
  token: persistedToken,
  initialized: false,

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

  bootstrap: async () => {
    if (!getUser() || getToken()) {
      set({ initialized: true });
      return;
    }
    try {
      await refreshAccessToken();
      set({ user: getUser(), token: getToken(), initialized: true });
    } catch {
      removeToken();
      removeUser();
      set({ user: null, token: null, initialized: true });
    }
  },
}));