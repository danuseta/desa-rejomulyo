// src/utils/auth.js
const TOKEN_KEY = 'token';
const USER_ROLE_KEY = 'userRole';
const USER_ID_KEY = 'userId';
const USER_NAME_KEY = 'userName';

export const setToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const getUserRole = () => {
  return localStorage.getItem(USER_ROLE_KEY);
};

export const setUserData = (data) => {
  if (!data) return;
  
  try {
    localStorage.setItem(USER_ROLE_KEY, data.role);
    localStorage.setItem(USER_ID_KEY, data.id.toString());
    localStorage.setItem(USER_NAME_KEY, data.username);
  } catch (error) {
    console.error('Error setting user data:', error);
    clearUserData();
  }
};

export const getUserData = () => {
  try {
    return {
      role: localStorage.getItem(USER_ROLE_KEY),
      id: localStorage.getItem(USER_ID_KEY),
      username: localStorage.getItem(USER_NAME_KEY)
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearUserData = () => {
  try {
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    removeToken();
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};