import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  restoreSession,
} from "./authSlice";
import axiosInstance from "../../api/axiosInstance";
import API_ENDPOINTS from "../../api/apiEndpoint";

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await axiosInstance.post(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    const { user } = response.data.data;
    dispatch(loginSuccess({ user }));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed";
    dispatch(loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    dispatch(logout());
  } catch (error) {
    console.error("Logout error:", error);
    dispatch(logout());
  }
};

export const getUserProfile = () => async (dispatch) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
    dispatch(
      loginSuccess({
        user: response.data.data,
      }),
    );
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch profile";
    return { success: false, error: errorMessage };
  }
};

// Check and restore authentication on page reload
export const checkAuth = () => async (dispatch) => {
  const userStr = localStorage.getItem("user");

  // Attempt to fetch profile to verify session cookie
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
    const user = response.data.data;
    dispatch(loginSuccess({ user }));
    return { success: true };
  } catch (error) {
    // If profile fetch fails, but we have cached user data, we could potentially
    // keep the UI state for a moment, but it's safer to logout if the cookie is gone.
    if (userStr) {
      console.log("Session cookie missing, clearing local user data");
    }
    dispatch(logout());
    return { success: false, error: "Authentication expired" };
  }
};
