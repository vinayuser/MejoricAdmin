import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "./Header";
import Sidebar from "./Sidebar";
import useAuth from "../../hooks/useAuth";
import { getUserProfile } from "../../store/auth/authActions";

const MainLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    // Refresh user profile on layout mount
    if (isAuthenticated && !user) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50/30 overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-col flex-1 lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
          <div className="mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
