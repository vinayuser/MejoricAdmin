import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const userData = user || {};

  const menuSections = [
    {
      title: "General",
      items: [
        { name: "Dashboard", path: "/", icon: <DashboardIcon /> },
        { name: "Profile", path: "/profile", icon: <ProfileIcon /> },
        { name: "Users", path: "/users", icon: <UsersIcon /> },
        { name: "Financials", path: "/financials", icon: <FinancialsIcon /> },
      ],
    },
    {
      title: "Content",
      items: [
        { name: "Mates", path: "/mates", icon: <MatesIcon /> },
        { name: "Mentors", path: "/mentors", icon: <MentorsIcon /> },
        { name: "Gallery", path: "/gallery", icon: <GalleryIcon /> },
      ],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-100 bg-white lg:block">
      <div className="flex h-full flex-col">
        {/* Workspace Switcher Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3L4 9v12h16V9l-8-6z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 leading-tight">Admin Console</span>
              <span className="text-xs text-slate-500 font-medium">Mate & Mentors</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-3 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                {section.title}
              </h3>
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === "/mentors" &&
                    location.pathname.startsWith("/mentor"));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-all ${
                      isActive
                        ? "bg-slate-100 text-slate-900 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className={`${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"}`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 px-2 py-1.5">
            {userData?.image ? (
              <img src={userData.image} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                {userData?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="truncate text-base font-bold text-slate-900">{userData?.name || "Admin"}</span>
              <span className="truncate text-xs text-slate-500 capitalize">{userData?.role || "Administrator"}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Sub-components for icons to keep it clean
const DashboardIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MatesIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MentorsIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const GalleryIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const FinancialsIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

export default Sidebar;
