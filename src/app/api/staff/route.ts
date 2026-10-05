import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/db";
import { requireStaff, sanitizeStaff, sanitizeUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const staff = await requireStaff(req);
  if (!staff) {
    return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  }

  const db = await readDb();
  const canManagePeople = staff.role === "Admin";
  const canReviewRewards = staff.role === "Admin" || staff.role === "Moderator";
  return NextResponse.json(
    {
      staff: canManagePeople ? db.staff.map(sanitizeStaff) : [],
      users: canReviewRewards ? db.users.map(sanitizeUser) : [],
      rewards: canReviewRewards ? db.rewards : [],
      tokenGrants: canManagePeople ? db.tokenGrants : [],
      books: db.books,
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
