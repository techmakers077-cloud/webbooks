import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getStore } from "@netlify/blobs";
import type {
  DatabaseSchema,
  BookRecord,
  StaffRecord,
  BookChapter,
} from "./schema";
import { INITIAL_BOOKS } from "./seed-books";
import { hashPassword } from "@/lib/password";

const DB_FILE_PATH = path.join(process.cwd(), "data", "db.json");
const TMP_DB_PATH = "/tmp/webbooks-db.json";
const NETLIFY_STORE_NAME = "webbooks-json-database";
const NETLIFY_DB_KEY = "database.json";
const NETLIFY_PROOF_STORE_NAME = "webbooks-payment-proofs";
const MAX_DB_BYTES = 4 * 1024 * 1024;
const blobSnapshots = new WeakMap<DatabaseSchema, string>();

const adminEmail =
  process.env.STAFF_ADMIN_EMAIL?.trim().toLowerCase() ||
  "techmakers077@gmail.com";
const adminPassword = process.env.STAFF_ADMIN_PASSWORD || "";

export const DEFAULT_STAFF: StaffRecord[] = adminPassword
  ? [
      {
        id: "staff-admin-01",
        name: "Abhishek (Founder & Chief Admin)",
        email: adminEmail,
        passwordHash: hashPassword(adminPassword),
        role: "Admin",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]
  : [];

export const DEFAULT_BOOKS: BookRecord[] = INITIAL_BOOKS;

const INITIAL_DB: DatabaseSchema = {
  users: [],
  staff: DEFAULT_STAFF,
  books: DEFAULT_BOOKS,
  unlocks: [],
  rewards: [],
  tokenGrants: [],
};

let memoryDbCache: DatabaseSchema | null = null;

export class DatabaseWriteConflictError extends Error {
  constructor() {
    super("The database changed during this request. Please retry the operation.");
    this.name = "DatabaseWriteConflictError";
  }
}

function shouldUseNetlifyBlobs(): boolean {
  const configuredStore = process.env.WEBBOOKS_STORAGE?.trim().toLowerCase();
  if (configuredStore === "netlify-blobs") return true;
  if (process.env.NETLIFY === "true" || process.env.NETLIFY_LOCAL === "true") {
    return true;
  }
  if (
    configuredStore === "file" &&
    (process.env.NODE_ENV !== "production" || process.env.ALLOW_EPHEMERAL_FILE_DB === "true")
  ) {
    return false;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Persistent storage is not configured. Set WEBBOOKS_STORAGE=netlify-blobs on Netlify. For an intentional local production run only, set WEBBOOKS_STORAGE=file and ALLOW_EPHEMERAL_FILE_DB=true."
    );
  }
  return false;
}

function normalizeDb(value: Partial<DatabaseSchema> | null | undefined): DatabaseSchema {
  const parsed = value || {};
  const normalizePasswordField = <T extends { passwordHash?: string; password?: string }>(
    record: T
  ) => {
    const { password, ...rest } = record;
    return {
      ...rest,
      // Existing local JSON stores used `password`; retain it as a legacy value so a
      // successful sign-in can migrate it to a scrypt hash.
      passwordHash: record.passwordHash || password || "",
    };
  };

  const staff = Array.isArray(parsed.staff)
    ? parsed.staff.map((member) => normalizePasswordField(member as any))
    : [...DEFAULT_STAFF];
  const primaryAdminExists = staff.some(
    (member) => member.email.toLowerCase() === adminEmail
  );
  if (!primaryAdminExists && DEFAULT_STAFF.length > 0) {
    staff.unshift(DEFAULT_STAFF[0]);
  }

  return {
    users: Array.isArray(parsed.users)
      ? parsed.users
          .filter((user) => user.id !== "user-demo-01")
          .map((user) => normalizePasswordField(user as any))
      : structuredClone(INITIAL_DB.users),
    staff,
    books:
      Array.isArray(parsed.books) && parsed.books.length > 0
        ? parsed.books
        : structuredClone(DEFAULT_BOOKS),
    unlocks: Array.isArray(parsed.unlocks)
      ? parsed.unlocks.filter((unlock) => unlock.userId !== "user-demo-01")
      : structuredClone(INITIAL_DB.unlocks),
    rewards: Array.isArray(parsed.rewards)
      ? parsed.rewards.filter((reward) => reward.id !== "reward-demo-01")
      : structuredClone(INITIAL_DB.rewards),
    tokenGrants: Array.isArray(parsed.tokenGrants)
      ? parsed.tokenGrants
      : structuredClone(INITIAL_DB.tokenGrants),
  } as DatabaseSchema;
}

function readLocalDb(): DatabaseSchema {
  if (memoryDbCache) return structuredClone(memoryDbCache);

  const activePath = fs.existsSync(DB_FILE_PATH)
    ? DB_FILE_PATH
    : fs.existsSync(TMP_DB_PATH)
    ? TMP_DB_PATH
    : DB_FILE_PATH;

  if (!fs.existsSync(activePath)) {
    const db = structuredClone(INITIAL_DB);
    try {
      fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf8");
    } catch {
      fs.mkdirSync(path.dirname(TMP_DB_PATH), { recursive: true });
      fs.writeFileSync(TMP_DB_PATH, JSON.stringify(db, null, 2), "utf8");
    }
    memoryDbCache = db;
    return structuredClone(db);
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(activePath, "utf8"));
    const db = normalizeDb(parsed as Partial<DatabaseSchema>);
    memoryDbCache = db;
    return structuredClone(db);
  } catch (error) {
    console.error("Could not parse the local JSON database.", error);
    throw new Error("The local WebBooks database is invalid JSON.");
  }
}

