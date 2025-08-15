import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Mail,
  LogOut,
  Menu,
  Briefcase,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, hasRole } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "MANAGER", "STAFF"],
    },
    {
      name: "Leave Management",
      href: "/leave-management",
      icon: CalendarDays,
      roles: ["ADMIN", "MANAGER", "STAFF"],
    },
    {
      name: "User Management",
      href: "/user-management",
      icon: Users,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Invitation Management",
      href: "/invitation-management",
      icon: Mail,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Department Management",
      href: "/department-management",
      icon: Briefcase,
      roles: ["ADMIN"],
    },
  ];

  // Filter navigation items based on user roles
  const authorizedNavigation = navigation.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="inline-flex items-center p-2 text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Open sidebar</span>
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-[#566f99] ml-2">
                SheCanCode Leave Management
              </span>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={logout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-20 w-64 h-full pt-14 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "sm:translate-x-0"
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {authorizedNavigation.map((item) => {
              const isActive = location.pathname.includes(item.href);
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group",
                      isActive && "bg-gray-100"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900",
                        isActive && "text-[#566f99]"
                      )}
                    />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="p-4 sm:ml-64 pt-20">
        <div className="p-4 rounded-lg">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
