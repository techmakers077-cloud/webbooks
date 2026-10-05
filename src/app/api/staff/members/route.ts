import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/db";
import { requireStaff, sanitizeStaff, sanitizeUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { hashPassword } from "@/lib/password";
import type { StaffRecord } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const staff = await requireStaff(req, ["Admin"]);
  if (!staff) {
    return NextResponse.json({ error: "Admin staff access required." }, { status: 403 });
  }
  const db = await readDb();
  return NextResponse.json({
    staff: db.staff.map(sanitizeStaff),
    users: db.users.map(sanitizeUser),
  });
}

export async function POST(req: NextRequest) {
  const staff = await requireStaff(req, ["Admin"]);
  if (!staff) {
    return NextResponse.json({ error: "Admin staff access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const db = await readDb();

    if (body.action === "credit_user" && typeof body.userId === "string") {
      const idx = db.users.findIndex((user) => user.id === body.userId);
      if (idx === -1) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      const delta = Number(body.tokens);
      if (!Number.isFinite(delta) || delta <= 0 || delta > 100_000) {
        return NextResponse.json(
          { error: "Token credit must be between 1 and 100,000." },
          { status: 400 }
        );
      }
      db.users[idx].tokens = (db.users[idx].tokens || 0) + Math.floor(delta);
      await writeDb(db);
      return NextResponse.json({
        user: sanitizeUser(db.users[idx]),
        message: `Credited ${Math.floor(delta)} tokens to ${db.users[idx].name}.`,
      });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const requestedRole = body.role;
    const role: StaffRecord["role"] = ["Admin", "Moderator", "Editor"].includes(
      requestedRole
    )
      ? requestedRole
      : "Moderator";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required to add a staff member." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return NextResponse.json(
        { error: "Enter a valid email address and a password of at least 8 characters." },
        { status: 400 }
      );
    }

    const exists = db.staff.some((member) => member.email.toLowerCase() === email);
    if (exists) {
      return NextResponse.json(
        { error: "A staff member with this email already exists." },
        { status: 409 }
      );
    }

    const newStaff: StaffRecord = {
      id: generateId("staff"),
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      createdAt: new Date().toISOString(),
    };
    db.staff.push(newStaff);
    await writeDb(db);

    return NextResponse.json({
      member: sanitizeStaff(newStaff),
      staff: db.staff.map(sanitizeStaff),
      message: `Added ${newStaff.name} as ${newStaff.role}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to add staff member." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const staff = await requireStaff(req, ["Admin"]);
  if (!staff) {
    return NextResponse.json({ error: "Admin staff access required." }, { status: 403 });
  }

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Staff ID required." }, { status: 400 });
    }

    const db = await readDb();
    const target = db.staff.find((member) => member.id === id);
    if (!target) {
      return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
    }
    if (target.email.toLowerCase() === (process.env.STAFF_ADMIN_EMAIL || "techmakers077@gmail.com").toLowerCase()) {
      return NextResponse.json(
        { error: "The primary admin account cannot be removed." },
        { status: 403 }
      );
    }

    db.staff = db.staff.filter((member) => member.id !== id);
    await writeDb(db);
    return NextResponse.json({
      staff: db.staff.map(sanitizeStaff),
      message: `Removed ${target.name} from staff.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to remove staff member." },
      { status: 500 }
    );
  }
}
