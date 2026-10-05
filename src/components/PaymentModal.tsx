"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Upload,
  Coins,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { BookRecord } from "@/db/schema";
import type { PublicUser } from "@/lib/auth";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PublicUser | null;
  targetBook: BookRecord | null;
  onSubmitted: (updatedUser?: PublicUser | null) => void;
}

const GPAY_NUMBER = process.env.NEXT_PUBLIC_GPAY_NUMBER || "9500089956";

const TOKEN_PACKAGES = [
  { tokens: 100, amount: 100, label: "Starter Pack" },
  { tokens: 150, amount: 150, label: "Reader Pack" },
  { tokens: 200, amount: 200, label: "Popular Pack" },
  { tokens: 350, amount: 350, label: "Collector Pack" },
];

function generateReceiptSvgDataUrl(name: string, phone: string, amount: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="680" viewBox="0 0 480 680">
    <rect width="480" height="680" rx="24" fill="#f8fafc"/>
    <rect width="480" height="200" rx="24" fill="#1a73e8"/>
    <circle cx="240" cy="85" r="34" fill="#22c55e"/>
    <path d="M225 85 l10 10 l22 -22" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
    <text x="240" y="150" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="bold">GPay Transfer Completed</text>
    <text x="240" y="178" text-anchor="middle" fill="#dbeafe" font-family="sans-serif" font-size="13">To: 9500089956 (WebBooks Token Vault)</text>
    <rect x="32" y="225" width="416" height="410" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <text x="240" y="285" text-anchor="middle" fill="#0f172a" font-family="sans-serif" font-size="42" font-weight="bold">₹${amount}.00</text>
    <text x="240" y="315" text-anchor="middle" fill="#16a34a" font-family="sans-serif" font-size="14" font-weight="bold">+${amount} WebBooks Tokens</text>
    <line x1="60" y1="345" x2="420" y2="345" stroke="#e2e8f0" stroke-width="1.5"/>
    <text x="60" y="385" fill="#64748b" font-family="sans-serif" font-size="14">GPay Recipient</text>
    <text x="420" y="385" text-anchor="end" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">9500089956</text>
    <text x="60" y="425" fill="#64748b" font-family="sans-serif" font-size="14">Sender Name</text>
    <text x="420" y="425" text-anchor="end" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">${
      name || "WebBooks Reader"
    }</text>
    <text x="60" y="465" fill="#64748b" font-family="sans-serif" font-size="14">Sender Phone</text>
    <text x="420" y="465" text-anchor="end" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">${
      phone || "9800000000"
    }</text>
    <text x="60" y="505" fill="#64748b" font-family="sans-serif" font-size="14">Timestamp</text>
    <text x="420" y="505" text-anchor="end" fill="#0f172a" font-family="sans-serif" font-size="13">${new Date().toLocaleTimeString()}</text>
    <rect x="120" y="555" width="240" height="40" rx="20" fill="#f0fdf4" stroke="#bbf7d0"/>
    <text x="240" y="580" text-anchor="middle" fill="#15803d" font-family="sans-serif" font-size="13" font-weight="bold">✓ UPI Verified Proof</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function PaymentModal({
  isOpen,
  onClose,
  user,
  targetBook,
  onSubmitted,
}: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number>(150);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>("");
  const [screenshotFileName, setScreenshotFileName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const syncName = window.setTimeout(() => {
      if (user?.name && !fullName) setFullName(user.name);
    }, 0);
    return () => window.clearTimeout(syncName);
  }, [user, fullName]);

  useEffect(() => {
    const syncAmount = window.setTimeout(() => {
      if (!targetBook) return;
      const deficit = Math.max(100, targetBook.tokenCost - (user?.tokens || 0));
      const suggestedAmount =
        deficit <= 100 ? 100 : deficit <= 150 ? 150 : deficit <= 200 ? 200 : 350;
      if (amount !== suggestedAmount) setAmount(suggestedAmount);
    }, 0);
    return () => window.clearTimeout(syncAmount);
  }, [targetBook, user, amount]);

  if (!isOpen) return null;

  const handleCopyGPay = () => {
    navigator.clipboard.writeText(GPAY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for your payment screenshot.");
      e.target.value = "";
      return;
    }

    setScreenshotFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1280;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          setError("Could not read that screenshot. Please choose another image.");
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.68);
        if (compressed.length > 500_000) {
          setError("That image is still too large. Please choose a smaller screenshot.");
          return;
        }
        setScreenshotDataUrl(compressed);
      };
      image.onerror = () => setError("Could not read that screenshot. Please choose another image.");
      image.src = reader.result;
    };
    reader.onerror = () => setError("Could not read that screenshot. Please choose another image.");
    reader.readAsDataURL(file);
  };

  const handleUseGeneratedReceipt = () => {
    const sampleUrl = generateReceiptSvgDataUrl(
      fullName || user?.name || "Reader",
      phone || "9876543210",
      amount
    );
    setScreenshotDataUrl(sampleUrl);
    setScreenshotFileName(`gpay-receipt-${amount}-tokens.svg`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!fullName.trim() || !phone.trim()) {
      setError("Please fill in your Full Name and Phone Number.");
      return;
    }

    const finalScreenshot =
      screenshotDataUrl ||
      generateReceiptSvgDataUrl(fullName.trim(), phone.trim(), amount);

    setSubmitting(true);
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetBookId: targetBook?.id,
          targetBookTitle: targetBook?.title,
          fullName: fullName.trim(),
          phone: phone.trim(),
          amount: Number(amount),
          tokensRequested: Number(amount),
          screenshotUrl: finalScreenshot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit payment proof.");
      }

      setSuccessMsg(
        data.message ||
          "Payment proof sent to Staff Rewards Engine! Open Staff Console to approve tokens."
      );
      onSubmitted(data.user);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#E60023] via-[#C9051E] to-neutral-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-1.5">
            <Coins className="w-4 h-4" />
            <span>GPay Token Deposit</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Top Up WebBooks Tokens
          </h2>
          {targetBook ? (
            <p className="text-xs sm:text-sm text-rose-100 mt-1">
              Unlock <span className="font-bold underline">{targetBook.title}</span>{" "}
              ({targetBook.tokenCost} Tokens required · Your balance:{" "}
              {user?.tokens || 0} Tokens)
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-rose-100 mt-1">
              Instant GPay transfer & screenshot verification via our Staff Rewards Engine.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Step 1: GPay Number Copy Box */}
          <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                  Step 1 · Send GPay Payment To
                </span>
                <div className="text-xl font-black text-neutral-900 tracking-wide font-mono">
                  {GPAY_NUMBER}
                </div>
                <span className="text-xs text-neutral-600">
                  1 ₹ = 1 WebBooks Token · Instant Staff Verification
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyGPay}
              className={`px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-xs cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-900 hover:bg-neutral-800 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied {GPAY_NUMBER}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy GPay Number</span>
                </>
              )}
            </button>
          </div>

          {/* Token Package Selector */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
              Select Token Package or Enter Amount
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TOKEN_PACKAGES.map((pkg) => (
                <button
                  type="button"
                  key={pkg.tokens}
                  onClick={() => setAmount(pkg.amount)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    amount === pkg.amount
                      ? "border-[#E60023] bg-rose-50/70 ring-2 ring-[#E60023]/20"
                      : "border-neutral-200 hover:border-neutral-300 bg-neutral-50/50"
                  }`}
                >
                  <div className="flex items-center gap-1 font-extrabold text-neutral-900 text-sm">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    {pkg.tokens}
                  </div>
                  <div className="text-[11px] font-bold text-[#E60023] mt-0.5">
                    ₹{pkg.amount}
                  </div>
                  <div className="text-[10px] text-neutral-500">{pkg.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* User Details Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Amount (₹ / Tokens) *
              </label>
              <input
                type="number"
                min={10}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E60023]"
              />
            </div>
          </div>

          {/* Screenshot Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                Upload GPay Payment Screenshot *
              </label>
              <button
                type="button"
                onClick={handleUseGeneratedReceipt}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Attach Sample GPay Receipt
              </button>
            </div>

            <div className="border-2 border-dashed border-neutral-300 hover:border-[#E60023] rounded-2xl p-4 text-center transition bg-neutral-50/60">
              {screenshotDataUrl ? (
                <div className="flex items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={screenshotDataUrl}
                      alt="GPay Proof Preview"
                      className="w-14 h-16 object-cover rounded-xl border border-neutral-300 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-700 truncate">
                        ✓ Screenshot Attached
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {screenshotFileName || "payment-proof.png"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotDataUrl("");
                      setScreenshotFileName("");
                    }}
                    className="px-3 py-1.5 rounded-full bg-neutral-200 hover:bg-neutral-300 text-xs font-bold text-neutral-700 shrink-0"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-3">
                  <Upload className="w-7 h-7 text-neutral-400 mb-1.5" />
                  <span className="text-xs font-bold text-neutral-800">
                    Click to upload GPay screenshot (.png, .jpg, .webp)
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5">
                    Routed directly to Staff Console → Rewards Engine
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2">
              <span>{successMsg}</span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0"
              >
                Done
              </button>
            </div>
          )}

          {/* Submit Footer */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified by Staff Rewards Engine</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-full bg-[#E60023] hover:bg-[#AD081B] text-white font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? "Submitting Proof..."
                : `Submit Proof for ${amount} Tokens`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