async function readNetlifyDb(): Promise<DatabaseSchema> {
  const store = getStore(NETLIFY_STORE_NAME, { consistency: "strong" });
  let entry = await store.getWithMetadata(NETLIFY_DB_KEY, {
    type: "json",
    consistency: "strong",
  });

  if (!entry) {
    const initial = structuredClone(INITIAL_DB);
    const result = await store.setJSON(NETLIFY_DB_KEY, initial, { onlyIfNew: true });
    if (result.modified && result.etag) {
      blobSnapshots.set(initial, result.etag);
      return initial;
    }

    entry = await store.getWithMetadata(NETLIFY_DB_KEY, {
      type: "json",
      consistency: "strong",
    });
  }

  if (!entry || !entry.data || typeof entry.data !== "object") {
    throw new Error("Netlify Blobs did not return a valid WebBooks database.");
  }

  if (!entry.etag) {
    throw new Error("Netlify Blobs did not provide an ETag for the database snapshot.");
  }
  const db = normalizeDb(entry.data as Partial<DatabaseSchema>);
  blobSnapshots.set(db, entry.etag);
  return db;
}

export async function readDb(): Promise<DatabaseSchema> {
  return shouldUseNetlifyBlobs() ? readNetlifyDb() : readLocalDb();
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  const serialized = JSON.stringify(data, null, 2);
  const sizeBytes = Buffer.byteLength(serialized, "utf8");
  if (sizeBytes > MAX_DB_BYTES) {
    throw new Error(
      "The WebBooks JSON database has exceeded its 4 MB safety limit. Move large uploads to dedicated object storage before adding more data."
    );
  }

  if (shouldUseNetlifyBlobs()) {
    const store = getStore(NETLIFY_STORE_NAME, { consistency: "strong" });
    const etag = blobSnapshots.get(data);
    const result = await store.setJSON(
      NETLIFY_DB_KEY,
      data,
      etag ? { onlyIfMatch: etag } : { onlyIfNew: true }
    );
    if (!result.modified) {
      throw new DatabaseWriteConflictError();
    }
    if (result.etag) blobSnapshots.set(data, result.etag);
    return;
  }

  memoryDbCache = structuredClone(data);
  const localPath = DB_FILE_PATH;
  try {
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    const tempPath = `${localPath}.tmp`;
    fs.writeFileSync(tempPath, serialized, "utf8");
    fs.renameSync(tempPath, localPath);
  } catch (error) {
    try {
      fs.writeFileSync(TMP_DB_PATH, serialized, "utf8");
    } catch {
      throw new Error(
        `Could not persist the local JSON database: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }
}

export async function persistPaymentProof(
  rewardId: string,
  dataUrl: string
): Promise<string> {
  if (!shouldUseNetlifyBlobs()) return dataUrl;
  const store = getStore(NETLIFY_PROOF_STORE_NAME, { consistency: "strong" });
  await store.set(`proof-${rewardId}`, dataUrl, {
    metadata: { uploadedAt: new Date().toISOString() },
  });
  return `/api/rewards/proof/${encodeURIComponent(rewardId)}`;
}

export async function readPaymentProof(rewardId: string): Promise<string | null> {
  if (!shouldUseNetlifyBlobs()) return null;
  const store = getStore(NETLIFY_PROOF_STORE_NAME, { consistency: "strong" });
  return store.get(`proof-${rewardId}`, {
    type: "text",
    consistency: "strong",
  });
}

export function parseChaptersFromContent(title: string, rawContent: string): BookChapter[] {
  const cleaned = rawContent.trim();
  if (!cleaned) {
    return [
      {
        number: 1,
        title: "Chapter 1: Introduction",
        body: `Welcome to ${title}.`,
      },
    ];
  }

  const sections = cleaned
    .split(/\n(?=#{1,3}\s+|Chapter\s+\d+)/i)
    .map((section) => section.trim())
    .filter(Boolean);

  if (sections.length > 1) {
    return sections.map((section, index) => {
      const lines = section.split("\n");
      const firstLine = lines[0].replace(/^#{1,3}\s*/, "").trim();
      const rest = lines.slice(1).join("\n").trim() || section;
      return {
        number: index + 1,
        title: firstLine.length < 90 ? firstLine : `Chapter ${index + 1}`,
        body: rest,
      };
    });
  }

  const paragraphs = cleaned.split(/\n\s*\n/).filter(Boolean);
  const chapters: BookChapter[] = [];
  let currentBody: string[] = [];
  let currentLen = 0;

  for (const paragraph of paragraphs) {
    currentBody.push(paragraph);
    currentLen += paragraph.length;
    if (currentLen >= 1100) {
      chapters.push({
        number: chapters.length + 1,
        title: `Section ${chapters.length + 1}`,
        body: currentBody.join("\n\n"),
      });
      currentBody = [];
      currentLen = 0;
    }
  }
  if (currentBody.length > 0) {
    chapters.push({
      number: chapters.length + 1,
      title: chapters.length === 0 ? "Full Manuscript" : `Section ${chapters.length + 1}`,
      body: currentBody.join("\n\n"),
    });
  }

  return chapters.length > 0
    ? chapters
    : [{ number: 1, title: "Full Manuscript", body: cleaned }];
}
