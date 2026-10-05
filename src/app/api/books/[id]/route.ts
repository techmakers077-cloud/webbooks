import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/db";
import { getSessionUser, sanitizeUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [db, user] = await Promise.all([readDb(), getSessionUser(_req)]);
  const book = db.books.find((candidate) => candidate.id === id);

  if (!book) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  if (user?.unlockedBookIds?.includes(book.id)) {
    return NextResponse.json({ book });
  }

  const publicBook = {
    ...book,
    content: "",
    chapters: (book.chapters || []).map(({ number, title }) => ({
      number,
      title,
      body: "",
    })),
  };
  return NextResponse.json({ book: publicBook });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await readDb();
    const book = db.books.find((b) => b.id === id);
    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    const sessionUser = await getSessionUser(req);

    if (!sessionUser) {
      return NextResponse.json(
        {
          error: "Please sign in or create an account to unlock books.",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    const userIndex = db.users.findIndex((u) => u.id === sessionUser!.id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "User record not found.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const user = db.users[userIndex];
    if (!Array.isArray(user.unlockedBookIds)) {
      user.unlockedBookIds = [];
    }

    // Already unlocked
    if (user.unlockedBookIds.includes(book.id)) {
      return NextResponse.json({
        unlocked: true,
        alreadyUnlocked: true,
        user: sanitizeUser(user),
        book,
      });
    }

    // Check token balance
    if (user.tokens < book.tokenCost) {
      return NextResponse.json(
        {
          error: `You need ${book.tokenCost} tokens to unlock "${book.title}", but you have ${user.tokens} tokens.`,
          code: "INSUFFICIENT_TOKENS",
          required: book.tokenCost,
          balance: user.tokens,
          deficit: book.tokenCost - user.tokens,
        },
        { status: 402 }
      );
    }

    // Deduct tokens and unlock
    user.tokens -= book.tokenCost;
    user.unlockedBookIds.push(book.id);

    const bookIdx = db.books.findIndex((b) => b.id === book.id);
    if (bookIdx !== -1) {
      db.books[bookIdx].reads = (db.books[bookIdx].reads || 0) + 1;
    }

    db.unlocks.unshift({
      id: generateId("unlock"),
      userId: user.id,
      bookId: book.id,
      tokensSpent: book.tokenCost,
      unlockedAt: new Date().toISOString(),
    });

    await writeDb(db);

    return NextResponse.json({
      unlocked: true,
      user: sanitizeUser(user),
      book: db.books[bookIdx] || book,
      message: `Unlocked "${book.title}" for ${book.tokenCost} tokens!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to unlock book." },
      { status: 500 }
    );
  }
}
