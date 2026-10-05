"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
} from "lucide-react";
import type { BookRecord } from "@/db/schema";

interface BookReaderModalProps {
  book: BookRecord | null;
  onClose: () => void;
}

type ReaderTheme = "paper" | "sepia" | "night";

export default function BookReaderModal({
  book,
  onClose,
}: BookReaderModalProps) {
  const [fontSize, setFontSize] = useState<number>(19);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [theme, setTheme] = useState<ReaderTheme>("paper");

  if (!book) return null;

  const chapters =
    Array.isArray(book.chapters) && book.chapters.length > 0
      ? book.chapters
      : [
          {
            number: 1,
            title: book.title,
            body: book.content || book.preview,
          },
        ];

  const safeIdx = Math.min(activeChapterIdx, chapters.length - 1);
  const currentChapter = chapters[safeIdx];

  const themeStyles: Record<
    ReaderTheme,
    { bg: string; text: string; header: string; muted: string }
  > = {
    paper: {
      bg: "bg-[#FAF9F5]",
      text: "text-neutral-900",
      header: "bg-white/95 border-neutral-200 text-neutral-900",
      muted: "text-neutral-500",
    },
    sepia: {
      bg: "bg-[#F4ECD8]",
      text: "text-[#3B2E1E]",
      header: "bg-[#EFE4C8]/95 border-[#DECFA8] text-[#3B2E1E]",
      muted: "text-[#7A654B]",
    },
    night: {
      bg: "bg-[#121316]",
      text: "text-neutral-100",
      header: "bg-[#1A1C20]/95 border-neutral-800 text-neutral-100",
      muted: "text-neutral-400",
    },
  };

  const activeTheme = themeStyles[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 md:p-6 animate-fadeIn">
      <div
        className={`w-full h-full sm:max-w-5xl sm:h-[92vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-neutral-200/20 ${activeTheme.bg} ${activeTheme.text} transition-colors duration-200`}
      >
        {/* Top Reader Toolbar */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${activeTheme.header}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#E60023] text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base truncate">
                  {book.title}
                </h2>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Unlocked Edition
                </span>
              </div>
              <p className={`text-xs truncate ${activeTheme.muted}`}>
                by {book.author} · {book.category}
              </p>
            </div>
          </div>

          {/* Font Scaling & Theme Controls + AI Companion Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Font Scaling Controls */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 rounded-full p-1 border border-black/10">
              <button
                onClick={() => setFontSize((f) => Math.max(14, f - 2))}
                className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center text-xs font-bold transition"
                title="Decrease font size"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-bold tabular-nums">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize((f) => Math.min(30, f + 2))}
                className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center text-xs font-bold transition"
                title="Increase font size"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Theme Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-black/5 rounded-full p-1 border border-black/10">
              <button
                onClick={() => setTheme("paper")}
                className={`p-1.5 rounded-full transition ${
                  theme === "paper" ? "bg-white text-neutral-900 shadow-xs" : ""
                }`}
                title="Light Paper Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("sepia")}
                className={`p-1.5 rounded-full transition ${
                  theme === "sepia"
                    ? "bg-[#E2D1B0] text-[#3B2E1E] shadow-xs"
                    : ""
                }`}
                title="Warm Sepia Mode"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("night")}
                className={`p-1.5 rounded-full transition ${
                  theme === "night"
                    ? "bg-neutral-800 text-white shadow-xs"
                    : ""
                }`}
                title="Midnight Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Discuss with NVIDIA Nemotron AI Companion */}
            <Link
              href={`/chat?bookId=${encodeURIComponent(book.id)}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Nemotron AI</span>
            </Link>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition"
              aria-label="Close reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chapter Pills Navigation */}
        {chapters.length > 1 && (
          <div className="px-4 sm:px-6 py-2.5 border-b border-black/10 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {chapters.map((ch, idx) => (
              <button
                key={ch.number}
                onClick={() => setActiveChapterIdx(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  idx === safeIdx
                    ? "bg-[#E60023] text-white shadow-xs"
                    : "bg-black/5 hover:bg-black/10"
                }`}
              >
                Chapter {ch.number}: {ch.title}
              </button>
            ))}
          </div>
        )}

        {/* Main Distraction-Free Reading Canvas */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-14 md:px-24 py-10">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 pb-6 border-b border-black/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E60023]">
                Chapter {currentChapter.number} of {chapters.length}
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold mt-2 leading-tight">
                {currentChapter.title}
              </h1>
            </div>

            <article
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.85 }}
              className="font-serif space-y-6"
            >
              {currentChapter.body
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((paragraph, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
            </article>
          </div>
        </div>

        {/* Bottom Chapter Pagination Bar */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-between shrink-0 ${activeTheme.header}`}
        >
          <button
            disabled={safeIdx === 0}
            onClick={() => setActiveChapterIdx((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-black/5 hover:bg-black/10 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Chapter
          </button>

          <span className={`text-xs font-semibold ${activeTheme.muted}`}>
            Page {safeIdx + 1} of {chapters.length}
          </span>

          <button
            disabled={safeIdx >= chapters.length - 1}
            onClick={() =>
              setActiveChapterIdx((i) => Math.min(chapters.length - 1, i + 1))
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#E60023] text-white hover:bg-[#AD081B] disabled:opacity-40 disabled:pointer-events-none transition"
          >
            Next Chapter
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
