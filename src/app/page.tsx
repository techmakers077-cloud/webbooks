"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Coins,
  ShieldCheck,
  Gift,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Smartphone,
} from "lucide-react";
import Header from "@/components/Header";
import BookCard from "@/components/BookCard";
import BookReaderModal from "@/components/BookReaderModal";
import PaymentModal from "@/components/PaymentModal";
import StaffConsoleModal from "@/components/StaffConsoleModal";
import type { BookRecord } from "@/db/schema";
import { INITIAL_BOOKS } from "@/db/catalog";
import type { PublicUser, PublicStaff } from "@/lib/auth";

type SortMode = "curated" | "tokens-asc" | "rating-desc" | "reads-desc";

export default function HomePage() {
  const [books, setBooks] = useState<BookRecord[]>(INITIAL_BOOKS);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [staff, setStaff] = useState<PublicStaff | null>(null);
  const [pendingRewardsCount, setPendingRewardsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortMode, setSortMode] = useState<SortMode>("curated");
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);

  // Active Modals & Unlocking State
  const [unlockingBookId, setUnlockingBookId] = useState<string | null>(null);
  const [readerBook, setReaderBook] = useState<BookRecord | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentTargetBook, setPaymentTargetBook] = useState<BookRecord | null>(
    null
  );
  const [staffConsoleOpen, setStaffConsoleOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? "" : prev));
    }, 4500);
  };

  const triggerCelebrationConfetti = () => {
    try {
      confetti({
        particleCount: 95,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore in headless environments
    }
  };

  const refreshAllData = useCallback(async () => {
    try {
      const [booksRes, sessionRes, staffRes] = await Promise.all([
        fetch("/api/books"),
        fetch("/api/auth/session"),
        fetch("/api/staff/auth"),
      ]);

      const booksData = await booksRes.json();
      if (Array.isArray(booksData.books)) {
        setBooks(booksData.books);
      }

      const sessionData = await sessionRes.json();
      setUser(sessionData.user || null);

      const staffData = await staffRes.json();
      if (staffData.staff) {
        setStaff(staffData.staff);
        const rewardsRes = await fetch("/api/rewards");
        if (rewardsRes.ok) {
          const rewardsData = await rewardsRes.json();
          if (Array.isArray(rewardsData.rewards)) {
            setPendingRewardsCount(
              rewardsData.rewards.filter((reward: any) => reward.status === "pending").length
            );
          }
        }
      } else {
        setStaff(null);
        setPendingRewardsCount(0);
      }
    } catch (err) {
      console.error("Error loading catalog data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void refreshAllData();
      try {
        const rawSaved = localStorage.getItem("webbooks_saved_pins");
        if (rawSaved) setSavedBookIds(JSON.parse(rawSaved));
      } catch {}
    }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [refreshAllData]);

  const handleToggleSavePin = (bookId: string) => {
    setSavedBookIds((prev) => {
      const exists = prev.includes(bookId);
      const next = exists
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId];
      if (typeof window !== "undefined") {
        localStorage.setItem("webbooks_saved_pins", JSON.stringify(next));
      }
      showToast(
        exists ? "Removed from your Saved Pins." : "📌 Pinned to your Reading List!"
      );
      return next;
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    showToast("Signed out of your reader account.");
  };

  const handleUnlockOrRead = async (book: BookRecord) => {
    const isAlreadyUnlocked = Boolean(
      user?.unlockedBookIds?.includes(book.id)
    );

    if (isAlreadyUnlocked) {
      try {
        const res = await fetch(`/api/books/${encodeURIComponent(book.id)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not open this book.");
        setReaderBook(data.book || book);
      } catch (err: any) {
        showToast(err?.message || "Could not open this book.");
      }
      return;
    }

    const currentTokens = user?.tokens || 0;

    // If user does not have enough tokens, automatically open GPay payment dialog
    if (currentTokens < book.tokenCost) {
      setPaymentTargetBook(book);
      setPaymentModalOpen(true);
      return;
    }

    // User has enough tokens: deduct tokens, record unlock in db, fire confetti, open reader
    setUnlockingBookId(book.id);
    try {
      const res = await fetch(`/api/books/${encodeURIComponent(book.id)}`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.status === 402 || data.code === "INSUFFICIENT_TOKENS") {
        setPaymentTargetBook(book);
        setPaymentModalOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Could not unlock book.");
      }

      if (data.user) {
        setUser(data.user);
      }
      if (data.book) {
        setBooks((prev) =>
          prev.map((b) => (b.id === data.book.id ? data.book : b))
        );
      }

      triggerCelebrationConfetti();
      showToast(
        data.message || `🎉 Unlocked "${book.title}"! Opening reader...`
      );
      setReaderBook(data.book || book);
    } catch (err: any) {
      showToast(err?.message || "Failed to unlock book.");
    } finally {
      setUnlockingBookId(null);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>(["All", "Unlocked", "Saved Pins"]);
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [books]);

  const filteredBooks = useMemo(() => {
    const list = books.filter((book) => {
      if (selectedCategory === "Unlocked") {
        if (!user?.unlockedBookIds?.includes(book.id)) return false;
      } else if (selectedCategory === "Saved Pins") {
        if (!savedBookIds.includes(book.id)) return false;
      } else if (
        selectedCategory !== "All" &&
        book.category !== selectedCategory
      ) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inTitle = book.title.toLowerCase().includes(q);
      const inAuthor = book.author.toLowerCase().includes(q);
      const inCat = book.category.toLowerCase().includes(q);
      const inTags = (book.tags || []).some((t) =>
        t.toLowerCase().includes(q)
      );
      const inCost = `${book.tokenCost}`.includes(q);
      return inTitle || inAuthor || inCat || inTags || inCost;
    });

    if (sortMode === "tokens-asc") {
      return [...list].sort((a, b) => a.tokenCost - b.tokenCost);
    }
    if (sortMode === "rating-desc") {
      return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortMode === "reads-desc") {
      return [...list].sort((a, b) => (b.reads || 0) - (a.reads || 0));
    }
    return list;
  }, [books, selectedCategory, searchQuery, user, savedBookIds, sortMode]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky Pinterest Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={user}
        staff={staff}
        onOpenPayment={() => {
          setPaymentTargetBook(null);
          setPaymentModalOpen(true);
        }}
        onOpenStaffConsole={() => setStaffConsoleOpen(true)}
        onLogout={handleLogout}
        pendingRewardsCount={pendingRewardsCount}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-bold shadow-2xl border border-white/15 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Side Portal for Staff Console */}
      <button
        onClick={() => setStaffConsoleOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-neutral-950 hover:bg-[#E60023] text-white pl-3.5 pr-3 py-3.5 rounded-l-2xl shadow-xl border-y border-l border-white/15 flex flex-col items-center gap-1.5 transition-all group cursor-pointer"
        title="Staff Console Side Portal (techmakers077@gmail.com)"
      >
        <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:text-white transition" />
        <span className="text-[10px] font-extrabold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
          Staff Console
        </span>
        {pendingRewardsCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#E60023] group-hover:bg-white group-hover:text-[#E60023] text-white text-[10px] font-black flex items-center justify-center">
            {pendingRewardsCount}
          </span>
        )}
      </button>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 pt-5 pb-20">
        {/* Welcome / Promo Hero Strip */}
        {!user ? (
          <div className="mb-6 p-5 sm:px-7 sm:py-5 rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-[#E60023] text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/10">
                <Gift className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider">
                    25 Free Welcome Tokens
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold">
                    NVIDIA Nemotron AI Companion
                  </span>
                </div>
                <h2 className="font-extrabold text-base sm:text-lg mt-1">
                  Discover & Unlock Curated Books on the Pinterest Token Library
                </h2>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Sign up for 25 Welcome Tokens, top up anytime via GPay (9500089956), and discuss chapters with NVIDIA Nemotron.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <Link
                href="/signup"
                className="px-4 py-2.5 rounded-full bg-white text-neutral-950 hover:bg-amber-50 font-extrabold text-xs sm:text-sm inline-flex items-center gap-1.5 transition shadow-xs"
              >
                <span>Sign Up (+25 🪙)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/signin"
                className="px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-5 px-5 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-800">
                <Coins className="w-4 h-4 text-amber-500" />
                Balance:{" "}
                <span className="text-[#E60023] font-black">
                  {user.tokens} Tokens
                </span>
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs font-semibold text-neutral-600">
                {user.unlockedBookIds?.length || 0} of {books.length} books
                unlocked
              </span>
              <span className="text-neutral-300 hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-neutral-600 hidden sm:inline-flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-[#E60023]" />
                {savedBookIds.length} saved pins
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/chat"
                className="text-xs font-extrabold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Nemotron AI Chat</span>
              </Link>
              <button
                onClick={() => {
                  setPaymentTargetBook(null);
                  setPaymentModalOpen(true);
                }}
                className="text-xs font-extrabold text-[#E60023] hover:underline cursor-pointer"
              >
                + Deposit Tokens via GPay (9500089956)
              </button>
            </div>
          </div>
        )}

        {/* Filter Pills + Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "bg-[#EFEFEF] hover:bg-[#E2E2E2] text-neutral-800"
                  }`}
                >
                  {cat === "Unlocked"
                    ? `🔓 Unlocked (${user?.unlockedBookIds?.length || 0})`
                    : cat === "Saved Pins"
                    ? `📌 Saved Pins (${savedBookIds.length})`
                    : cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="px-3.5 py-2 rounded-full bg-[#EFEFEF] hover:bg-[#E2E2E2] text-neutral-800 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="curated">Sort: Curated Masonry</option>
              <option value="tokens-asc">Sort: Lowest Tokens First</option>
              <option value="rating-desc">Sort: Highest Rated</option>
              <option value="reads-desc">Sort: Most Popular</option>
            </select>
          </div>
        </div>

        {/* Pinterest Masonry Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-neutral-100 animate-pulse"
              />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-extrabold text-neutral-800">
              No matching books found
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Try clearing your search filter or upload a new manuscript in the Staff Create Engine.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-5 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="masonry-grid">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isUnlocked={Boolean(user?.unlockedBookIds?.includes(book.id))}
                isUnlocking={unlockingBookId === book.id}
                isSaved={savedBookIds.includes(book.id)}
                userTokens={user?.tokens || 0}
                onUnlockOrRead={handleUnlockOrRead}
                onToggleSave={handleToggleSavePin}
                onTagClick={(tag) => setSearchQuery(tag)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Platform Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-8 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E60023] text-white flex items-center justify-center font-bold">
              W
            </div>
            <span className="font-bold text-neutral-900">WebBooks</span>
            <span>· Pinterest-Style Token Book Catalog</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-semibold">
            <button
              type="button"
              onClick={() => {
                setPaymentTargetBook(null);
                setPaymentModalOpen(true);
              }}
              className="hover:text-[#E60023] inline-flex items-center gap-1 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>GPay Deposit: 9500089956</span>
            </button>
            <Link
              href="/chat"
              className="hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>NVIDIA Nemotron Companion</span>
            </Link>
            <button
              type="button"
              onClick={() => setStaffConsoleOpen(true)}
              className="hover:text-neutral-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E60023]" />
              <span>Staff Console</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Distraction-Free Book Reader Modal */}
      <BookReaderModal
        book={readerBook}
        onClose={() => setReaderBook(null)}
      />

      {/* GPay 9500089956 Token Deposit & Screenshot Proof Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        user={user}
        targetBook={paymentTargetBook}
        onSubmitted={(updatedUser) => {
          if (updatedUser) {
            setUser(updatedUser);
          }
          refreshAllData();
          showToast(
            "GPay screenshot submitted! Open Staff Console → Rewards Engine to credit tokens."
          );
        }}
      />

      {/* Staff Console Modal (Rewards Engine, Create Engine, Staff & People) */}
      <StaffConsoleModal
        isOpen={staffConsoleOpen}
        onClose={() => setStaffConsoleOpen(false)}
        staff={staff}
        onStaffAuthChange={(newStaff) => setStaff(newStaff)}
        onDataMutated={(creditedUser) => {
          if (creditedUser) {
            setUser((current) =>
              current?.id === creditedUser.id ? creditedUser : current
            );
          }
          refreshAllData();
        }}
      />
    </div>
  );
}
