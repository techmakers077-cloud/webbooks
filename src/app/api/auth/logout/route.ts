import { NextResponse } from "next/server";
import { clearSessionCookie, USER_SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  clearSessionCookie(res, USER_SESSION_COOKIE);
  return res;
}
