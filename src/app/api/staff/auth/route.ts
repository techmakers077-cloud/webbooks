import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/db";
import {
  getSessionStaff,
  sanitizeStaff,
  STAFF_SESSION_COOKIE,
  clearSessionCookie,
  setStaffSessionCookie,
} from "@/lib/auth";
import { hashPassword, isPasswordHash, verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const staff = await getSessionStaff(req);
  if (!staff) {
    return NextResponse.json({ staff: null }, { status: 401 });
  }
  return NextResponse.json({ staff: sanitizeStaff(staff) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Staff email and password are required." },
        { status: 400 }
      );
    }

    const db = await readDb();
    const staffMember = db.staff.find((member) => member.email.toLowerCase() === email);
    if (!staffMember || !staffMember.passwordHash || !verifyPassword(password, staffMember.passwordHash)) {
      return NextResponse.json(
        {
          error:
            "Invalid Staff Console credentials. Set STAFF_ADMIN_EMAIL and STAFF_ADMIN_PASSWORD in Netlify environment variables, or use an authorized staff account.",
        },
        { status: 401 }
      );
    }

    if (!isPasswordHash(staffMember.passwordHash)) {
      staffMember.passwordHash = hashPassword(password);
      await writeDb(db);
    }

    const res = NextResponse.json({
      staff: sanitizeStaff(staffMember),
      message: `Staff Console unlocked as ${staffMember.name} (${staffMember.role}).`,
    });
    setStaffSessionCookie(res, staffMember.email);
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to authenticate staff." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  clearSessionCookie(res, STAFF_SESSION_COOKIE);
  return res;
}
