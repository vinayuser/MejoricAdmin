import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import store from "./store/store";

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

import MainLayout from "./components/Layout/MainLayout";
import MenteeAdd from "./pages/mentee/MenteeAdd";
import MateAdd from "./pages/mate/MateAdd";
import MateList from "./pages/mate/MateList";
import MateEdit from "./pages/mate/MateEdit";
import Users from "./pages/Users";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Financials = lazy(() => import("./pages/Financials"));
const Bookings = lazy(() => import("./pages/Bookings"));
const CategoryPage = lazy(() => import("./pages/category/categoryPage"));
const CategoryAddEdit = lazy(() => import("./pages/category/CategoryAddEdit"));
const MenteeList = lazy(() => import("./pages/mentee/MenteeList"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" />
        <Router basename="/admin">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              {/* Protected routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<Users />} />
                <Route path="/financials" element={<Financials />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/mentees" element={<MenteeList />} />
                <Route path="/mentee/add" element={<MenteeAdd />} />
                <Route path="/mate/add" element={<MateAdd />} />
                <Route path="/mates" element={<MateList />} />
                <Route path="/mate/edit/:id" element={<MateEdit />} />


                <Route path="/category/add" element={<CategoryAddEdit />} />
                <Route
                  path="/category/update/:id"
                  element={<CategoryAddEdit />}
                />
              
                <Route
                  path="/"
                  element={<Navigate to="/" replace />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
