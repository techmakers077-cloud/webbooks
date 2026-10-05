"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Coins,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  LogOut,
  User as UserIcon,
  BookOpen,
  X,
} from "lucide-react";
import type { PublicUser, PublicStaff } from "@/lib/auth";
import { formatTokens } from "@/lib/utils";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  user: PublicUser | null;
  staff: PublicStaff | null;
  onOpenPayment: () => void;
  onOpenStaffConsole: () => void;
  onLogout: () => void;
  pendingRewardsCount?: number;
}

export default function Header({
  searchQuery,
  onSearchChange,
  user,
  staff,
  onOpenPayment,
  onOpenStaffConsole,
  onLogout,
  pendingRewardsCount = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3 sm:gap-5">
        {/* Brand Logo & Pinterest-style Home Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-full bg-[#E60023] flex items-center justify-center text-white shadow-sm group-hover:bg-[#AD081B] group-hover:scale-105 transition-all">
              <BookOpen className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-neutral-900 leading-none">
                Web<span className="text-[#E60023]">Books</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mt-0.5">
                Token Library
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="hidden md:inline-flex items-center px-4 py-2.5 rounded-full bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition"
          >
            Explore
          </Link>

          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs sm:text-sm transition"
            title="AI Reader Discussion Companion powered by NVIDIA Nemotron"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">Nemotron AI</span>
            <span className="lg:hidden">AI Chat</span>
          </Link>
        </div>

        {/* Pinterest Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search books, authors, categories, or token tags..."
            className="w-full pl-12 pr-10 py-3 rounded-full bg-[#EFEFEF] hover:bg-[#E2E2E2] focus:bg-white text-neutral-900 placeholder-neutral-500 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-neutral-200 border border-transparent focus:border-neutral-300 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-300 hover:bg-neutral-400 text-neutral-700 flex items-center justify-center transition"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Token Pill, GPay Deposit, User Auth, Staff Trigger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Token Balance Pill */}
          <button
            onClick={onOpenPayment}
            className="flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-amber-900 font-bold text-xs sm:text-sm shadow-2xs transition group"
            title="Click to buy tokens via GPay (9500089956)"
          >
            <Coins className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
            <span>{user ? formatTokens(user.tokens) : "0"}</span>
            <span className="hidden sm:inline text-amber-700 font-semibold">
              Tokens
            </span>
            <span className="ml-0.5 px-2 py-0.5 rounded-full bg-[#E60023] text-white text-[11px] font-bold flex items-center gap-1">
              <PlusCircle className="w-3 h-3" />
              <span className="hidden xl:inline">GPay</span>
            </span>
          </button>

          {/* User Session / Sign In & Sign Up */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 pr-2.5 rounded-full border border-neutral-200">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center uppercase">
                {user.name.slice(0, 2)}
              </div>
              <div className="hidden xl:flex flex-col text-left mr-1">
                <span className="text-xs font-bold text-neutral-900 leading-tight max-w-[110px] truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-neutral-500 leading-tight">
                  {user.unlockedBookIds?.length || 0} unlocked
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-full text-neutral-500 hover:text-[#E60023] hover:bg-white transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/signin"
                className="px-3.5 py-2.5 rounded-full bg-[#EFEFEF] hover:bg-[#E2E2E2] text-neutral-900 font-bold text-xs sm:text-sm transition flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Log in</span>
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex px-4 py-2.5 rounded-full bg-[#E60023] hover:bg-[#AD081B] text-white font-bold text-xs sm:text-sm shadow-xs transition"
              >
                Sign up (+25 🪙)
              </Link>
            </div>
          )}

          {/* Staff Console Trigger */}
          <button
            onClick={onOpenStaffConsole}
            className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition border ${
              staff
                ? "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800"
                : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100"
            }`}
            title="Open Staff Console (Rewards Engine, Create Engine & People)"
          >
            <ShieldCheck
              className={`w-4 h-4 ${
                staff ? "text-emerald-400" : "text-[#E60023]"
              }`}
            />
            <span className="hidden md:inline">
              {staff ? "Staff Active" : "Staff"}
            </span>
            {pendingRewardsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#E60023] text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                {pendingRewardsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
