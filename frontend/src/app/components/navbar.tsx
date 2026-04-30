"use client";
import axios from "axios";
import { BookOpen } from "lucide-react";
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
  const router = useRouter();

  const logout = async () => {
    await axios.post("/api/auth/logout");
    router.push("/login");
  };

  return (
    <aside className="max-w-2xs w-full bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <BookOpen className="size-6 text-indigo-600" />
          </div>
          <h1 className="text-xl font-semibold">StudyBuddy</h1>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = false;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <h2>{item.label}</h2>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">Name</p>
            <p className="text-xs text-gray-500 truncate">Email</p>
          </div>
        </div>
        <div
          className="cursor-pointer w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          Logout
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
