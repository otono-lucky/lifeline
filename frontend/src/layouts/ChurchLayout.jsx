import React, { useState, useMemo } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ALL_CHURCH_NAV_ITEMS = [
  {
    label: "Overview",
    path: "/church",
    exact: true,
    icon: "📊",
    roles: ["ChurchAdmin", "Counselor", "Pastor", "SuperAdmin"],
  },
  {
    label: "Member Directory",
    path: "/church/members",
    icon: "👥",
    roles: ["ChurchAdmin", "Counselor", "Pastor", "SuperAdmin"],
  },
  {
    label: "Vetting Queue",
    path: "/church/vetting",
    icon: "📋",
    roles: ["Counselor", "Pastor", "SuperAdmin"],
  },
  {
    label: "Active Matches",
    path: "/church/matches",
    icon: "💞",
    roles: ["Counselor", "Pastor", "SuperAdmin"],
  },
  {
    label: "Counselor Chats",
    path: "/church/chats",
    icon: "💬",
    roles: ["Counselor", "Pastor", "SuperAdmin"],
  },
  {
    label: "Exit Debriefs",
    path: "/church/debriefs",
    icon: "📝",
    roles: ["Counselor", "Pastor", "SuperAdmin"],
  },
  {
    label: "Counselors",
    path: "/church/counselors",
    icon: "🤝",
    roles: ["ChurchAdmin", "SuperAdmin"],
  },
  {
    label: "Parish Settings",
    path: "/church/settings",
    icon: "⚙️",
    roles: ["ChurchAdmin", "SuperAdmin"],
  },
];

export const ChurchLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = useMemo(() => {
    const role = user?.role || "";
    return ALL_CHURCH_NAV_ITEMS.filter((item) => item.roles.includes(role));
  }, [user?.role]);

  const getRoleBadge = (role) => {
    switch (role) {
      case "Pastor":
        return { label: "Senior Pastor / Overseer", bg: "bg-amber-100 text-amber-800" };
      case "ChurchAdmin":
        return { label: "Church Administrator", bg: "bg-blue-100 text-blue-800" };
      case "Counselor":
        return { label: "Operational Counselor", bg: "bg-emerald-100 text-emerald-800" };
      default:
        return { label: role || "Staff", bg: "bg-gray-100 text-gray-800" };
    }
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow border border-gray-200"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          showMobileMenu ? "block" : "hidden"
        } md:flex flex-col fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕊️</span>
            <div>
              <h1 className="text-xl font-bold text-blue-600 leading-tight">Lifeline</h1>
              <p className="text-xs font-semibold text-gray-400 tracking-wide uppercase">Church Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer badge */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {user?.firstName?.[0] || "C"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadge.bg}`}
            >
              {roleBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ChurchLayout;
