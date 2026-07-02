import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  Activity,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserPlus,
  Building,
  Heart,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts";

// Static dashboard data for demo
const staticDashboardData = {
  // Summary stats
  totalUsers: 1250,
  totalMentors: 85,
  totalMentees: 1100,
  totalCategories: 24,
  totalSessions: 450,

  // Status counts (for charts)
  statusCounts: [
    { _id: "active", count: 750 },
    { _id: "pending", count: 350 },
    { _id: "completed", count: 150 },
  ],

  // Test counts by status
  testCountsByStatus: [
    { _id: "completed", count: 280 },
    { _id: "pending", count: 120 },
    { _id: "cancelled", count: 50 },
  ],

  // Monthly data for sales chart
  selles: [
    { title: "Jan", revenue: 45000, quantity: 45, efficiency: 85 },
    { title: "Feb", revenue: 52000, quantity: 52, efficiency: 88 },
    { title: "Mar", revenue: 48000, quantity: 48, efficiency: 82 },
    { title: "Apr", revenue: 61000, quantity: 61, efficiency: 90 },
    { title: "May", revenue: 55000, quantity: 55, efficiency: 87 },
    { title: "Jun", revenue: 67000, quantity: 67, efficiency: 92 },
  ],

  // Users by role
  usersByRole: [
    { _id: "admin", count: 5 },
    { _id: "mentor", count: 85 },
    { _id: "mentee", count: 1100 },
    { _id: "staff", count: 60 },
  ],

  // Users by month
  usersByMonth: [
    { _id: 1, count: 120 },
    { _id: 2, count: 150 },
    { _id: 3, count: 180 },
    { _id: 4, count: 200 },
    { _id: 5, count: 250 },
    { _id: 6, count: 350 },
  ],

  // Sessions by category
  sessionsByCategory: [
    { name: "Web Development", value: 35 },
    { name: "Data Science", value: 25 },
    { name: "Mobile Dev", value: 20 },
    { name: "UI/UX Design", value: 15 },
    { name: "DevOps", value: 5 },
  ],

  // Today's data
  today: {
    totalTests: 45,
    totalRevenue: 12500,
  },
  todaysAppointments: [
    { _id: "1", name: "John Doe - Web Dev" },
    { _id: "2", name: "Sarah - Data Science" },
    { _id: "3", name: "Mike - Mobile Dev" },
    { _id: "4", name: "Emily - UI/UX" },
    { _id: "5", name: "David - Python" },
  ],
  todaySells: 28,
  todayRevenue: 8500,
  totalSells: 450,
  totalRevenue: 328000,
};

const chartCardClass =
  "rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5";

const sectionTitleClass = "text-base font-semibold text-slate-900";

// Stat cards — align with admin shell (slate + indigo)
const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  trendType = "positive",
}) => (
  <div
    className={`${chartCardClass} flex flex-col justify-between transition hover:shadow-md`}
  >
    <div className="mb-4 flex items-start justify-between gap-2">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600/10">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      {trend != null && (
        <div
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            trendType === "positive"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {trendType === "positive" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )}
          {trend}%
        </div>
      )}
    </div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  </div>
);

