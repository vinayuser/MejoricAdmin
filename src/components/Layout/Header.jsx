import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Header = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userData = user || {};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-md">
      {/* Left: Search Bar */}
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full h-9 rounded-md border border-slate-100 bg-slate-50/50 pl-10 pr-12 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-200"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Utilities */}
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 21a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2z" />
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          </svg>
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {/* User Profile Trigger */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-1.5 py-1 rounded-full border border-indigo-100 bg-white hover:bg-slate-50 transition-all shadow-sm"
          >
            <div className="relative">
              {userData?.image ? (
                <img
                  src={userData.image}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 border-2 border-white shadow-sm">
                  {userData?.name?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="hidden sm:flex flex-col items-start pr-2">
              <span className="text-sm font-semibold text-slate-900 leading-tight max-w-[120px] truncate">
                {userData?.name || "mate & mentor ad..."}
              </span>
              <span className="text-xs text-slate-500 leading-tight font-medium">
                Admin
              </span>
            </div>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 mr-1 ${dropdownOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
              {/* Dropdown Header */}
              <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-slate-50/50">
                {userData?.image ? (
                  <img
                    src={userData.image}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover shadow-sm border border-white"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-base font-bold text-slate-400 shadow-sm border border-slate-100">
                    {userData?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {userData?.name || "mate & mentor admin"}
                  </span>
                  <span className="text-xs text-slate-500 truncate mb-1">
                    {userData?.email || "admin.mateandmentors@gmail.c..."}
                  </span>
                  <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-blue-50 text-xs font-bold text-blue-600 uppercase">
                    Admin
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <svg
                    className="h-4 w-4 opacity-60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <svg
                    className="h-4 w-4 opacity-60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Settings
                </Link>

                <div className="my-2 border-t border-slate-50" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
