import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, parseChaptersFromContent } from "@/db";
import { generateId } from "@/lib/utils";
import type { BookRecord } from "@/db/schema";
import { requireStaff } from "@/lib/auth";

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=85",
];

const ASPECT_RATIOS: Array<"tall" | "medium" | "portrait" | "compact"> = [
  "tall",
  "portrait",
  "medium",
  "compact",
];

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const staff = await requireStaff(req, ["Admin", "Editor"]);
  if (!staff) {
    return NextResponse.json({ error: "Admin or Editor staff access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (typeof body.rawFileContent === "string" && Buffer.byteLength(body.rawFileContent, "utf8") > 1_000_000) {
      return NextResponse.json({ error: "Manuscript files must be smaller than 1 MB." }, { status: 413 });
    }
    const db = await readDb();

    let title = (body.title || "").trim();
    let author = (body.author || "").trim();
    let category = (body.category || "").trim();
    let tokenCost = body.tokenCost !== undefined ? Number(body.tokenCost) : 150;
    let preview = (body.preview || "").trim();
    let content = (body.content || "").trim();
    let coverUrl = (body.coverUrl || "").trim();
    let tags: string[] = [];

    // If raw file content & fileName were uploaded, auto-extract fields if not explicitly overridden
    if (body.rawFileContent) {
      const fileName = String(body.fileName || "uploaded-book.txt");
      const rawText = String(body.rawFileContent).trim();

      if (fileName.toLowerCase().endsWith(".json")) {
        try {
          const parsed = JSON.parse(rawText);
          title = title || parsed.title || parsed.name || fileName.replace(/\.json$/i, "");
          author = author || parsed.author || parsed.creator || "WebBooks Studio";
          category = category || parsed.category || parsed.genre || "Featured";
          if (parsed.tokenCost !== undefined && body.tokenCost === undefined) {
            tokenCost = Number(parsed.tokenCost);
          }
          preview =
            preview ||
            parsed.preview ||
            parsed.description ||
            parsed.summary ||
            "";
          content =
            content ||
            parsed.content ||
            parsed.body ||
            (Array.isArray(parsed.chapters)
              ? parsed.chapters
                  .map((c: any) => `${c.title || "Chapter"}\n\n${c.body || c.content || ""}`)
                  .join("\n\n")
              : JSON.stringify(parsed, null, 2));
          coverUrl = coverUrl || parsed.coverUrl || parsed.cover || "";
          if (Array.isArray(parsed.tags)) {
            tags = parsed.tags;
          }
        } catch {
          content = content || rawText;
        }
      } else {
        // Markdown (.md) or Plaintext (.txt) extraction
        const lines = rawText.split(/\r?\n/).map((l) => l.trim());
        const nonEmptyLines = lines.filter(Boolean);
        const firstHeading = nonEmptyLines.find((l) => l.startsWith("#"));
        const extractedTitle = firstHeading
          ? firstHeading.replace(/^#+\s*/, "").trim()
          : nonEmptyLines[0]?.length && nonEmptyLines[0].length < 100
          ? nonEmptyLines[0]
          : fileName.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " ");

        title = title || extractedTitle || "Untitled Manuscript";
        content = content || rawText;
        const bodyLines = nonEmptyLines.filter((l) => l !== firstHeading && l !== extractedTitle);
        preview =
          preview ||
          bodyLines.join(" ").slice(0, 220).trim() +
            (bodyLines.join(" ").length > 220 ? "..." : "");
      }
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required (or upload a file to auto-extract)." },
        { status: 400 }
      );
    }

    author = author || "WebBooks Editorial";
    category = category || "AI & Philosophy";
    tokenCost = Number.isFinite(tokenCost) && tokenCost >= 0 ? tokenCost : 150;
    content = content || preview || `Full manuscript for ${title} by ${author}.`;
    preview =
      preview ||
      content.slice(0, 200).trim() + (content.length > 200 ? "..." : "");
    coverUrl =
      coverUrl ||
      COVER_PRESETS[db.books.length % COVER_PRESETS.length];

    if (tags.length === 0) {
      if (Array.isArray(body.tags)) {
        tags = body.tags;
      } else if (typeof body.tags === "string" && body.tags.trim()) {
        tags = body.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
      } else {
        tags = [category, `${tokenCost} Tokens`, "Staff Pick"];
      }
    }

    const chapters = parseChaptersFromContent(title, content);

    // Check if targetBookId is passed to update an existing book ("update anything from a file it goes")
    if (body.targetBookId && body.targetBookId !== "new") {
      const idx = db.books.findIndex((b) => b.id === body.targetBookId);
      if (idx !== -1) {
        const updatedBook: BookRecord = {
          ...db.books[idx],
          title,
          author,
          category,
          tokenCost,
          coverUrl,
          preview,
          content,
          chapters,
          tags,
          pages: Math.max(32, chapters.length * 45),
        };
        db.books[idx] = updatedBook;
        await writeDb(db);
        return NextResponse.json({
          book: updatedBook,
          updated: true,
          message: `Updated "${updatedBook.title}" on the live Pinterest feed!`,
        });
      }
    }

    const newBook: BookRecord = {
      id: generateId("book"),
      title,
      author,
      category,
      tokenCost,
      coverUrl,
      aspectRatio: ASPECT_RATIOS[db.books.length % ASPECT_RATIOS.length],
      preview,
      content,
      chapters,
      tags,
      rating: 4.95,
      reads: 120,
      pages: Math.max(48, chapters.length * 45),
      createdAt: new Date().toISOString(),
    };

    db.books.unshift(newBook);
    await writeDb(db);

    return NextResponse.json({
      book: newBook,
      created: true,
      message: `Published "${newBook.title}" (${newBook.tokenCost} tokens) to the live Pinterest feed!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Create Engine failed to process document." },
      { status: 500 }
    );
  }
}
