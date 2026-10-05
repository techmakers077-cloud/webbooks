import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, sanitizeUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: sanitizeUser(user) });
}
