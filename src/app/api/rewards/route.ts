import { NextRequest, NextResponse } from "next/server";
import { persistPaymentProof, readDb, writeDb } from "@/db";
import { getSessionUser, requireStaff, sanitizeUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import type { RewardSubmissionRecord } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const staff = await requireStaff(req, ["Admin", "Moderator"]);
  if (!staff) {
    return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  }
  const db = await readDb();
  return NextResponse.json(
    { rewards: db.rewards },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Create an account or sign in before submitting a token deposit.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const amount = Number(body.amount ?? 100);
    const tokensRequested = Number(body.tokensRequested ?? amount);
    const screenshotUrl =
      typeof body.screenshotUrl === "string" ? body.screenshotUrl.trim() : "";

    if (!sessionUser.name || !phone) {
      return NextResponse.json(
        { error: "Please provide the phone number used for your GPay payment." },
        { status: 400 }
      );
    }
    if (!/^\+?[0-9\s-]{8,20}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }
    if (
      !Number.isInteger(amount) ||
      !Number.isInteger(tokensRequested) ||
      amount < 1 ||
      tokensRequested < 1 ||
      amount > 100_000 ||
      tokensRequested > 100_000
    ) {
      return NextResponse.json(
        { error: "Enter a valid payment amount and token request." },
        { status: 400 }
      );
    }
    if (!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(screenshotUrl)) {
      return NextResponse.json(
        { error: "Please upload a valid JPG, PNG, or WebP GPay payment screenshot." },
        { status: 400 }
      );
    }
    if (Buffer.byteLength(screenshotUrl, "utf8") > 512_000) {
      return NextResponse.json(
        { error: "Screenshot must be smaller than 375 KB. Please compress it and try again." },
        { status: 413 }
      );
    }

    const db = await readDb();
    const linkedUser = db.users.find((candidate) => candidate.id === sessionUser.id);
    if (!linkedUser) {
      return NextResponse.json(
        { error: "Your account is no longer available. Please sign in again.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const rewardId = generateId("reward");
    const storedScreenshotUrl = await persistPaymentProof(rewardId, screenshotUrl);
    const newSubmission: RewardSubmissionRecord = {
      id: rewardId,
      userId: linkedUser.id,
      userEmail: linkedUser.email,
      targetBookId: typeof body.targetBookId === "string" ? body.targetBookId : undefined,
      targetBookTitle:
        typeof body.targetBookTitle === "string" ? body.targetBookTitle : undefined,
      fullName: linkedUser.name,
      phone,
      amount: Math.floor(amount),
      tokensRequested: Math.floor(tokensRequested),
      screenshotUrl: storedScreenshotUrl,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    db.rewards.unshift(newSubmission);
    await writeDb(db);

    const res = NextResponse.json({
      reward: newSubmission,
      user: sanitizeUser(linkedUser),
      message:
        "Payment proof submitted! Open Staff Console → Rewards Engine to approve and credit tokens.",
    });
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to submit payment proof." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const staff = await requireStaff(req, ["Admin", "Moderator"]);
  if (!staff) {
    return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const rewardId = typeof body.rewardId === "string" ? body.rewardId : body.id;
    const requestedTokens = Number(body.tokensToReward);

    if (!rewardId) {
      return NextResponse.json(
        { error: "Reward submission ID is required." },
        { status: 400 }
      );
    }
    if (
      body.tokensToReward !== undefined &&
      (!Number.isInteger(requestedTokens) || requestedTokens < 1 || requestedTokens > 100_000)
    ) {
      return NextResponse.json(
        { error: "Token credit must be a whole number between 1 and 100,000." },
        { status: 400 }
      );
    }

    const db = await readDb();
    const reward = db.rewards.find((item) => item.id === rewardId);
    if (!reward) {
      return NextResponse.json(
        { error: "Payment submission not found." },
        { status: 404 }
      );
    }
    if (reward.status === "rewarded") {
      return NextResponse.json(
        { error: "This payment has already been rewarded." },
        { status: 409 }
      );
    }

    const tokensToCredit = Math.floor(
      requestedTokens > 0
        ? requestedTokens
        : reward.tokensRequested || reward.amount || 100
    );

    let user = reward.userId
      ? db.users.find((candidate) => candidate.id === reward.userId)
      : undefined;
    if (!user && reward.userEmail) {
      user = db.users.find(
        (candidate) => candidate.email.toLowerCase() === reward.userEmail!.toLowerCase()
      );
    }
    if (!user) {
      return NextResponse.json(
        {
          error: "No registered account is linked to this payment. Select the correct reader in the direct token reward section instead.",
          code: "UNLINKED_ACCOUNT",
        },
        { status: 409 }
      );
    }

    user.tokens = (user.tokens || 0) + tokensToCredit;
    reward.status = "rewarded";
    reward.tokensCredited = tokensToCredit;
    reward.rewardedAt = new Date().toISOString();
    reward.rewardedBy = staff.email;
    await writeDb(db);

    return NextResponse.json({
      reward,
      creditedUser: sanitizeUser(user),
      message: `Rewarded +${tokensToCredit} tokens to ${user.name} (New Balance: ${user.tokens} Tokens)!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to reward tokens." },
      { status: 500 }
    );
  }
}
