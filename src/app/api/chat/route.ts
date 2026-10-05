import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/db";

export const dynamic = "force-dynamic";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const NEMOTRON_MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "nvidia/llama-3.3-nemotron-super-49b-v1:free",
  "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "nvidia/nemotron-3.5-lightning:free",
  "nvidia/llama-3.1-nemotron-70b-instruct",
];

function buildNemotronLocalSynthesis(
  userPrompt: string,
  bookTitle?: string,
  bookAuthor?: string,
  bookCategory?: string,
  bookChapters?: Array<{ number: number; title: string; body: string }>
): string {
  const q = userPrompt.toLowerCase().trim();
  const title = bookTitle || "The Sovereign Mind";
  const author = bookAuthor || "Dr. Elena Vance";
  const chapters = bookChapters && bookChapters.length > 0 ? bookChapters : [];

  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q.startsWith("who are you")
  ) {
    return `Hello! I am your **WebBooks AI Reader Companion**, running on **NVIDIA Nemotron** via OpenRouter.

We currently have **${title}** by **${author}** (*${
      bookCategory || "Featured"
    }*) loaded in context (${chapters.length} chapters).

You can ask me to:
- **Summarize** all chapters or a specific chapter
- **Extract mental models** and actionable frameworks
- **Quiz you** with Socratic discussion questions
- **Compare** ideas across the WebBooks library`;
  }

  if (q.includes("summary") || q.includes("summarize") || q.includes("overview")) {
    const chapterPoints =
      chapters.length > 0
        ? chapters
            .map(
              (c) =>
                `- **Chapter ${c.number}: ${c.title}** — ${c.body
                  .split("\n")[0]
                  .slice(0, 190)}...`
            )
            .join("\n")
        : `- Explores foundational themes in ${bookCategory || "literature and strategy"}.`;

    return `### Executive Summary: *${title}*
**Author:** ${author} · **Category:** ${bookCategory || "Curated Edition"}

*${title}* examines how deliberate craftsmanship, structural clarity, and first-principles thinking elevate human agency.

#### Chapter-by-Chapter Breakdown
${chapterPoints}

#### Key Takeaways for Readers
1. **Structural Depth Over Noise:** Focus on enduring principles rather than ephemeral trends.
2. **Active Synthesis:** Pair deep reading with Socratic questioning to turn ideas into lived practice.
3. **Practical Application:** Apply the core mental models from each chapter directly to your daily creative and strategic decisions.`;
  }

  if (q.includes("socratic") || q.includes("quiz") || q.includes("question")) {
    return `### Socratic Discussion Questions · *${title}*

Here are 3 thought-provoking questions to test and deepen your understanding of **${author}**'s thesis:

1. **First-Principles Challenge:** In *${
      chapters[0]?.title || "Chapter 1"
    }*, ${author} argues for intentional structure over passive consumption. Which habit in your current workflow violates this principle?
2. **Counter-Thesis Exploration:** What would have to be true in the real world for the central argument of *${
      chapters[1]?.title || "Chapter 2"
    }* to fail?
3. **Applied Synthesis:** How can you combine the core framework of *${title}* with a project you are building this week?

*Reply with your thoughts on any of these three questions and I will evaluate your reasoning!*`;
  }

  if (q.includes("mental model") || q.includes("counter-intuitive")) {
    return `### Core Mental Models in *${title}*

1. **Sovereign Attention Allocation:** Treat attention as a high-leverage capital asset rather than a passive resource.
2. **Inversion & Structural Clarity:** Strip away superficial complexity until only the load-bearing principles remain (*${
      chapters[0]?.title || "Foundations"
    }*).
3. **Compounding Craftsmanship:** Small, high-precision improvements in how you read, build, and reason compound exponentially over years (*${
      chapters[chapters.length - 1]?.title || "Synthesis"
    }*).`;
  }

  if (q.includes("chapter") || q.includes("quote") || q.includes("passage")) {
    const chMatch = q.match(/chapter\s*(\d+)/i);
    const chNum = chMatch ? Number(chMatch[1]) : 1;
    const ch =
      chapters.find((c) => c.number === chNum) || chapters[0];

    return `### Deep-Dive Chapter Analysis: *${title}*

${
  ch
    ? `Focusing on **Chapter ${ch.number}: ${ch.title}**:\n\n> "${ch.body
        .split("\n\n")[0]
        .slice(0, 260)}"\n\n`
    : ""
}**NVIDIA Nemotron Literary Perspective:**
- **Central Tension:** ${author} contrasts passive consumption with deliberate, sovereign engagement.
- **Structural Motif:** Notice how the chapter builds from concrete observation to a universal principle: *${
      ch ? ch.body.split("\n\n").slice(-1)[0].slice(0, 180) : ""
    }*
