"use client";
//import { Link, useLocation } from "react-router";
//import { useAuth } from "../contexts/AuthContext";
//import { Button } from "./ui/button";
//import { Avatar, AvatarFallback } from "./ui/avatar";
/*
import {
  LayoutDashboard,
  Timer,
  Users,
  Layers,
  Calendar,
  User,
  BookOpen,
  LogOut,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
 */
//import { useTheme } from "next-themes";

import Link from "next/link";
import { useRouter } from "next/navigation";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/timer", label: "Timer" },
  { path: "/rooms", label: "Rooms" },
  { path: "/flashcards", label: "Flashcards" },
  { path: "/exams", label: "Exams" },
  { path: "/ai-assistant", label: "AI Assistant" },
  { path: "/profile", label: "Profile" },
];

const Navbar = () => {
  //const location = useLocation();
  //const { user, logout } = useAuth();
  //const { theme, setTheme } = useTheme();
  const router = useRouter();

  const logout = () => {
    //Logout
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
            {/*<BookOpen className="size-6 text-indigo-600 dark:text-indigo-400" />*/}
          </div>
          <h1 className="text-xl font-semibold">StudyBuddy</h1>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          //const Icon = item.icon;
          //const isActive = location.pathname === item.path;
          const isActive = false;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {/*<Icon className="size-5" />*/}
                <h2>{item.label}</h2>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <button
          className="w-full justify-start"
          //onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {/*theme === "dark" ? (
            <>
              <Sun className="size-5 mr-3" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="size-5 mr-3" />
              Dark Mode
            </>
          )*/}
        </button>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          {/*<Avatar className="size-9">*/}
          <div>
            {/*<AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>*/}
          </div>
          {/*</Avatar>*/}
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">Name</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Email
            </p>
          </div>
        </div>
        <div
          className="cursor-pointer w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={logout}
        >
          Logout
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
