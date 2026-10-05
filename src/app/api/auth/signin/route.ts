import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/db";
import { sanitizeUser, setUserSessionCookie } from "@/lib/auth";
import { hashPassword, isPasswordHash, verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter both email and password." },
        { status: 400 }
      );
    }

    const db = await readDb();
    const user = db.users.find((candidate) => candidate.email.toLowerCase() === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    // Upgrade legacy plaintext credentials during successful sign-in.
    if (!isPasswordHash(user.passwordHash)) {
      user.passwordHash = hashPassword(password);
      await writeDb(db);
    }

    const res = NextResponse.json({
      user: sanitizeUser(user),
      message: `Welcome back, ${user.name}!`,
    });
    setUserSessionCookie(res, user.id);
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to sign in." },
      { status: 500 }
    );
  }
}
