import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("user"),
  loading: false,
  error: null,
  loginRedirect: localStorage.getItem("loginRedirect") !== "false",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.loginRedirect = false;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("loginRedirect", "false");
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loginRedirect = true;
      localStorage.removeItem("user");
      localStorage.setItem("loginRedirect", "true");
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    restoreSession: (state) => {
      const user = localStorage.getItem("user");
      const loginRedirect = localStorage.getItem("loginRedirect");
      if (user) {
        state.user = JSON.parse(user);
        state.isAuthenticated = true;
        state.loginRedirect = loginRedirect !== "false";
      }
    },
    resetLoginRedirect: (state) => {
      state.loginRedirect = true;
      localStorage.setItem("loginRedirect", "true");
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfile,
  restoreSession,
  resetLoginRedirect,
} = authSlice.actions;

export default authSlice.reducer;
