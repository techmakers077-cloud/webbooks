"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  BookOpen,
  Coins,
  Sparkles,
  Star,
  Eye,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import type { BookRecord } from "@/db/schema";
import { formatTokens } from "@/lib/utils";

interface BookCardProps {
  book: BookRecord;
  isUnlocked: boolean;
  isUnlocking: boolean;
  isSaved?: boolean;
  userTokens: number;
  onUnlockOrRead: (book: BookRecord) => void;
  onToggleSave?: (bookId: string) => void;
  onTagClick?: (tag: string) => void;
}

const ASPECT_HEIGHTS: Record<string, string> = {
  tall: "h-[360px] sm:h-[395px]",
  portrait: "h-[320px] sm:h-[345px]",
  medium: "h-[275px] sm:h-[295px]",
  compact: "h-[245px] sm:h-[265px]",
};

export default function BookCard({
  book,
  isUnlocked,
  isUnlocking,
  isSaved = false,
  userTokens,
  onUnlockOrRead,
  onToggleSave,
  onTagClick,
}: BookCardProps) {
  const [imgError, setImgError] = useState(false);
  const canAfford = userTokens >= book.tokenCost;
  const heightClass = ASPECT_HEIGHTS[book.aspectRatio] || ASPECT_HEIGHTS.tall;

  return (
    <div className="masonry-item mb-5 break-inside-avoid group">
      <div className="bg-white rounded-[26px] overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col">
        {/* Cover Image Container with Pinterest Hover Overlay */}
        <div
          className={`relative w-full ${heightClass} overflow-hidden bg-neutral-900`}
        >
          {!imgError && book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-rose-950 to-neutral-950 p-6 flex flex-col justify-between text-white">
              <span className="text-xs uppercase tracking-widest text-rose-300 font-bold">
                {book.category}
              </span>
              <div>
                <h4 className="font-serif text-2xl font-bold leading-snug">
                  {book.title}
                </h4>
                <p className="text-xs text-neutral-300 mt-2">
                  by {book.author}
                </p>
              </div>
              <div className="text-[11px] text-neutral-400">
                WebBooks Curated Edition · {book.pages || 220} pages
              </div>
            </div>
          )}

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20 opacity-65 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Top Bar: Category Pill + Token Cost / Unlocked Badge + Save Pin */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
            <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-bold tracking-wide border border-white/15 truncate">
              {book.category}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-md">
                  <Coins className="w-3.5 h-3.5 fill-neutral-950" />
                  {formatTokens(book.tokenCost)}
                </span>
              )}

              {onToggleSave && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(book.id);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-md cursor-pointer ${
                    isSaved
                      ? "bg-[#E60023] text-white"
                      : "bg-black/55 hover:bg-[#E60023] text-white backdrop-blur-md"
                  }`}
                  title={isSaved ? "Saved to Reading List" : "Pin to Reading List"}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${isSaved ? "fill-white" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Hover Preview Overlay (Pinterest-style) */}
          <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex flex-col justify-end">
            <p className="text-white/95 text-xs leading-relaxed line-clamp-3 mb-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              {book.preview}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onUnlockOrRead(book)}
                disabled={isUnlocking}
                className={`flex-1 py-2.5 px-4 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isUnlocked
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : canAfford
                    ? "bg-[#E60023] hover:bg-[#AD081B] text-white"
                    : "bg-white hover:bg-amber-50 text-neutral-900"
                }`}
              >
                {isUnlocking ? (
                  <span>Unlocking...</span>
                ) : isUnlocked ? (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>Read Full Book</span>
                  </>
                ) : canAfford ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Unlock ({book.tokenCost} 🪙)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#E60023]" />
                    <span>Unlock · {book.tokenCost} Tokens</span>
                  </>
                )}
              </button>

              <Link
                href={`/chat?bookId=${encodeURIComponent(book.id)}`}
                className="w-10 h-10 rounded-full bg-white/95 hover:bg-emerald-50 text-neutral-900 flex items-center justify-center shadow-md transition shrink-0"
                title={`Discuss "${book.title}" with NVIDIA Nemotron AI`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card Footer Metadata & Tag Badges */}
        <div className="p-4 flex flex-col gap-2.5">
          <div>
            <h3
              onClick={() => onUnlockOrRead(book)}
              className="font-extrabold text-neutral-900 text-[15px] leading-snug hover:text-[#E60023] transition cursor-pointer line-clamp-2"
            >
              {book.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                {book.author.slice(0, 1).toUpperCase()}
              </div>
              <p className="text-xs font-medium text-neutral-500 truncate">
                {book.author}
              </p>
            </div>
          </div>

          {/* Tag Badges */}
          {Array.isArray(book.tags) && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.tags.slice(0, 4).map((tag, idx) => (
                <button
                  type="button"
                  key={`${book.id}-tag-${idx}`}
                  onClick={() => onTagClick?.(tag)}
                  className="px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-rose-50 hover:text-[#E60023] text-neutral-600 text-[11px] font-semibold transition cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Stats Row */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-neutral-500">
            <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {book.rating || 4.9}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatTokens(book.reads || 1200)}
            </span>
            <span>{book.chapters?.length || 3} ch · {book.pages || 210}p</span>
          </div>
        </div>
      </div>
    </div>
  );
}
