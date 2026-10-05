"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Cpu,
  ListChecks,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import type { BookRecord } from "@/db/schema";
import { INITIAL_BOOKS } from "@/db/catalog";

const DEFAULT_NEMOTRON_MODELS = [
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    label: "NVIDIA Nemotron 3 Nano 30B A3B (Free)",
  },
  {
    id: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    label: "NVIDIA Llama 3.3 Nemotron Super 49B (Free)",
  },
  {
    id: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    label: "NVIDIA Llama 3.1 Nemotron Ultra 253B (Free)",
  },
  {
    id: "nvidia/nemotron-nano-9b-v2:free",
    label: "NVIDIA Nemotron Nano 9B v2 (Free)",
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    label: "NVIDIA Nemotron 3.5 Lightning (Free)",
  },
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    label: "NVIDIA Llama 3.1 Nemotron 70B Instruct",
  },
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
}

function ChatCompanionInner() {
  const searchParams = useSearchParams();
  const initialBookId =
    searchParams.get("bookId") || INITIAL_BOOKS[0]?.id || "";

  const [books, setBooks] = useState<BookRecord[]>(INITIAL_BOOKS);
  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId);
  const nemotronModels = DEFAULT_NEMOTRON_MODELS;
  const [selectedModel, setSelectedModel] = useState<string>(
    DEFAULT_NEMOTRON_MODELS[0].id
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Welcome to the **WebBooks AI Reader Discussion Companion**, powered exclusively by **NVIDIA Nemotron** via OpenRouter.\n\nSelect any book from the catalog on the left, or click a quick-prompt below for in-depth chapter summaries, Socratic Q&A, and thematic discussions.",
      modelUsed: "NVIDIA Nemotron",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.books) && data.books.length > 0) {
          setBooks(data.books);
          if (!searchParams.get("bookId")) {
            setSelectedBookId(data.books[0].id);
          }
        }
      })
      .catch(console.error);

  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const activeBook =
    books.find((b) => b.id === selectedBookId) || books[0] || null;

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: activeBook?.id,
          model: selectedModel,
          messages: updatedHistory.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "NVIDIA Nemotron could not answer right now.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply || "I could not generate a response. Please try again.",
          modelUsed: data.model || data.provider || selectedModel,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `Could not complete request: ${err?.message || "Unknown error"}`,
          modelUsed: selectedModel,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pinterest Feed</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-neutral-900 leading-tight">
                AI Reader Discussion Companion
              </h1>
              <p className="text-[11px] font-semibold text-emerald-700">
                Powered Exclusively by NVIDIA Nemotron (OpenRouter)
              </p>
            </div>
          </div>
        </div>

        {/* NVIDIA Nemotron Model Selector */}
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600 hidden sm:inline" />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold focus:outline-none max-w-[240px] sm:max-w-none truncate"
          >
            {nemotronModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Split View: Left Book Context Sidebar + Right Chat Stream */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6">
        {/* Left Sidebar: Book Selector & Chapter Outline */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
                Select Book to Discuss
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-neutral-300 text-xs sm:text-sm font-bold bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[#E60023]"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.author}
                  </option>
                ))}
              </select>
            </div>

            {activeBook && (
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="flex items-start gap-3">
                  <img
                    src={activeBook.coverUrl}
                    alt={activeBook.title}
                    className="w-16 h-22 object-cover rounded-xl border border-neutral-200 shrink-0"
                  />
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E60023] text-[10px] font-extrabold">
                      {activeBook.category}
                    </span>
                    <h3 className="font-bold text-sm text-neutral-900 mt-1 leading-snug">
                      {activeBook.title}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      by {activeBook.author}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {activeBook.preview}
                </p>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                    Chapters in Context ({activeBook.chapters?.length || 0})
                  </div>
                  {(activeBook.chapters || []).map((ch) => (
                    <button
                      key={ch.number}
                      type="button"
                      onClick={() =>
                        sendPrompt(
                          `Analyze Chapter ${ch.number}: "${ch.title}" of "${activeBook.title}" and explain its core insights.`
                        )
                      }
                      className="w-full text-left px-3 py-2 rounded-xl bg-neutral-50 hover:bg-emerald-50 hover:text-emerald-900 border border-neutral-200/70 text-xs font-semibold transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="truncate">
                        Ch {ch.number}: {ch.title}
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Column: Chat Conversation & Quick Prompts */}
        <section className="lg:col-span-8 bg-white rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col h-[78vh]">
          {/* Quick Discussion Prompts Bar */}
          <div className="p-3.5 border-b border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() =>
                sendPrompt(
                  `Give me an in-depth executive summary of "${
                    activeBook?.title || "this book"
                  }" with key takeaways from each chapter.`
                )
              }
              className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
              <span>Summarize All Chapters</span>
            </button>

            <button
              type="button"
              onClick={() =>
                sendPrompt(
                  `What are the 3 most counter-intuitive mental models or arguments in "${
                    activeBook?.title || "this book"
                  }"?`
                )
              }
              className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Core Mental Models</span>
            </button>

            <button
              type="button"
              onClick={() =>
                sendPrompt(
                  `Ask me 3 Socratic discussion questions to test my understanding of "${
                    activeBook?.title || "this book"
                  }".`
                )
              }
              className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Chapter Q&A Quiz</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#E60023] text-white font-medium rounded-br-xs"
                      : "bg-neutral-100 text-neutral-900 rounded-bl-xs border border-neutral-200/70"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>{msg.modelUsed || "NVIDIA Nemotron"}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-3xl px-5 py-3.5 bg-neutral-100 text-neutral-600 text-xs font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>NVIDIA Nemotron is reasoning...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt(input);
            }}
            className="p-4 border-t border-neutral-200 flex items-center gap-2.5 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask NVIDIA Nemotron anything about "${
                activeBook?.title || "your book"
              }"...`}
              className="flex-1 px-4 py-3 rounded-full bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Ask Nemotron</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm font-bold text-neutral-500">
          Loading NVIDIA Nemotron Reader Companion...
        </div>
      }
    >
      <ChatCompanionInner />
    </Suspense>
  );
}