- **Follow-up Prompt:** Would you like to explore the next chapter or test how this applies in practice?`;
  }

  return `### NVIDIA Nemotron Analysis · *${title}*

Regarding your inquiry: *"${userPrompt}"*

Drawing from **${title}** by **${author}** (*${
    bookCategory || "Curated Edition"
  }*):

1. **Core Perspective (${chapters[0]?.title || "Chapter 1"}):** ${
    chapters[0]
      ? chapters[0].body.split("\n\n")[0]
      : "True mastery emerges when curiosity is paired with disciplined execution."
  }
2. **Deeper Mechanism (${chapters[1]?.title || "Chapter 2"}):** ${
    chapters[1]
      ? chapters[1].body.split("\n\n")[0]
      : "Across the chapters, the narrative bridges theoretical insight with tactile, real-world craft."
  }
3. **Practical Takeaway:** ${
    chapters[2]
      ? chapters[2].body.split("\n\n")[0]
      : "Ask yourself which constraint in this framework is fundamental and which is merely convention."
  }`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const bookId = body.bookId;
    const requestedModel = NEMOTRON_MODELS.includes(String(body.model || ""))
      ? String(body.model)
      : NEMOTRON_MODELS[0];

    const db = await readDb();
    const selectedBook = bookId
      ? db.books.find((b) => b.id === bookId)
      : db.books[0];

    const systemContext = `You are the WebBooks AI Reader Discussion Companion, powered exclusively by NVIDIA Nemotron.
You help readers explore books with in-depth chapter summaries, Socratic Q&A, thematic analysis, and practical insights.
${
  selectedBook
    ? `Currently Selected Book:
Title: "${selectedBook.title}"
Author: ${selectedBook.author}
Category: ${selectedBook.category}
Token Cost: ${selectedBook.tokenCost} tokens
Preview: ${selectedBook.preview}
Chapters:
${selectedBook.chapters
  .slice(0, 8)
  .map((c) => `Chapter ${c.number} (${c.title}):\n${c.body.slice(0, 600)}`)
  .join("\n\n")}`
    : ""
}
Provide clear, insightful, well-structured Markdown responses.`;

    const apiMessages = [
      { role: "system", content: systemContext },
      ...messages.slice(-16).map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 4000),
      })),
    ];

    // Keep the total upstream wait within a typical Netlify synchronous function window.
    // Try at most two NVIDIA Nemotron candidates, then return the local reader fallback.
    const modelsToTry = Array.from(
      new Set([requestedModel, ...NEMOTRON_MODELS])
    ).slice(0, 2);

    for (const model of OPENROUTER_API_KEY ? modelsToTry : []) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://webbooks.app",
              "X-Title": "WebBooks AI Reader Companion (NVIDIA Nemotron)",
            },
            body: JSON.stringify({
              model,
              messages: apiMessages,
              temperature: 0.7,
              max_tokens: 1024,
            }),
            signal: controller.signal,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              reply,
              model: data.model || model,
              provider: "OpenRouter · NVIDIA Nemotron",
            });
          }
        }
      } catch {
        // Proceed to one more Nemotron candidate or the local synthesis fallback.
      } finally {
        clearTimeout(timer);
      }
    }

    const lastUserMessage =
      [...messages].reverse().find((m: any) => m.role === "user")?.content ||
      "Summarize this book";

    const reply = buildNemotronLocalSynthesis(
      lastUserMessage,
      selectedBook?.title,
      selectedBook?.author,
      selectedBook?.category,
      selectedBook?.chapters
    );

    return NextResponse.json({
      reply,
      model: "local-reader-fallback",
      provider:
        "Offline reader fallback · configure OPENROUTER_API_KEY for live NVIDIA Nemotron",
      bookContext: selectedBook?.title,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to generate NVIDIA Nemotron response." },
      { status: 500 }
    );
  }
}
