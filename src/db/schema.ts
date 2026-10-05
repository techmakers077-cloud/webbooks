import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Drizzle ORM Schemas for SQLite / Turso compatibility
export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  tokens: integer("tokens").notNull().default(25),
  createdAt: text("created_at").notNull(),
});

export const staffTable = sqliteTable("staff", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("Admin"),
  createdAt: text("created_at").notNull(),
});

export const booksTable = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  tokenCost: integer("token_cost").notNull().default(100),
  coverUrl: text("cover_url").notNull(),
  aspectRatio: text("aspect_ratio").notNull().default("tall"),
  preview: text("preview").notNull(),
  content: text("content").notNull(),
  tags: text("tags").notNull(),
  rating: text("rating").notNull().default("4.9"),
  reads: integer("reads").notNull().default(1200),
  createdAt: text("created_at").notNull(),
});

export const unlocksTable = sqliteTable("unlocks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  bookId: text("book_id").notNull(),
  tokensSpent: integer("tokens_spent").notNull(),
  unlockedAt: text("unlocked_at").notNull(),
});

export const rewardsTable = sqliteTable("rewards", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  amount: integer("amount").notNull(),
  tokensRequested: integer("tokens_requested").notNull(),
  screenshotDataUrl: text("screenshot_data_url").notNull(),
  status: text("status").notNull().default("pending"),
  tokensRewarded: integer("tokens_rewarded"),
  createdAt: text("created_at").notNull(),
  rewardedAt: text("rewarded_at"),
});

// TypeScript Interfaces for Persistent JSON Store (data/db.json)
export interface BookChapter {
  number: number;
  title: string;
  body: string;
}

export interface BookRecord {
  id: string;
  title: string;
  author: string;
  category: string;
  tokenCost: number;
  coverUrl: string;
  aspectRatio: "tall" | "medium" | "portrait" | "compact";
  preview: string;
  content: string;
  chapters: BookChapter[];
  tags: string[];
  rating: number;
  reads: number;
  pages: number;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  tokens: number;
  unlockedBookIds: string[];
  createdAt: string;
}

export interface StaffRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "Admin" | "Moderator" | "Editor";
  createdAt: string;
}

export interface UnlockRecord {
  id: string;
  userId: string;
  bookId: string;
  tokensSpent: number;
  unlockedAt: string;
}

export interface RewardSubmissionRecord {
  id: string;
  userId?: string;
  userEmail?: string;
  targetBookId?: string;
  targetBookTitle?: string;
  fullName: string;
  phone: string;
  amount: number;
  tokensRequested: number;
  screenshotUrl: string;
  status: "pending" | "rewarded";
  tokensCredited?: number;
  createdAt: string;
  rewardedAt?: string;
  rewardedBy?: string;
}

export interface TokenGrantRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  tokens: number;
  reason: string;
  grantedAt: string;
  grantedBy: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  staff: StaffRecord[];
  books: BookRecord[];
  unlocks: UnlockRecord[];
  rewards: RewardSubmissionRecord[];
  tokenGrants: TokenGrantRecord[];
}