// Modern Radial Chart for User Status
const UserStatusChart = ({ statusCounts }) => {
  const totalUsers = statusCounts.reduce(
    (sum, status) => sum + status.count,
    0,
  );

  const radialData = statusCounts.map((status, index) => ({
    name: status._id,
    value: status.count,
    percentage: ((status.count / totalUsers) * 100).toFixed(1),
    fill:
      status._id === "active"
        ? "#10B981"
        : status._id === "pending"
          ? "#F59E0B"
          : "#EF4444",
  }));

  return (
    <div className={`${chartCardClass} transition-shadow`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
          <Activity className="h-5 w-5" />
        </div>
        <h3 className={sectionTitleClass}>User status</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="80%"
          data={radialData}
        >
          <RadialBar
            minAngle={15}
            label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
            background
            clockWise
            dataKey="value"
            nameKey="name"
          />
          <Legend
            iconSize={12}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
            formatter={(value, name, props) => [
              `${value} (${props.payload.percentage}%)`,
              name,
            ]}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Monthly Revenue Chart
const RevenueChart = ({ selles }) => {
  const chartData = selles.map((sale) => ({
    name: sale.title,
    revenue: sale.revenue,
    quantity: sale.quantity,
    efficiency: sale.efficiency,
  }));

  return (
    <div className={`${chartCardClass} transition-shadow`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
          <TrendingUp className="h-5 w-5" />
        </div>
        <h3 className={sectionTitleClass}>Monthly revenue</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            fill="url(#blueGradient)"
            name="Revenue (₹)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="quantity"
            fill="url(#purpleGradient)"
            name="Sessions"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="efficiency"
            stroke="#EC4899"
            strokeWidth={3}
            name="Efficiency %"
          />
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Session Category Pie Chart
const CategoryPieChart = ({ sessionsByCategory }) => {
  const COLORS = ["#3B82F6", "#8B5CF6", "#14B8A6", "#EC4899", "#F59E0B"];

  return (
    <div className={`${chartCardClass} transition-shadow`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
          <BookOpen className="h-5 w-5" />
        </div>
        <h3 className={sectionTitleClass}>Sessions by category</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={sessionsByCategory}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {sessionsByCategory.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// User Growth Area Chart
const UserGrowthChart = ({ usersByMonth }) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData = usersByMonth.map((item) => ({
    name: monthNames[item._id - 1] || `Month ${item._id}`,
    users: item.count,
    growth: Math.floor(Math.random() * 20) + 10,
  }));

  return (
    <div className={`${chartCardClass} transition-shadow`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
          <Users className="h-5 w-5" />
        </div>
        <h3 className={sectionTitleClass}>User growth</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="users"
            stackId="1"
            stroke="#10B981"
            fill="url(#greenGradient)"
            name="New Users"
          />
          <Area
            type="monotone"
            dataKey="growth"
            stackId="1"
            stroke="#F59E0B"
            fill="url(#orangeGradient)"
            name="Growth %"
          />
          <defs>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Today's Stats Component
const TodayStats = ({
  statusCounts,
  today,
  todaysAppointments,
  todaySells,
  todayRevenue,
  totalSells,
}) => {
  const todayData = {
    activePatients: todaysAppointments?.length || 0,
    revenue: today?.totalRevenue || 0,
    todayRevenue: todayRevenue || 0,
    todaySells: todaySells || 0,
    totalSells: totalSells || 0,
    emergencies: 3,
    surgeries: 5,
  };

  const todayAppointments = statusCounts.map((status) => ({
    status: status._id,
    count: status.count,
    icon:
      status._id === "active"
        ? CheckCircle
        : status._id === "pending"
          ? Clock
          : XCircle,
    color:
      status._id === "active"
        ? "text-emerald-600"
        : status._id === "pending"
          ? "text-amber-600"
          : "text-rose-600",
  }));

  return (
    <div className="space-y-6">
      <div className={chartCardClass}>
        <h3 className={`mb-4 ${sectionTitleClass}`}>Today&apos;s sessions</h3>
        <div className="space-y-2">
          {todayAppointments.map((appointment, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <appointment.icon
                  className={`h-5 w-5 shrink-0 ${appointment.color}`}
                />
                <span className="font-medium capitalize text-slate-800">
                  {appointment.status}
                </span>
              </div>
              <span className="text-xl font-semibold tabular-nums text-slate-900">
                {appointment.count}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-indigo-200/80 bg-indigo-50/80 px-4 py-3">
          <div className="flex items-center gap-2 text-indigo-900">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium">Scheduled today</span>
          </div>
          <span className="text-xl font-semibold tabular-nums text-indigo-950">
            {todayData.activePatients}
          </span>
        </div>
      </div>

      <div className={chartCardClass}>
        <h3 className={`mb-4 ${sectionTitleClass}`}>
          Today&apos;s performance
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              Icon: GraduationCap,
              label: "Active mentors",
              value: "12",
              accent: "text-indigo-600 bg-indigo-50",
            },
            {
              Icon: Users,
              label: "Active mentees",
              value: String(todayData.activePatients),
              accent: "text-slate-700 bg-slate-100",
            },
            {
              Icon: UserCheck,
              label: "Completed sessions",
              value: String(todayData.todaySells),
              accent: "text-emerald-700 bg-emerald-50",
            },
            {
              Icon: IndianRupee,
              label: "Today’s revenue",
              value: `₹${todayData.todayRevenue.toLocaleString()}`,
              accent: "text-amber-800 bg-amber-50",
            },
            {
              Icon: ShoppingCart,
              label: "Total sessions (all time)",
              value: String(todayData.totalSells),
              accent: "text-slate-700 bg-slate-100",
            },
          ].map(({ Icon: I, label, value, accent }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}
                >
                  <I className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-600">{label}</p>
              </div>
              <p className="text-lg font-semibold tabular-nums text-slate-900">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={chartCardClass}>
        <h3 className={`mb-4 ${sectionTitleClass}`}>Quick stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
            <Heart className="mx-auto mb-2 h-8 w-8 text-rose-500" />
            <p className="text-xs font-medium text-slate-500">Pending</p>
            <p className="text-2xl font-semibold text-slate-900">350</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
            <Building className="mx-auto mb-2 h-8 w-8 text-indigo-600" />
            <p className="text-xs font-medium text-slate-500">Completed</p>
            <p className="text-2xl font-semibold text-slate-900">900</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useGetQuery } from "../api/apiCall";
import API_ENDPOINTS from "../api/apiEndpoint";
import { Link } from "react-router-dom";
import { formatDateTime } from "../utils/formatters";

const TodaysRegisteredUsers = ({ users = [], count = 0 }) => {
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={chartCardClass}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className={sectionTitleClass}>Today&apos;s registered users</h3>
          <p className="mt-1 text-sm text-slate-500">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-600/10">
            {count} new {count === 1 ? "user" : "users"}
          </span>
          <Link
            to="/users"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            View all users →
          </Link>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No users registered today yet</p>
          <p className="mt-1 text-xs text-slate-500">
            New signups will appear here as they register.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Age
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  City
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Registered at
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id} className="bg-white hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium capitalize text-slate-900">
                    {user.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{user.mobile || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{user.age ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{user.city || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {formatDateTime(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {count > users.length && (
            <p className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-xs text-slate-500">
              Showing latest {users.length} of {count} users registered today.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetQuery(API_ENDPOINTS.DASHBOARD.GET_DASHBOARD, ["dashboard-stats"]);

  const dashboardData = apiResponse?.data || null;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"
            aria-hidden
          />
          <p className="text-sm font-medium text-slate-600">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center">
        <h3 className="text-sm font-bold text-red-900">
          Failed to load dashboard
        </h3>
        <p className="mt-1 text-sm text-red-600">
          {error?.message || "Please check your connection."}
        </p>
      </div>
    );
  }

  if (!dashboardData) return null;

  // Adapt backend data to component needs if names differ
  const sellesData =
    dashboardData.selles?.map((s) => ({
      title: s.title,
      revenue: s.totalRevenue || s.revenue || 0,
      quantity: s.totalQuantitySold || s.quantity || 0,
      efficiency: s.efficiency || 85,
    })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Live overview of users, system performance, and engagement.
        </p>
      </div>
      <div>
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={Users}
            title="Total users"
            value={dashboardData.totalUsers?.toLocaleString() || "0"}
            trend={12}
          />
          <StatCard
            icon={GraduationCap}
            title="Total categories"
            value={dashboardData.totalCategories?.toLocaleString() || "0"}
            trend={8}
          />
          <StatCard
            icon={UserPlus}
            title="Registered today"
            value={(
              dashboardData.todayRegisteredUsersCount ?? 0
            ).toLocaleString()}
          />
          <StatCard
            icon={UserCheck}
            title="Recent users (7d)"
            value={dashboardData.recentUsers?.toLocaleString() || "0"}
            trend={15}
          />
          <StatCard
            icon={IndianRupee}
            title="Total revenue"
            value={`₹${(dashboardData.totalRevenue || 0).toLocaleString()}`}
            trend={20}
          />
        </div>

        <TodaysRegisteredUsers
          users={dashboardData.todayRegisteredUsers || []}
          count={dashboardData.todayRegisteredUsersCount ?? 0}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Charts Section - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <UserStatusChart
                statusCounts={dashboardData.statusCounts || []}
              />
              <RevenueChart selles={sellesData} />
            </div>

            {/* Category Pie Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CategoryPieChart
                sessionsByCategory={
                  dashboardData.productsByCategory?.map((p) => ({
                    name: p._id,
                    value: p.count,
                  })) || []
                }
              />
              <UserGrowthChart
                usersByMonth={dashboardData.usersByMonth || []}
              />
            </div>
          </div>

          {/* Right Sidebar - Today's Stats */}
          <div className="lg:col-span-1">
            <TodayStats
              statusCounts={dashboardData.statusCounts || []}
              today={dashboardData.today}
              todaysAppointments={dashboardData.todaysAppointments}
              todaySells={dashboardData.todaySells}
              todayRevenue={dashboardData.todayRevenue}
              totalSells={dashboardData.totalSells}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
