import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/db";
import { generateId } from "@/lib/utils";
import { sanitizeUser, setUserSessionCookie } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }
    if (name.length > 100 || email.length > 254) {
      return NextResponse.json(
        { error: "Name or email is too long." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const db = await readDb();
    const existing = db.users.find((user) => user.email.toLowerCase() === email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    const newUser = {
      id: generateId("user"),
      name,
      email,
      passwordHash: hashPassword(password),
      tokens: 25,
      unlockedBookIds: [],
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    await writeDb(db);

    const res = NextResponse.json({
      user: sanitizeUser(newUser),
      message: "Account created! You received 25 Welcome Tokens.",
    });
    setUserSessionCookie(res, newUser.id);
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to register account." },
      { status: 500 }
    );
  }
}
