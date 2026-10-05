"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { BookOpen, Gift, ArrowLeft, Coins } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-200/80 p-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </Link>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            +25 Welcome Tokens
          </span>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#E60023] text-white flex items-center justify-center shadow-md mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900">
            Create your WebBooks account
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Sign up now and receive{" "}
            <span className="font-bold text-neutral-800">25 Welcome Tokens</span>{" "}
            stored in our persistent database.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Nair"
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 4 chars)"
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
            <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Includes 25 free tokens on sign-up—enough to immediately unlock our starter mental-models book!
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#E60023] hover:bg-[#AD081B] text-white font-extrabold text-sm shadow-md transition cursor-pointer"
          >
            {loading
              ? "Creating Account..."
              : "Sign Up & Claim 25 Welcome Tokens"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-neutral-200 text-center text-xs text-neutral-600">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-extrabold text-[#E60023] hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
