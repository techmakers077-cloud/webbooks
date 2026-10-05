import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/db";
import type { UserRecord, StaffRecord } from "@/db/schema";

export const USER_SESSION_COOKIE = "webbooks_user_session";
export const STAFF_SESSION_COOKIE = "webbooks_staff_session";

type SessionType = "user" | "staff";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  tokens: number;
  unlockedBookIds: string[];
  createdAt: string;
}

export interface PublicStaff {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Moderator" | "Editor";
  createdAt: string;
}

export function sanitizeUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    tokens: user.tokens,
    unlockedBookIds: user.unlockedBookIds || [],
    createdAt: user.createdAt,
  };
}

export function sanitizeStaff(staff: StaffRecord): PublicStaff {
  return {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    createdAt: staff.createdAt,
  };
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "webbooks-local-development-secret-change-before-deploy";
  }
  throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters.");
}

export function createSessionToken(type: SessionType, subject: string): string {
  const payload = Buffer.from(`${type}\0${subject}`).toString("base64url");
  const signature = createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string | undefined, expectedType: SessionType): string | null {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  try {
    const expectedSignature = createHmac("sha256", getAuthSecret())
      .update(payload)
      .digest("base64url");
    const actual = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return null;
    }

    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const separator = decoded.indexOf("\0");
    if (separator < 1 || decoded.slice(0, separator) !== expectedType) return null;
    return decoded.slice(separator + 1) || null;
  } catch {
    return null;
  }
}

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setUserSessionCookie(response: NextResponse, userId: string): void {
  response.cookies.set(
    USER_SESSION_COOKIE,
    createSessionToken("user", userId),
    sessionCookieOptions(60 * 60 * 24 * 30)
  );
}

export function setStaffSessionCookie(response: NextResponse, email: string): void {
  response.cookies.set(
    STAFF_SESSION_COOKIE,
    createSessionToken("staff", email.toLowerCase()),
    sessionCookieOptions(60 * 60 * 24 * 14)
  );
}

async function readCookie(
  req: NextRequest | undefined,
  cookieName: string
): Promise<string | undefined> {
  if (req) return req.cookies.get(cookieName)?.value;
  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value;
}

export async function getSessionUser(req?: NextRequest): Promise<UserRecord | null> {
  try {
    const userId = verifySessionToken(
      await readCookie(req, USER_SESSION_COOKIE),
      "user"
    );
    if (!userId) return null;
    const db = await readDb();
    return db.users.find((user) => user.id === userId) || null;
  } catch {
    return null;
  }
}

export async function getSessionStaff(req?: NextRequest): Promise<StaffRecord | null> {
  try {
    const email = verifySessionToken(
      await readCookie(req, STAFF_SESSION_COOKIE),
      "staff"
    );
    if (!email) return null;
    const db = await readDb();
    return db.staff.find((staff) => staff.email.toLowerCase() === email) || null;
  } catch {
    return null;
  }
}

export async function requireStaff(
  req: NextRequest,
  allowedRoles?: StaffRecord["role"][]
): Promise<StaffRecord | null> {
  const staff = await getSessionStaff(req);
  if (!staff || (allowedRoles && !allowedRoles.includes(staff.role))) return null;
  return staff;
}

export function clearSessionCookie(
  response: NextResponse,
  cookieName: string
): void {
  response.cookies.set(cookieName, "", {
    ...sessionCookieOptions(0),
    expires: new Date(0),
  });
}
