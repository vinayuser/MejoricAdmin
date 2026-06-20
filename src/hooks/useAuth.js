import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login as loginAction, logoutUser } from "../store/auth/authActions";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const login = async (credentials) => {
    const result = await dispatch(loginAction(credentials));
    if (result.success) {
      navigate("/dashboard");
      return true;
    }
    return result;
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
};

export default useAuth;
