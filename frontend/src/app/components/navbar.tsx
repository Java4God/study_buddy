"use client";
import axios from "axios";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pages, Api } from "@/app/routes";

const navItems = [
  { path: Pages.DASHBOARD, label: "Dashboard" },
  { path: Pages.TIMER, label: "Timer" },
  { path: Pages.ROOMS, label: "Rooms" },
  { path: Pages.FLASHCARDS, label: "Flashcards" },
  { path: Pages.EXAMS, label: "Exams" },
  { path: Pages.ASSISTANT, label: "AI Assistant" },
  { path: Pages.PROFILE_ME, label: "Profile" },
];

const Navbar = () => {
  const router = useRouter();

  const logout = async () => {
    await axios.post(`${Api.AUTH}/logout`);
    router.push(Pages.LOGIN);
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

      <div className="p-6 border-t border-gray-200 space-y-3 mb-4">
        <div
          className="cursor-pointer w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-xl"
          onClick={logout}
        >
          Logout
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
