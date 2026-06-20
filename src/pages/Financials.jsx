import React, { useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  Users,
  Coins,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  ArrowRight,
  PiggyBank,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useGetQuery } from "../api/apiCall";
import API_ENDPOINTS from "../api/apiEndpoint";

const chartCardClass =
  "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md";

const sectionTitleClass = "text-base font-semibold text-slate-900";

const Financials = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [mateSearch, setMateSearch] = useState("");
  const [txSearch, setTxSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("recharges");
  const [expandedDay, setExpandedDay] = useState({});

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetQuery(
    API_ENDPOINTS.DASHBOARD.GET_FINANCIALS,
    ["financial-stats"],
    { refetchOnWindowFocus: true }
  );

  const stats = apiResponse?.data || {
    rechargeSpending: [],
    dailyEarnings: [],
    overview: {
      totalRevenue: 0,
      totalUserSpends: 0,
      totalMatePayout: 0,
      netPlatformProfit: 0,
    },
    recentTransactions: [],
    timeline: [],
  };

  const handleOpenDrawer = (user) => {
    setSelectedUser(user);
    // Micro-timeout allows component mounting before class transition triggers slide-in
    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 20);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Wait for the slide-out animation (300ms) to complete before unmounting
    setTimeout(() => {
      setSelectedUser(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"
            aria-hidden
          />
          <p className="text-sm font-medium text-slate-600">
            Loading financial records…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center">
        <h3 className="text-sm font-bold text-red-900">
          Failed to load financial data
        </h3>
        <p className="mt-1 text-sm text-red-600">
          {error?.message || "Please check your network connection."}
        </p>
      </div>
    );
  }

  const { rechargeSpending, dailyEarnings, overview, recentTransactions, timeline } = stats;

  // Filtered Lists
  const filteredUsers = rechargeSpending.filter(
    (u) =>
      u.userName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.userEmail?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredMates = dailyEarnings.filter((day) => {
    // If search term matches the date itself
    if (day.date.includes(mateSearch)) return true;
    // Or if any call inside this day matches the mate or caller name
    return day.calls.some(
      (c) =>
        c.mateName?.toLowerCase().includes(mateSearch.toLowerCase()) ||
        c.callerName?.toLowerCase().includes(mateSearch.toLowerCase())
    );
  });

  const filteredTx = recentTransactions.filter(
    (tx) =>
      tx.userId?.name?.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.description?.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.source?.toLowerCase().includes(txSearch.toLowerCase())
  );

  const toggleDay = (dateStr) => {
    setExpandedDay((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financials Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Track user recharges, platform billing, Mate payouts, and net profit records.
          </p>
        </div>
        
        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start">
          {[
            { id: "overview", label: "Overview" },
            { id: "users", label: "User Recharges & Spends" },
            { id: "mates", label: "Mate Call Payouts" },
            { id: "transactions", label: "All Receipts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className={chartCardClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Real Revenue
                </span>
              </div>
              <p className="text-xs text-slate-500">Total User Recharges</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                ₹{overview.totalRevenue.toLocaleString()}
              </h3>
            </div>

            <div className={chartCardClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-600/10">
                  <Coins className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  Session Value
                </span>
              </div>
              <p className="text-xs text-slate-500">Total Charged from Users</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                ₹{overview.totalUserSpends.toLocaleString()}
              </h3>
            </div>

            <div className={chartCardClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-600/10">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  Distributed
                </span>
              </div>
              <p className="text-xs text-slate-500">Total Paid to Mates</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                ₹{overview.totalMatePayout.toLocaleString()}
              </h3>
            </div>

            <div className={chartCardClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600/10">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Net Surplus
                </span>
              </div>
              <p className="text-xs text-slate-500">Net Platform Profit</p>
              <h3 className="text-2xl font-bold text-slate-955 mt-1">
                ₹{overview.netPlatformProfit.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* 30-Day Composed Chart */}
          <div className={chartCardClass}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <h3 className={sectionTitleClass}>30-Day Platform Liquidity Timeline</h3>
                <p className="text-xs text-slate-500">Comparing real capital recharges against payout transfers distributed to Mates.</p>
              </div>
            </div>

            <div className="w-full h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timeline}>
                  <defs>
                    <linearGradient id="rechargeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => {
                      const parts = tick.split("-");
                      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : tick;
                    }}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="recharges"
                    name="User Recharges (₹)"
                    fill="url(#rechargeGradient)"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="payouts"
                    name="Mate Payouts (₹)"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- USER RECHARGES TAB --- */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-emerald-600">Total Recharged</th>
                    <th className="px-6 py-4 text-rose-600">Total Spent</th>
                    <th className="px-6 py-4">Current Wallet</th>
                    <th className="px-6 py-4 text-center">Receipts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No transaction records found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{u.userName || "Guest"}</div>
                          <div className="text-xs text-slate-500">{u.userEmail || "No Email"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            u.userRole === "mate" || u.userRole === "mentor"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {u.userRole || "guest"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          ₹{u.totalRecharged.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-rose-600">
                          ₹{u.totalSpent.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900">
                          ₹{u.walletBalance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleOpenDrawer(u)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition px-3 py-2 rounded-xl active:scale-95 border border-indigo-100"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Receipts</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MATE EARNINGS TAB --- */}
      {activeTab === "mates" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by date (DD/MM/YYYY) or user/mate name..."
                value={mateSearch}
                onChange={(e) => setMateSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredMates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
                No Mate Call payout history matches the search query.
              </div>
            ) : (
              filteredMates.map((day) => {
                const isExpanded = expandedDay[day.date];
                return (
                  <div key={day.date} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Collapsible Header */}
                    <div
                      onClick={() => toggleDay(day.date)}
                      className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        <span className="font-bold text-slate-900">{day.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">Mates Earned:</span>
                          <span className="font-bold text-purple-700">₹{day.totalMateEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                          <span className="text-slate-500">Platform Share:</span>
                          <span className="font-bold text-indigo-600">₹{day.totalPlatformEarnings.toLocaleString()}</span>
                        </div>
                        <div className="text-slate-400 ml-2">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="overflow-x-auto border-t border-slate-100">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-3">Mate</th>
                              <th className="px-6 py-3">Caller</th>
                              <th className="px-6 py-3">Session Type</th>
                              <th className="px-6 py-3 text-center">Duration</th>
                              <th className="px-6 py-3 text-right">Total Charge</th>
                              <th className="px-6 py-3 text-right text-purple-600">Mate Earning (60%)</th>
                              <th className="px-6 py-3 text-right text-indigo-600">Platform Share (40%)</th>
                              <th className="px-6 py-3 text-right">Date & Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {day.calls.map((call) => (
                              <tr key={call.transactionId} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                                      {call.mateName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-slate-900">{call.mateName}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-slate-900">{call.callerName}</div>
                                  {call.isFreeSession && (
                                    <div className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 inline-block mt-0.5 uppercase tracking-wider">
                                      Welcome Credits
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                    call.callType === "VIDEO"
                                      ? "bg-blue-50 text-blue-700 border-blue-100"
                                      : call.callType === "CHAT"
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                      : "bg-green-50 text-green-700 border-green-100"
                                  }`}>
                                    {call.callType}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center font-mono font-medium text-slate-800">
                                  {Math.ceil(call.duration / 60)}m
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                  ₹{call.totalAmountDeducted}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-purple-600">
                                  ₹{call.mateShare}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-indigo-600">
                                  ₹{call.platformShare}
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-slate-500 whitespace-nowrap">
                                  {new Date(call.createdAt).toLocaleDateString("en-GB")} {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- ALL RECEIPTS TAB --- */}
      {activeTab === "transactions" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transaction description, source, or name..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Recipient/Payer</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No financial receipts found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredTx.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{tx.userId?.name || "Guest User"}</div>
                          <div className="text-xs text-slate-500 uppercase">{tx.userId?.role || "GUEST"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            tx.source === "RAZORPAY"
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : tx.source === "MOCK_PAYMENT"
                              ? "bg-cyan-50 text-cyan-700 border border-cyan-100"
                              : tx.source === "ADMIN"
                              ? "bg-orange-50 text-orange-700 border border-orange-100"
                              : "bg-slate-50 text-slate-600 border border-slate-100"
                          }`}>
                            {tx.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" title={tx.description}>
                          {tx.description}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {tx.status === "SUCCESS" ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500" />
                            )}
                            <span className="text-xs font-semibold uppercase">{tx.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 text-right font-black ${
                          tx.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- PREMIUM RIGHT SIDE TRANS-DRAWER WITH SLIDE OUT TRANSITIONS --- */}
      {selectedUser && (
        <>
          {/* Backdrop overlay */}
          <div
            className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[999] transition-opacity duration-300 ${
              isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={handleCloseDrawer}
          />
          {/* Slide-out Panel */}
          <div
            className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-200 z-[1000] flex flex-col transition-transform duration-300 ease-in-out ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-snug">
                  {selectedUser.userName || "Guest User"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedUser.userEmail || "No Email"}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-105 text-purple-700 border border-purple-200">
                  {selectedUser.userRole || "guest"}
                </span>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors flex items-center justify-center border border-slate-200 bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Wallet Stat Cards inside Drawer */}
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Recharged</span>
                <span className="font-bold text-emerald-600 text-sm">₹{selectedUser.totalRecharged.toLocaleString()}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Spent</span>
                <span className="font-bold text-rose-600 text-sm">₹{selectedUser.totalSpent.toLocaleString()}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Wallet Bal</span>
                <span className="font-black text-slate-900 text-sm">₹{selectedUser.walletBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Tab switchers in Drawer */}
            <div className="flex border-b border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setDrawerTab("recharges")}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                  drawerTab === "recharges"
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50/20"
                    : "border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                Recharges (Credits)
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab("deductions")}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                  drawerTab === "deductions"
                    ? "border-rose-500 text-rose-700 bg-rose-50/20"
                    : "border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                Deductions (Spends)
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
              {drawerTab === "recharges" ? (
                <div className="space-y-2">
                  {recentTransactions.filter(
                    (tx) =>
                      tx.userId?._id === selectedUser._id &&
                      tx.type === "CREDIT" &&
                      ["RAZORPAY", "ADMIN", "MOCK_PAYMENT"].includes(tx.source)
                  ).length === 0 ? (
                    <div className="text-center text-slate-400 py-12 text-xs italic bg-white rounded-xl border border-slate-200">
                      No recharge influx history found.
                    </div>
                  ) : (
                    recentTransactions
                      .filter(
                        (tx) =>
                          tx.userId?._id === selectedUser._id &&
                          tx.type === "CREDIT" &&
                          ["RAZORPAY", "ADMIN", "MOCK_PAYMENT"].includes(tx.source)
                      )
                      .map((tx) => (
                        <div
                          key={tx._id}
                          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center justify-between text-xs shadow-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                              {tx.source}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(tx.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          <span className="font-black text-emerald-600 text-sm">
                            +₹{tx.amount}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.filter(
                    (tx) =>
                      tx.userId?._id === selectedUser._id &&
                      tx.type === "DEBIT" &&
                      ["CALL", "CHAT"].includes(tx.source)
                  ).length === 0 ? (
                    <div className="text-center text-slate-400 py-12 text-xs italic bg-white rounded-xl border border-slate-200">
                      No session deduction history found.
                    </div>
                  ) : (
                    recentTransactions
                      .filter(
                        (tx) =>
                          tx.userId?._id === selectedUser._id &&
                          tx.type === "DEBIT" &&
                          ["CALL", "CHAT"].includes(tx.source)
                      )
                      .map((tx) => (
                        <div
                          key={tx._id}
                          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center justify-between text-xs gap-3 shadow-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-800 leading-snug">
                              {tx.description}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(tx.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          <span className="font-black text-rose-600 text-sm ml-auto shrink-0">
                            -₹{tx.amount}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Financials;
