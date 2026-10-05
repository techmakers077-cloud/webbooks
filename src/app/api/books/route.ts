import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, parseChaptersFromContent } from "@/db";
import { generateId } from "@/lib/utils";
import type { BookRecord } from "@/db/schema";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

function toPublicBook(book: BookRecord): BookRecord {
  return {
    ...book,
    content: "",
    chapters: (book.chapters || []).map(({ number, title }) => ({
      number,
      title,
      body: "",
    })),
  };
}

export async function GET() {
  const db = await readDb();
  return NextResponse.json(
    { books: db.books.map(toPublicBook) },
    { headers: { "Cache-Control": "public, no-store, max-age=0" } }
  );
}

export async function POST(req: NextRequest) {
  const staff = await requireStaff(req, ["Admin", "Editor"]);
  if (!staff) {
    return NextResponse.json({ error: "Admin or Editor staff access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const title = (body.title || "").trim();
    const author = (body.author || "WebBooks Editorial").trim();
    const category = (body.category || "Featured").trim();
    const tokenCost = Math.max(0, Number(body.tokenCost ?? 100));
    const preview = (
      body.preview ||
      (body.content ? String(body.content).slice(0, 220) + "..." : "")
    ).trim();
    const content = (body.content || preview || "Full book content.").trim();
    const coverUrl =
      (body.coverUrl || "").trim() ||
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85";
    const aspectRatio = body.aspectRatio || "tall";
    const tags = Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || `${category}, New Release`)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    if (!title) {
      return NextResponse.json(
        { error: "Book title is required." },
        { status: 400 }
      );
    }

    const db = await readDb();
    const chapters =
      Array.isArray(body.chapters) && body.chapters.length > 0
        ? body.chapters
        : parseChaptersFromContent(title, content);

    // Check if we are updating an existing book by ID or title if requested
    if (body.bookId) {
      const existingIdx = db.books.findIndex((b) => b.id === body.bookId);
      if (existingIdx !== -1) {
        const updated: BookRecord = {
          ...db.books[existingIdx],
          title,
          author,
          category,
          tokenCost,
          coverUrl,
          preview,
          content,
          chapters,
          tags,
        };
        db.books[existingIdx] = updated;
        await writeDb(db);
        return NextResponse.json({ book: updated, updated: true });
      }
    }

    const newBook: BookRecord = {
      id: generateId("book"),
      title,
      author,
      category,
      tokenCost,
      coverUrl,
      aspectRatio,
      preview,
      content,
      chapters,
      tags,
      rating: 4.9,
      reads: 1,
      pages: Math.max(24, chapters.length * 42),
      createdAt: new Date().toISOString(),
    };

    db.books.unshift(newBook);
    await writeDb(db);

    return NextResponse.json({ book: newBook, created: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to publish book." },
      { status: 500 }
    );
  }
}
