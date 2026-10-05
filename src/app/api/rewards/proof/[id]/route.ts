import { NextRequest, NextResponse } from "next/server";
import { readDb, readPaymentProof } from "@/db";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff(req, ["Admin", "Moderator"]);
  if (!staff) {
    return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  }

  const { id } = await params;
  const db = await readDb();
  const reward = db.rewards.find((item) => item.id === id);
  if (!reward) {
    return NextResponse.json({ error: "Payment proof not found." }, { status: 404 });
  }

  const dataUrl = reward.screenshotUrl.startsWith("/api/rewards/proof/")
    ? await readPaymentProof(id)
    : reward.screenshotUrl;
  const match = dataUrl?.match(/^data:(image\/[a-zA-Z0-9.+-]+)(;base64)?,([\s\S]*)$/);
  if (!match) {
    return NextResponse.json({ error: "Payment proof is unavailable." }, { status: 404 });
  }

  try {
    const contentType = match[1].toLowerCase();
    const bytes = match[2]
      ? Buffer.from(match[3], "base64")
      : Buffer.from(decodeURIComponent(match[3]), "utf8");
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return NextResponse.json({ error: "Payment proof is invalid." }, { status: 422 });
  }
}
