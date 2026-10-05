import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, sanitizeUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  return NextResponse.json(
    { user: user ? sanitizeUser(user) : null },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
