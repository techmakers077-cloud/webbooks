import "server-only";
import type { BookRecord } from "./schema";

export const INITIAL_BOOKS: BookRecord[] = [
  {
    id: "book-neural-architectures",
    title: "The Sovereign Mind: Neural Horizons & Human Agency",
    author: "Dr. Elena Vance",
    category: "AI & Philosophy",
    tokenCost: 100,
    coverUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "tall",
    preview:
      "An evocative exploration of how synthetic reasoning engines reshape human intuition, creative sovereignty, and deep intellectual focus in the post-algorithmic age.",
    tags: ["Bestseller", "AI Ethics", "Cognitive Science", "Deep Read"],
    rating: 4.95,
    reads: 18420,
    pages: 248,
    createdAt: "2026-01-15T09:00:00.000Z",
    chapters: [
      {
        number: 1,
        title: "The Architecture of Attention",
        body: `Every civilization builds monuments to what it values most. In the industrial century, those monuments were forged of steel and suspension cable. In our era, the monuments are invisible—vast cathedral-like matrices of weights, attention heads, and latent representations humming inside liquid-cooled data centers.

Yet the true frontier is not silicon; it is human attention. When a reader sits with a text, a quiet miracle occurs: symbols on a glowing surface become lived experience, philosophical inquiry, and moral imagination.

As reasoning models grow capable of traversing millions of tokens in seconds, the value of human reading shifts from mere information extraction to synthesis and discernment. To read deeply is to claim sovereignty over one's own mind. We do not read merely to know facts; we read to transform the lens through which every fact is interpreted.`,
      },
      {
        number: 2,
        title: "Symbiosis with Reasoning Engines",
        body: `Consider the relationship between the navigator and the sextant. The instrument did not replace the captain's judgment; it expanded the horizon across which judgment could be exercised.

Modern neural architectures—such as sparse mixture-of-experts and high-efficiency reasoning models—act as cognitive resonators. When a thoughtful reader pairs deep textual immersion with an AI companion, a Socratic dialogue emerges. You question the author's premises, test counter-arguments across historical epochs, and uncover hidden structural motifs that might otherwise remain buried.

The danger lies only in passivity. The sovereign thinker treats synthetic intelligence not as an oracle that ends inquiry, but as a tireless interlocutor that sharpens it.`,
      },
      {
        number: 3,
        title: "Designing a Life of Deep Literacy",
        body: `In a world engineered for distraction, curating a personal library of high-signal ideas is an act of quiet rebellion. Establish rituals around your reading: dim the ambient noise, enlarge the typography until every sentence breathes, and linger over passages that challenge your defaults.

When you finish a chapter, articulate its core tension in your own words. Ask yourself: What would have to be true for the author's thesis to fail? Where does this insight intersect with my own craft? In answering those questions, knowledge crystallizes into wisdom.`,
      },
    ],
    content: `Chapter 1: The Architecture of Attention\n\nEvery civilization builds monuments to what it values most. In the industrial century, those monuments were forged of steel and suspension cable. In our era, the monuments are invisible—vast cathedral-like matrices of weights, attention heads, and latent representations humming inside liquid-cooled data centers.\n\nChapter 2: Symbiosis with Reasoning Engines\n\nModern neural architectures act as cognitive resonators. When a thoughtful reader pairs deep textual immersion with an AI companion, a Socratic dialogue emerges.\n\nChapter 3: Designing a Life of Deep Literacy\n\nIn a world engineered for distraction, curating a personal library of high-signal ideas is an act of quiet rebellion.`,
  },
  {
    id: "book-first-principles-handbook",
    title: "The First-Principles Playbook: Mental Models for Builders",
    author: "Siddharth Rao",
    category: "Mental Models",
    tokenCost: 20,
    coverUrl:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "compact",
    preview:
      "Unlockable with your 25 Welcome Tokens! A crisp, practical compendium of 12 timeless mental models from physics, evolutionary biology, and game theory.",
    tags: ["Welcome Pick", "20 Tokens", "Mental Models", "Quick Read"],
    rating: 4.92,
    reads: 51200,
    pages: 140,
    createdAt: "2026-02-15T08:00:00.000Z",
    chapters: [
      {
        number: 1,
        title: "Reasoning from Bedrock Truths",
        body: `Reasoning by analogy copies what already exists with minor variations. Reasoning from first principles strips a problem down to its fundamental, undeniable truths and builds upward from there.

Whenever you hear "that is simply how this industry works," pause and ask: Which laws of physics, economics, or human nature actually constrain this problem, and which constraints are merely inherited habits?`,
      },
      {
        number: 2,
        title: "Inversion & Pre-Mortem Thinking",
        body: `The German mathematician Carl Jacobi famously advised: "Invert, always invert." Instead of asking only how to achieve a brilliant outcome, ask what actions would guarantee failure—and systematically eliminate them.

By combining optimism in vision with ruthless realism in risk removal, builders navigate uncertainty with extraordinary calm.`,
      },
      {
        number: 3,
        title: "Second-Order Consequences",
        body: `Every action triggers a cascade. First-order thinking looks only at the immediate result; second-order thinking asks, "And then what?" Most extraordinary returns in technology and literature come from decisions whose immediate cost is visible, but whose compounding reward unfolds over years.`,
      },
    ],
    content: `Chapter 1: Reasoning from Bedrock Truths\n\nReasoning from first principles strips a problem down to its fundamental truths and builds upward from there.\n\nChapter 2: Inversion & Pre-Mortem Thinking\n\nInstead of asking only how to achieve a brilliant outcome, ask what actions would guarantee failure—and systematically eliminate them.`,
  },
  {
    id: "book-velvet-kyoto",
    title: "Midnight in Arashiyama: Notes on Stillness & Craft",
    author: "Kenjiro Sato",
    category: "Design & Aesthetics",
    tokenCost: 150,
    coverUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "portrait",
    preview:
      "A visual and literary meditation on Japanese spatial harmony, wabi-sabi typography, bamboo architecture, and the timeless discipline of artisanal craft.",
    tags: ["Aesthetics", "Minimalism", "Kyoto", "Architecture"],
    rating: 4.95,
    reads: 24150,
    pages: 196,
    createdAt: "2026-01-20T12:00:00.000Z",
    chapters: [
      {
        number: 1,
        title: "Ma: The Eloquence of Empty Space",
        body: `Walk through the cedar gates of a Kyoto moss garden at dawn and you immediately notice what is absent. There is no clutter competing for your eye. Every stepping stone is placed just far enough from the next to make you conscious of your stride.

In Japanese aesthetics, this intentional interval is called Ma (間). It is not mere emptiness; it is the charged silence between musical notes that gives the melody its emotional weight. In visual design and literature alike, overcrowding destroys resonance. When we leave generous margin around an idea, the viewer's imagination steps in to complete the work.`,
      },
      {
        number: 2,
        title: "The Patina of Honest Materials",
        body: `A freshly planed hinoki cypress beam smells of citrus and mountain rain. Twenty years later, darkened by sunlight and the touch of thousands of hands, it possesses a warmth no synthetic lacquer can imitate.

Great digital and physical products honor this same principle. They avoid gimmicks that age poorly. Instead, they rely on proportion, clarity of structure, and tactile honesty—qualities that grow more endearing the longer one lives with them.`,
      },
      {
        number: 3,
        title: "Lanterns Along the Katsura River",
        body: `As twilight settles over Arashiyama, paper lanterns flicker to life along the riverbank. Their light does not banish the darkness; it coexists with it, casting soft amber pools on the water.

So too with clarity in writing. Our aim is not to blind the reader with exhaustive jargon, but to kindle a warm, steady lantern that illuminates the path one step at a time.`,
      },
    ],
    content: `Chapter 1: Ma: The Eloquence of Empty Space\n\nWalk through the cedar gates of a Kyoto moss garden at dawn and you immediately notice what is absent. In Japanese aesthetics, this intentional interval is called Ma.\n\nChapter 2: The Patina of Honest Materials\n\nGreat digital and physical products rely on proportion, clarity of structure, and tactile honesty.\n\nChapter 3: Lanterns Along the Katsura River\n\nAs twilight settles over Arashiyama, paper lanterns flicker to life along the riverbank.`,
  },
  {
    id: "book-zero-to-hypergrowth",
    title: "Compound Velocity: Building Enduring Internet Empires",
    author: "Aria Krishnan",
    category: "Venture & Strategy",
    tokenCost: 200,
    coverUrl:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "medium",
    preview:
      "Playbooks from iconic technology founders on asymmetric product bets, community-led distribution loops, pricing psychology, and high-trust micro-economies.",
    tags: ["Startups", "Strategy", "Product", "Founders"],
    rating: 4.88,
    reads: 31900,
    pages: 312,
    createdAt: "2026-02-01T14:00:00.000Z",
    chapters: [
      {
        number: 1,
        title: "The Law of Asymmetric Delight",
        body: `Most software products fail not because they are broken, but because they are forgettable. They satisfy a checklist of requirements while inspiring zero emotional attachment.

Enduring companies obsess over moments of asymmetric delight—tiny, high-craft interactions that make a user pause and smile. Whether it is the fluid masonry cascade of a visual discovery feed or the instant celebration when a milestone is unlocked, craft is the highest-leverage distribution channel ever invented.`,
      },
      {
        number: 2,
        title: "Tokenized Micro-Economies & Patronage",
        body: `For decades, digital publishing was trapped between two broken extremes: intrusive advertising that degraded the reading experience, or rigid annual subscriptions that locked out casual explorers.

Micro-token ecosystems unlock a third path. Readers acquire a flexible balance and spend tokens only on the works that genuinely captivate them. Authors and curators are rewarded directly for quality and depth, aligning incentives across the entire creative ecosystem.`,
      },
      {
        number: 3,
        title: "Operating at High Cadence",
        body: `Speed is not frantic motion; speed is the elimination of unnecessary waiting. When a team empowers its editors and operators with real-time publishing tools—where dropping a manuscript file immediately structures, formats, and syndicates a book—creative momentum compounds daily.`,
      },
    ],
    content: `Chapter 1: The Law of Asymmetric Delight\n\nEnduring companies obsess over moments of asymmetric delight—tiny, high-craft interactions that make a user pause and smile.\n\nChapter 2: Tokenized Micro-Economies & Patronage\n\nMicro-token ecosystems unlock a third path where readers spend tokens on works that genuinely captivate them.\n\nChapter 3: Operating at High Cadence\n\nWhen a team empowers its operators with real-time publishing tools, creative momentum compounds daily.`,
  },
  {
    id: "book-quantum-odyssey",
    title: "Chronicles of the Astral Loom: A Speculative Tapestry",
    author: "Julian Vance-Sterling",
    category: "Sci-Fi & Speculative",
    tokenCost: 350,
    coverUrl:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "tall",
    preview:
      "An epic hard-science fiction saga set aboard a ring-station orbiting a binary pulsar, where archivists weave memories of vanished worlds into living light.",
    tags: ["Collector Edition", "Hard Sci-Fi", "Worldbuilding", "Epic"],
    rating: 4.97,
    reads: 42800,
    pages: 480,
    createdAt: "2026-02-10T18:30:00.000Z",
    chapters: [
      {
        number: 1,
        title: "The Glass Observatory of Cygnus",
        body: `Seventy thousand kilometers above the magnetosphere of Cygnus X-3, the Great Loom turned in silence. Its spokes were spun from braided carbon-nanotube filaments, each carrying petabits of photonic memory harvested from twelve hundred settled worlds.

Lyra stood at the curvature window, watching the pulsar sweep its emerald beam across the nebula. In her palm rested a single crystalline spool—the final unindexed archive of Old Earth's Alexandria.`,
      },
      {
        number: 2,
        title: "Echoes in the Photonic Lattice",
        body: `When Lyra slotted the spool into the reader console, the chamber filled with holographic marginalia. Centuries of scholars had annotated the same passages, their thoughts layered like geological strata.

"Every book," the archive's sentient curator whispered through the neural link, "is a time machine that travels forward. The author speaks into the dark, trusting that centuries later, a mind not yet born will catch the spark."`,
      },
      {
        number: 3,
        title: "The Weaver's Oath",
        body: `Across the ring-station, bells of resonant quartz chimed the third watch. Lyra adjusted the magnification of the ancient manuscript and began her translation. So long as a single reader remained awake to turn the page, no civilization was ever truly lost.`,
      },
    ],
    content: `Chapter 1: The Glass Observatory of Cygnus\n\nSeventy thousand kilometers above the magnetosphere of Cygnus X-3, the Great Loom turned in silence.\n\nChapter 2: Echoes in the Photonic Lattice\n\nEvery book is a time machine that travels forward.\n\nChapter 3: The Weaver's Oath\n\nSo long as a single reader remained awake to turn the page, no civilization was ever truly lost.`,
  },
  {
    id: "book-alchemist-code",
    title: "Botanical Illustrations & The Lost Herbarium of Florence",
    author: "Clara Bellini",
    category: "Art & History",
    tokenCost: 150,
    coverUrl:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "tall",
    preview:
      "Discover the secret Renaissance notebooks where master painters and apothecaries cataloged rare Mediterranean flora in luminous mineral pigments.",
    tags: ["Renaissance", "Botanical Art", "History", "Illustrated"],
    rating: 4.89,
    reads: 15300,
    pages: 224,
    createdAt: "2026-02-20T11:20:00.000Z",
    chapters: [
      {
        number: 1,
        title: "Ultramarine & Malachite",
        body: `In sixteenth-century Florence, a single ounce of ground lapis lazuli cost more than gold. Yet in the quiet cloisters overlooking the Arno, botanical illustrators spared no expense to capture the exact azure petal of the wild iris.

To draw a plant accurately was considered both a scientific duty and a devotional act—a way of reading the living manuscript of nature.`,
      },
      {
        number: 2,
        title: "The Cipher in the Margins",
        body: `Beneath the delicate ink studies of rosemary and nightshade, restorers recently uncovered micro-script notes detailing distillation temperatures and herbal remedies shared across Venice, Padua, and Florence.`,
      },
    ],
    content: `Chapter 1: Ultramarine & Malachite\n\nIn sixteenth-century Florence, botanical illustrators spared no expense to capture the exact azure petal of the wild iris.\n\nChapter 2: The Cipher in the Margins\n\nBeneath the delicate ink studies, restorers uncovered micro-script notes detailing distillation temperatures.`,
  },
  {
    id: "book-nordic-calm",
    title: "Fjord & Hearth: Architecture of the Northern Light",
    author: "Soren Lindqvist",
    category: "Design & Aesthetics",
    tokenCost: 100,
    coverUrl:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "medium",
    preview:
      "How Scandinavian architects harness low-angle winter sunlight, untreated pine, and acoustic warmth to craft sanctuaries for deep reading.",
    tags: ["Nordic", "Interiors", "Sanctuary", "Craft"],
    rating: 4.87,
    reads: 19400,
    pages: 184,
    createdAt: "2026-02-25T16:10:00.000Z",
    chapters: [
      {
        number: 1,
        title: "Capturing the Low Sun",
        body: `At sixty degrees north latitude, winter light arrives almost horizontally, skimming across snowfields and fjord water like liquid silver. Northern architecture is above all an instrument for catching and softening that precious glow.`,
      },
      {
        number: 2,
        title: "The Reading Corner as Hearth",
        body: `Every great home requires a gravitational center—a chair positioned near natural light, a shelf of well-worn volumes within arm's reach, and a table just wide enough for a ceramic mug.`,
      },
    ],
    content: `Chapter 1: Capturing the Low Sun\n\nNorthern architecture is above all an instrument for catching and softening precious winter light.\n\nChapter 2: The Reading Corner as Hearth\n\nEvery great home requires a gravitational center—a chair positioned near natural light and a shelf of well-worn volumes.`,
  },
  {
    id: "book-algorithmic-finance",
    title: "Orderbook Physics: Microstructure of Modern Markets",
    author: "Vikramaditya Sen",
    category: "Venture & Strategy",
    tokenCost: 350,
    coverUrl:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "portrait",
    preview:
      "A quantitative deep dive into liquidity cascades, market-making invariants, auction theory, and statistical arbitrage in continuous double auctions.",
    tags: ["Quant", "Markets", "Mathematics", "350 Tokens"],
    rating: 4.96,
    reads: 28750,
    pages: 410,
    createdAt: "2026-03-01T10:00:00.000Z",
    chapters: [
      {
        number: 1,
        title: "The Continuous Double Auction",
        body: `Beneath every price chart lies a living queue of resting limit orders and impatient market orders. Understanding the arrival rates, cancellation dynamics, and adverse selection across this queue is the foundation of market microstructure.`,
      },
      {
        number: 2,
        title: "Inventory Risk & Spread Geometry",
        body: `A market maker sells immediacy to the rest of the world. In exchange for bridging buyers and sellers separated in time, the liquidity provider continuously manages inventory skew against sudden information shocks.`,
      },
    ],
    content: `Chapter 1: The Continuous Double Auction\n\nBeneath every price chart lies a living queue of resting limit orders and impatient market orders.\n\nChapter 2: Inventory Risk & Spread Geometry\n\nA market maker sells immediacy to the rest of the world, bridging buyers and sellers separated in time.`,
  },
  {
    id: "book-nemotron-synthesis",
    title: "Accelerated Intelligence: Inside Sparse Neural Reasoning",
    author: "Dr. Aris Thorne",
    category: "AI & Philosophy",
    tokenCost: 200,
    coverUrl:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "tall",
    preview:
      "How frontier Nemotron-class architectures combine ultra-long context windows with chain-of-thought verification to solve multi-step scientific problems.",
    tags: ["NVIDIA Nemotron", "Deep Learning", "Reasoning", "200 Tokens"],
    rating: 4.98,
    reads: 36400,
    pages: 290,
    createdAt: "2026-03-04T11:00:00.000Z",
    chapters: [
      {
        number: 1,
        title: "The Rise of Test-Time Compute",
        body: `For the first decade of deep learning, scale meant larger pre-training runs. Today, a second scaling law has emerged: test-time reasoning. When a model allocates deliberate tokens to verify hypotheses, backtrack from dead ends, and synthesize cross-domain evidence, small efficient architectures rival giant monoliths.`,
      },
      {
        number: 2,
        title: "Long-Context Literary Comprehension",
        body: `Holding an entire book in active working memory transforms how an AI companion collaborates with a human reader. Instead of retrieving isolated snippets, the model perceives overarching character arcs, recurring metaphors, and subtle philosophical callbacks across hundreds of pages.`,
      },
    ],
    content: `Chapter 1: The Rise of Test-Time Compute\n\nTest-time reasoning allows models to verify hypotheses and synthesize cross-domain evidence.\n\nChapter 2: Long-Context Literary Comprehension\n\nHolding an entire book in active working memory transforms how an AI companion collaborates with a reader.`,
  },
  {
    id: "book-stoic-craftsman",
    title: "Letters from a Stoic Engineer: Calm in High-Stakes Systems",
    author: "Marcus Aurelius Varma",
    category: "Mental Models",
    tokenCost: 100,
    coverUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=85",
    aspectRatio: "compact",
    preview:
      "Timeless lessons connecting Roman Stoic philosophy with modern distributed systems engineering, incident response, and emotional equanimity.",
    tags: ["Stoicism", "Engineering", "Resilience", "100 Tokens"],
    rating: 4.91,
    reads: 22900,
    pages: 176,
    createdAt: "2026-03-06T09:30:00.000Z",
    chapters: [
      {
        number: 1,
        title: "The Dichotomy of Control in Production",
        body: `You cannot control when a fiber-optic cable is severed beneath the ocean, nor can you control the sudden surge of traffic at midnight. You can always control your observability, your fallback architecture, and the composure with which you lead the post-mortem.`,
      },
      {
        number: 2,
        title: "Amor Fati & Iterative Refinement",
        body: `Treat every edge case not as an interruption to your craft, but as the very whetstone upon which your system's resilience is sharpened.`,
      },
    ],
    content: `Chapter 1: The Dichotomy of Control in Production\n\nYou can always control your observability, your fallback architecture, and your composure.\n\nChapter 2: Amor Fati & Iterative Refinement\n\nTreat every edge case as the whetstone upon which resilience is sharpened.`,
  },
];
