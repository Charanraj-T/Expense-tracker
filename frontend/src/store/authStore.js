import { create } from "zustand";
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
} from "../utils/token";
import { login as loginRequest, register as registerRequest } from "../services/authService";

const persistedUser = getUser();
const persistedToken = getToken();

export const useAuthStore = create((set) => ({
  user: persistedUser,
  token: persistedToken,
  isAuthenticated: Boolean(persistedToken),

  login: async (email, password) => {
    const data = await loginRequest(email, password);
    const { token, ...user } = data;

    setToken(token);
    setUser(user);
    set({ user, token, isAuthenticated: true });
    return data;
  },

  register: async (email, username, password) => {
    return registerRequest(email, username, password);
  },

  logout: () => {
    removeToken();
    removeUser();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));