"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  ShieldCheck,
  Coins,
  FileUp,
  Users,
  CheckCircle2,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  LogOut,
  Clock,
  Phone,
  User as UserIcon,
  BookOpen,
} from "lucide-react";
import type { PublicStaff, PublicUser } from "@/lib/auth";
import type { BookRecord, RewardSubmissionRecord } from "@/db/schema";
import { formatDateTime, formatTokens } from "@/lib/utils";

interface StaffConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: PublicStaff | null;
  onStaffAuthChange: (staff: PublicStaff | null) => void;
  onDataMutated: (creditedUser?: PublicUser | null) => void;
}

type ConsoleTab = "rewards" | "create" | "people";

export default function StaffConsoleModal({
  isOpen,
  onClose,
  staff,
  onStaffAuthChange,
  onDataMutated,
}: StaffConsoleModalProps) {
  const [activeTab, setActiveTab] = useState<ConsoleTab>("rewards");

  // Staff Login State
  const [loginEmail, setLoginEmail] = useState("techmakers077@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Console Data State
  const [rewards, setRewards] = useState<RewardSubmissionRecord[]>([]);
  const [staffList, setStaffList] = useState<PublicStaff[]>([]);
  const [usersList, setUsersList] = useState<PublicUser[]>([]);
  const [booksList, setBooksList] = useState<BookRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");

  // Fullscreen Screenshot Lightbox
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    name: string;
    amount: number;
    phone: string;
  } | null>(null);

  // Create Engine State
  const [targetBookId, setTargetBookId] = useState<string>("new");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [rawFileContent, setRawFileContent] = useState<string>("");
  const [bookTitle, setBookTitle] = useState<string>("");
  const [bookAuthor, setBookAuthor] = useState<string>("");
  const [bookCategory, setBookCategory] = useState<string>("AI & Philosophy");
  const [bookTokenCost, setBookTokenCost] = useState<number>(150);
  const [bookCoverUrl, setBookCoverUrl] = useState<string>("");
  const [bookPreview, setBookPreview] = useState<string>("");
  const [bookContent, setBookContent] = useState<string>("");
  const [publishing, setPublishing] = useState<boolean>(false);

  // People Management State
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<
    "Admin" | "Moderator" | "Editor"
  >("Moderator");

  const fetchStaffSnapshot = async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.rewards) setRewards(data.rewards);
      if (data.staff) setStaffList(data.staff);
      if (data.users) setUsersList(data.users);
      if (data.books) setBooksList(data.books);
    } catch (err) {
      console.error("Failed to fetch staff snapshot:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !staff) return;
    const loadSnapshot = window.setTimeout(() => {
      void fetchStaffSnapshot();
    }, 0);
    return () => window.clearTimeout(loadSnapshot);
  }, [isOpen, staff]);

  if (!isOpen) return null;

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/staff/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }
      onStaffAuthChange(data.staff);
      setBannerMsg(data.message || "Staff Console unlocked!");
      fetchStaffSnapshot();
    } catch (err: any) {
      setLoginError(err?.message || "Invalid credentials.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleStaffLogout = async () => {
    await fetch("/api/staff/auth", { method: "DELETE" });
    onStaffAuthChange(null);
    setBannerMsg("");
  };

  // Rewards Engine: One-Click Reward Tokens
  const handleRewardTokens = async (reward: RewardSubmissionRecord) => {
    setBannerMsg("");
    try {
      const res = await fetch("/api/rewards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId: reward.id,
          tokensToReward: reward.tokensRequested || reward.amount || 100,
          staffEmail: staff?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to credit tokens.");
      }
      setBannerMsg(data.message || "Tokens rewarded!");
      await fetchStaffSnapshot();
      onDataMutated(data.creditedUser);
    } catch (err: any) {
      setBannerMsg(err?.message || "Error rewarding tokens.");
    }
  };

  // Create Engine: Auto-extract from uploaded file (.txt, .md, .json, etc.)
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setRawFileContent(text);
      extractMetadataFromText(file.name, text);
    };
    reader.readAsText(file);
  };

  const extractMetadataFromText = (fileName: string, text: string) => {
    const trimmed = text.trim();
    if (fileName.toLowerCase().endsWith(".json")) {
      try {
        const parsed = JSON.parse(trimmed);
        setBookTitle(parsed.title || parsed.name || fileName.replace(/\.json$/i, ""));
        setBookAuthor(parsed.author || "WebBooks Editorial");
        setBookCategory(parsed.category || "AI & Philosophy");
        if (parsed.tokenCost) setBookTokenCost(Number(parsed.tokenCost));
        if (parsed.coverUrl) setBookCoverUrl(parsed.coverUrl);
        setBookPreview(
          parsed.preview ||
            parsed.description ||
            String(parsed.content || "").slice(0, 200)
        );
        setBookContent(
          parsed.content ||
            (Array.isArray(parsed.chapters)
              ? parsed.chapters
                  .map((c: any) => `# ${c.title}\n\n${c.body}`)
                  .join("\n\n")
              : JSON.stringify(parsed, null, 2))
        );
        return;
      } catch {
        // Fallback to plain text parsing
      }
    }

    const lines = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const firstHeading = lines.find((l) => l.startsWith("#"));
    const autoTitle = firstHeading
      ? firstHeading.replace(/^#+\s*/, "").trim()
      : lines[0]?.length < 90
      ? lines[0]
      : fileName.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " ");

    const remaining = lines
      .filter((l) => l !== firstHeading && l !== autoTitle)
      .join(" ");
    const autoPreview =
      remaining.slice(0, 210).trim() + (remaining.length > 210 ? "..." : "");

    setBookTitle(autoTitle || "Untitled Book");
    if (!bookAuthor) setBookAuthor("Abhishek · WebBooks Studio");
    setBookPreview(autoPreview);
    setBookContent(trimmed);
  };

  const handleLoadSampleManuscript = () => {
    const sampleMd = `# The Autonomous Renaissance: Reasoning Models & Creative Craft

Chapter 1: Beyond Static Text
Every generation reinvents the book. What began on clay tablets and parchment scrolls has now evolved into an interactive dialogue between author, reader, and synthetic reasoning companions.

Chapter 2: Micro-Patronage & Token Economics
When readers directly reward creators with tokens for high-signal chapters, shallow clickbait vanishes and enduring literature flourishes.

Chapter 3: The Builder's Library
Curate your mental models with care. Read deeply, question assumptions, and build systems that compound in clarity over decades.`;

    setUploadedFileName("autonomous-renaissance.md");
    setRawFileContent(sampleMd);
    extractMetadataFromText("autonomous-renaissance.md", sampleMd);
    setBannerMsg(
      "Auto-extracted Title, Preview Description, and 3 Chapters from sample .md file!"
    );
  };

  const handlePublishFromCreateEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setBannerMsg("");
    try {
      const res = await fetch("/api/staff/create-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetBookId,
          fileName: uploadedFileName,
          rawFileContent,
          title: bookTitle,
          author: bookAuthor,
          category: bookCategory,
          tokenCost: Number(bookTokenCost),
          coverUrl: bookCoverUrl,
          preview: bookPreview,
          content: bookContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish book.");
      }

      setBannerMsg(data.message || "Book published to live Pinterest feed!");
      setUploadedFileName("");
      setRawFileContent("");
      setBookTitle("");
      setBookPreview("");
      setBookContent("");
      setTargetBookId("new");
      await fetchStaffSnapshot();
      onDataMutated();
    } catch (err: any) {
      setBannerMsg(err?.message || "Failed to publish.");
    } finally {
      setPublishing(false);
    }
  };

  // Staff & People Management
  const handleAddStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerMsg("");
    try {
      const res = await fetch("/api/staff/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStaffName,
          email: newStaffEmail,
          password: newStaffPassword,
          role: newStaffRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add staff member.");
      }
      setBannerMsg(data.message || "Staff member added!");
      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffPassword("");
      await fetchStaffSnapshot();
    } catch (err: any) {
      setBannerMsg(err?.message || "Could not add staff member.");
    }
  };

  const handleRemoveStaff = async (id: string) => {
    try {
      const res = await fetch(`/api/staff/members?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not remove staff member.");
      }
      setBannerMsg(data.message || "Removed staff member.");
      await fetchStaffSnapshot();
    } catch (err: any) {
      setBannerMsg(err?.message || "Error removing staff member.");
    }
  };

  const handleQuickCreditUser = async (userId: string, tokens: number) => {
    try {
      const res = await fetch("/api/staff/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "credit_user",
          userId,
          tokens,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBannerMsg(data.message);
        await fetchStaffSnapshot();
        onDataMutated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Console Header */}
        <div className="bg-neutral-950 text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E60023] flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg tracking-tight">
                  WebBooks Staff Console
                </h2>
                {staff ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                    Unlocked · {staff.role}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                    Locked Portal
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {staff
                  ? `Signed in as ${staff.name} (${staff.email})`
                  : "Authenticate with authorized staff credentials to unlock console"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {staff && (
              <button
                onClick={handleStaffLogout}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-neutral-200 flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Console</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LOCKED STATE: Staff Authentication Portal */}
        {!staff ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto w-full">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-[#E60023] flex items-center justify-center mb-4 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-neutral-900 text-center">
              Staff Portal Authentication
            </h3>
            <p className="text-xs text-neutral-500 text-center mt-1 mb-6">
              Enter your Staff Console email and password to unlock Rewards Engine, Create Engine, and People Management.
            </p>

            <form onSubmit={handleStaffLogin} className="w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Staff Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="techmakers077@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Staff Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 rounded-full bg-[#E60023] hover:bg-[#AD081B] text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                {loggingIn ? "Unlocking Console..." : "Unlock Staff Console"}
              </button>


            </form>
          </div>
        ) : (
          /* UNLOCKED STATE: 3 Engine Tabs */
          <>
            {/* Navigation Tabs */}
            <div className="px-6 pt-3 bg-neutral-100 border-b border-neutral-200 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab("rewards")}
                className={`px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                  activeTab === "rewards"
                    ? "bg-white text-[#E60023] shadow-2xs border-t border-x border-neutral-200"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Rewards Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#E60023] text-[11px] font-extrabold">
                  {rewards.filter((r) => r.status === "pending").length} pending
                </span>
              </button>

              <button
                onClick={() => setActiveTab("create")}
                className={`px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                  activeTab === "create"
                    ? "bg-white text-[#E60023] shadow-2xs border-t border-x border-neutral-200"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>Create Engine (File Upload)</span>
              </button>

              <button
                onClick={() => setActiveTab("people")}
                className={`px-5 py-3 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                  activeTab === "people"
                    ? "bg-white text-[#E60023] shadow-2xs border-t border-x border-neutral-200"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Staff & People ({staffList.length})</span>
              </button>
            </div>

            {bannerMsg && (
              <div className="mx-6 mt-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                <span>{bannerMsg}</span>
                <button
                  onClick={() => setBannerMsg("")}
                  className="text-emerald-600 hover:text-emerald-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Tab Content Area */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingData && rewards.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  Loading Staff Console data...
                </div>
              ) : activeTab === "rewards" ? (
                /* TAB 1: REWARDS ENGINE */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-neutral-900">
                        Incoming GPay Screenshot Submissions (9500089956)
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Click any screenshot thumbnail to inspect full resolution. Click &ldquo;Reward Tokens&rdquo; to immediately credit the reader.
                      </p>
                    </div>
                  </div>

                  {rewards.length === 0 ? (
                    <div className="p-12 rounded-2xl border border-dashed border-neutral-300 text-center text-neutral-500 text-sm">
                      No payment submissions yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rewards.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 hover:bg-white transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            {/* Payment Proof Thumbnail */}
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage({
                                  url: item.screenshotUrl,
                                  name: item.fullName,
                                  amount: item.amount,
                                  phone: item.phone,
                                })
                              }
                              className="relative w-16 h-20 rounded-xl overflow-hidden border border-neutral-300 bg-neutral-900 shrink-0 group cursor-pointer"
                              title="Click to view full resolution screenshot"
                            >
                              <img
                                src={item.screenshotUrl}
                                alt={`Proof from ${item.fullName}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                                <Eye className="w-4 h-4" />
                              </div>
                            </button>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-neutral-900">
                                  {item.fullName}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                  <Phone className="w-3 h-3" />
                                  {item.phone}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
                                  ₹{item.amount} → {item.tokensRequested} Tokens
                                </span>
                              </div>

                              {item.targetBookTitle && (
                                <p className="text-xs text-neutral-600">
                                  Desired Book:{" "}
                                  <span className="font-semibold text-neutral-800">
                                    {item.targetBookTitle}
                                  </span>
                                </p>
                              )}

                              <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDateTime(item.createdAt)}
                                </span>
                                {item.userEmail && (
                                  <span>Account: {item.userEmail}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage({
                                  url: item.screenshotUrl,
                                  name: item.fullName,
                                  amount: item.amount,
                                  phone: item.phone,
                                })
                              }
                              className="px-3 py-2 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Full Proof</span>
                            </button>

                            {item.status === "rewarded" ? (
                              <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Rewarded ({item.tokensCredited || item.tokensRequested} 🪙)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRewardTokens(item)}
                                className="px-4 py-2.5 rounded-full bg-[#E60023] hover:bg-[#AD081B] text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                              >
                                <Coins className="w-3.5 h-3.5" />
                                <span>
                                  Reward {item.tokensRequested} Tokens
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeTab === "create" ? (
                /* TAB 2: CREATE ENGINE ("update anything from a file it goes") */
                <form
                  onSubmit={handlePublishFromCreateEngine}
                  className="space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200">
                    <div>
                      <h3 className="font-extrabold text-base text-neutral-900">
                        Create Engine · File-to-Pinterest Publisher
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Upload any <code className="font-mono">.txt</code>,{" "}
                        <code className="font-mono">.md</code>, or{" "}
                        <code className="font-mono">.json</code> file to auto-extract title, preview, and chapters—or update any existing book.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLoadSampleManuscript}
                      className="px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Load Sample .MD File</span>
                    </button>
                  </div>

                  {/* File Dropzone + Target Book Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="border-2 border-dashed border-neutral-300 hover:border-[#E60023] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-neutral-50/70 transition">
                      <FileUp className="w-8 h-8 text-[#E60023] mb-2" />
                      <span className="text-xs font-extrabold text-neutral-900">
                        {uploadedFileName
                          ? `Loaded: ${uploadedFileName}`
                          : "Upload Document File (.txt, .md, .json)"}
                      </span>
                      <span className="text-[11px] text-neutral-500 mt-1">
                        Auto-extracts Title, Preview Description & Chapters
                      </span>
                      <input
                        type="file"
                        accept=".txt,.md,.markdown,.json,.csv,.html"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Action Mode (Publish New or Update Existing Book)
                        </label>
                        <select
                          value={targetBookId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTargetBookId(val);
                            if (val !== "new") {
                              const found = booksList.find((b) => b.id === val);
                              if (found) {
                                setBookTitle(found.title);
                                setBookAuthor(found.author);
                                setBookCategory(found.category);
                                setBookTokenCost(found.tokenCost);
                                setBookCoverUrl(found.coverUrl);
                                setBookPreview(found.preview);
                                setBookContent(found.content);
                              }
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold"
                        >
                          <option value="new">
                            ✨ Publish as Brand New Book on Feed
                          </option>
                          {booksList.map((b) => (
                            <option key={b.id} value={b.id}>
                              🔄 Update Existing: {b.title} ({b.tokenCost} 🪙)
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-2">
                        &ldquo;Update anything from a file it goes&rdquo; — select any book above and drop a file to overwrite or enrich it live.
                      </p>
                    </div>
                  </div>

                  {/* Extracted Metadata & Custom Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Book Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        placeholder="Auto-extracted or enter title"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Author *
                      </label>
                      <input
                        type="text"
                        value={bookAuthor}
                        onChange={(e) => setBookAuthor(e.target.value)}
                        placeholder="Author Name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Token Cost (🪙) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={bookTokenCost}
                        onChange={(e) =>
                          setBookTokenCost(Number(e.target.value))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={bookCategory}
                        onChange={(e) => setBookCategory(e.target.value)}
                        placeholder="e.g. AI & Philosophy, Design & Aesthetics"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Cover Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={bookCoverUrl}
                        onChange={(e) => setBookCoverUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Preview Description (Shown on Pinterest Hover)
                    </label>
                    <textarea
                      rows={2}
                      value={bookPreview}
                      onChange={(e) => setBookPreview(e.target.value)}
                      placeholder="Short compelling hook auto-extracted from file..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Full Manuscript Content (Chapters auto-segmented)
                    </label>
                    <textarea
                      rows={6}
                      value={bookContent}
                      onChange={(e) => setBookContent(e.target.value)}
                      placeholder="Upload a file above or paste chapters here..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={publishing}
                      className="px-6 py-3 rounded-full bg-[#E60023] hover:bg-[#AD081B] text-white font-extrabold text-sm shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>
                        {publishing
                          ? "Publishing..."
                          : targetBookId === "new"
                          ? "Publish Book to Live Feed"
                          : "Update Selected Book Now"}
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                /* TAB 3: STAFF & PEOPLE MANAGEMENT */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Add & Manage Staff Members */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-base text-neutral-900">
                      Staff & Role Management
                    </h3>
                    <form
                      onSubmit={handleAddStaffMember}
                      className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3"
                    >
                      <div className="text-xs font-bold text-neutral-700">
                        Add New Staff Member
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          required
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          placeholder="Full Name"
                          className="px-3 py-2 rounded-xl border border-neutral-300 text-xs bg-white"
                        />
                        <input
                          type="email"
                          required
                          value={newStaffEmail}
                          onChange={(e) => setNewStaffEmail(e.target.value)}
                          placeholder="Email address"
                          className="px-3 py-2 rounded-xl border border-neutral-300 text-xs bg-white"
                        />
                        <input
                          type="password"
                          required
                          value={newStaffPassword}
                          onChange={(e) => setNewStaffPassword(e.target.value)}
                          placeholder="Password"
                          className="px-3 py-2 rounded-xl border border-neutral-300 text-xs bg-white"
                        />
                        <select
                          value={newStaffRole}
                          onChange={(e) =>
                            setNewStaffRole(
                              e.target.value as "Admin" | "Moderator" | "Editor"
                            )
                          }
                          className="px-3 py-2 rounded-xl border border-neutral-300 text-xs font-bold bg-white"
                        >
                          <option value="Admin">Role: Admin</option>
                          <option value="Moderator">Role: Moderator</option>
                          <option value="Editor">Role: Editor</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Staff Member</span>
                      </button>
                    </form>

                    <div className="space-y-2">
                      {staffList.map((member) => (
                        <div
                          key={member.id}
                          className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3 bg-white"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-neutral-900 truncate">
                                {member.name}
                              </div>
                              <div className="text-[11px] text-neutral-500 truncate">
                                {member.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                member.role === "Admin"
                                  ? "bg-rose-100 text-[#E60023]"
                                  : member.role === "Moderator"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {member.role}
                            </span>
                            {member.email.toLowerCase() !==
                              "techmakers077@gmail.com" && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStaff(member.id)}
                                className="p-1.5 rounded-full text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Remove staff member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Registered Readers & Token Balances */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-base text-neutral-900">
                      Registered Readers ({usersList.length})
                    </h3>
                    <div className="space-y-2.5">
                      {usersList.map((u) => (
                        <div
                          key={u.id}
                          className="p-3.5 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-neutral-900 truncate">
                                {u.name}
                              </div>
                              <div className="text-[11px] text-neutral-500 truncate">
                                {u.email} · {u.unlockedBookIds?.length || 0} books unlocked
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs">
                              {formatTokens(u.tokens)} 🪙
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickCreditUser(u.id, 100)}
                              className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer"
                              title="Grant +100 Bonus Tokens"
                            >
                              +100 🪙
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Full-Resolution Screenshot Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between text-white">
              <div>
                <h4 className="font-bold text-sm">
                  Payment Proof · {lightboxImage.name}
                </h4>
                <p className="text-xs text-neutral-400">
                  Phone: {lightboxImage.phone} · Amount: ₹{lightboxImage.amount}
                </p>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black max-h-[75vh] overflow-auto">
              <img
                src={lightboxImage.url}
                alt="Full Resolution Payment Proof"
                className="max-h-[68vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
