"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Menu, X } from "lucide-react";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Tableau de bord
        </h1>
        <span className="px-2 py-1 bg-[#007A3D]/10 text-[#007A3D] text-xs rounded-full font-medium">
          2026
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Rechercher..."
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-[#007A3D] outline-none"
                autoFocus
              />
              <button
                onClick={() => setShowSearch(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#CE1126] rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="w-9 h-9 bg-[#007A3D] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
