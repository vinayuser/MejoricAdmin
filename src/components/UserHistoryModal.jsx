import React, { useState } from "react";
import {
  X,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  User,
  Video,
} from "lucide-react";
import { useGetQuery } from "../api/apiCall";
import { formatDateTime } from "../utils/formatters";
import Loader from "./UI/Loader";

const UserHistoryModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState("calls");
  const [selectedMateId, setSelectedMateId] = useState("");
  const [callPage, setCallPage] = useState(1);
  const [chatPage, setChatPage] = useState(1);
  const [allCalls, setAllCalls] = useState([]);
  const [allChats, setAllChats] = useState([]);
  const LIMIT = 10;

  // Fetch mates for filter dropdown
  const { data: matesData } = useGetQuery("/users/getAll?role=mate&limit=100", [
    "all-mates",
  ]);
  const mates = matesData?.data?.data || [];

  const {
    data: callData,
    isLoading: callsLoading,
    isFetching: callsFetching,
  } = useGetQuery(
    `/calls/history?userId=${user._id}&page=${callPage}&limit=${LIMIT}${
      selectedMateId ? `&otherPartyId=${selectedMateId}` : ""
    }`,
    ["user-calls", user._id, callPage, selectedMateId],
  );

  const {
    data: chatData,
    isLoading: chatsLoading,
    isFetching: chatsFetching,
  } = useGetQuery(
    `/chat/all-history?userId=${user._id}&page=${chatPage}&limit=${LIMIT}${
      selectedMateId ? `&otherPartyId=${selectedMateId}` : ""
    }`,
    ["user-chats", user._id, chatPage, selectedMateId],
  );

  // Reset lists when filter changes
  React.useEffect(() => {
    setCallPage(1);
    setAllCalls([]);
  }, [selectedMateId]);

  React.useEffect(() => {
    setChatPage(1);
    setAllChats([]);
  }, [selectedMateId]);

  React.useEffect(() => {
    if (callData?.data) {
      if (callPage === 1) {
        setAllCalls(callData.data);
      } else {
        // Only append if we don't already have these IDs to prevent duplication from strict mode or re-renders
        setAllCalls((prev) => {
          const newItems = callData.data.filter(
            (newItem) => !prev.some((item) => item._id === newItem._id),
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [callData, callPage]);

  React.useEffect(() => {
    if (chatData?.data) {
      if (chatPage === 1) {
        setAllChats(chatData.data);
      } else {
        setAllChats((prev) => {
          const newItems = chatData.data.filter(
            (newItem) => !prev.some((item) => item.id === newItem.id),
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [chatData, chatPage]);

  const callsPagination = callData?.pagination || {};
  const chatsPagination = chatData?.pagination || {};

  const hasMoreCalls = callsPagination.currentPage < callsPagination.totalPages;
  const hasMoreChats = chatsPagination.currentPage < chatsPagination.totalPages;

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
        activeTab === id
          ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div
        className="absolute inset-0 bg-slate-900/60 transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p
                className="text-xs text-slate-500 font-mono truncate"
                title={user.email}
              >
                {user.email}
              </p>
            </div>
          </div>
          <div className="group relative">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="pointer-events-none absolute top-full right-0 mt-2 flex flex-col items-end opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-1 group-hover:translate-y-0 z-[70]">
              <span className="whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xl">
                Close
              </span>
            </div>
          </div>
        </div>

        {/* Tabs and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10 px-2">
          <div className="flex">
            <TabButton id="calls" label="Calls" icon={Phone} />
            <TabButton id="chats" label="Chats" icon={MessageSquare} />
          </div>

          <div className="flex items-center gap-2 px-4 py-2 sm:py-0">
            <label
              htmlFor="mate-filter"
              className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
            >
              Filter by Mate:
            </label>
            <select
              id="mate-filter"
              value={selectedMateId}
              onChange={(e) => setSelectedMateId(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all min-w-[160px]"
            >
              <option value="">All Mates</option>
              {mates.map((mate) => (
                <option key={mate._id} value={mate._id}>
                  {mate.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {activeTab === "calls" ? (
            callsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader />
              </div>
            ) : allCalls.length === 0 ? (
              <div className="text-center py-20">
                <Phone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  No call history found for this user.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allCalls.map((call) => (
                  <div
                    key={call._id}
                    className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all hover:border-indigo-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="group relative">
                          <div
                            className={`p-3 rounded-xl ${
                              call.callStatus === "ENDED"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {call.callType === "VIDEO" ? (
                              <Video className="w-5 h-5" />
                            ) : (
                              <Phone className="w-5 h-5" />
                            )}
                          </div>
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-[70]">
                            <span className="whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xl">
                              {call.callType === "VIDEO"
                                ? "Video Call"
                                : "Audio Call"}
                            </span>
                            <div className="h-1 w-2 bg-slate-900 [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                call.callType === "VIDEO"
                                  ? "bg-purple-50 text-purple-600 border-purple-100"
                                  : "bg-blue-50 text-blue-600 border-blue-100"
                              }`}
                            >
                              {call.callType || "AUDIO"}
                            </span>
                            {call.callerId?._id === user._id ? (
                              <>
                                <span className="text-slate-400 font-normal">
                                  Called
                                </span>
                                {call.receiverId?.name || "Unknown"}
                              </>
                            ) : (
                              <>
                                <span className="text-slate-400 font-normal">
                                  Received from
                                </span>
                                {call.callerId?.name || "Unknown"}
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDateTime(call.createdAt)}
                            </span>
                            {call.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.floor(call.duration / 60)}m{" "}
                                {call.duration % 60}s
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            call.callStatus === "ENDED"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {call.callStatus}
                        </span>
                        {call.totalAmountDeducted > 0 && (
                          <div className="mt-2 text-sm font-bold text-indigo-600">
                            ₹{call.totalAmountDeducted.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {hasMoreCalls && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={() => setCallPage((prev) => prev + 1)}
                      disabled={callsFetching}
                      className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-indigo-600 font-semibold hover:bg-indigo-50 hover:border-indigo-200 transition-all disabled:opacity-50"
                    >
                      {callsFetching ? "Loading..." : "Load More Calls"}
                    </button>
                    <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest">
                      Showing {allCalls.length} of{" "}
                      {callsPagination.total ||
                        callsPagination.totalSessions ||
                        0}
                    </p>
                  </div>
                )}
              </div>
            )
          ) : chatsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader />
            </div>
          ) : allChats.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                No chat history found for this user.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allChats.map((chat) => (
                <div
                  key={chat.id}
                  className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all hover:border-indigo-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          Chat with {chat.otherUser?.name || "Unknown"}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(chat.startTime)}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-400">
                            {chat.messageCount || 0} messages
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          chat.status === "ACTIVE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {chat.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {hasMoreChats && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => setChatPage((prev) => prev + 1)}
                    disabled={chatsFetching}
                    className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-indigo-600 font-semibold hover:bg-indigo-50 hover:border-indigo-200 transition-all disabled:opacity-50"
                  >
                    {chatsFetching ? "Loading..." : "Load More Chats"}
                  </button>
                  <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest">
                    Showing {allChats.length} of{" "}
                    {chatsPagination.totalSessions || 0}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default UserHistoryModal;
