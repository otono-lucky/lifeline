import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export const DashboardLayout = ({ children, sidebar = null }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {sidebar && (
        <>
          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow"
          >
            ☰
          </button>

          {/* Sidebar */}
          <div
            className={`${
              showMobileMenu ? "block" : "hidden"
            } md:block fixed md:static ibox-0 md:w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto z-30`}
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-blue-600">Lifeline</h1>
              <p className="text-sm text-gray-600">{user?.role} Dashboard</p>
            </div>
            {sidebar}
          </div>

          {/* Mobile menu overlay */}
          {showMobileMenu && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
              onClick={() => setShowMobileMenu(false)}
            />
          )}
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome, {user?.firstName}!
            </h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
