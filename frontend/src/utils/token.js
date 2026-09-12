const USER_KEY = "expense-tracker-user";

let accessToken = null;

export const getToken = () => accessToken;

export const setToken = (token) => {
  accessToken = token;
};

export const removeToken = () => {
  accessToken = null;
};

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};