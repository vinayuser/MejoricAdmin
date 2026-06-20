import { Navigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="min-h-screen">
      <LoginForm />
    </div>
  );
};

export default Login;
