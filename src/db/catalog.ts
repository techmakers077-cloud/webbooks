import type { BookRecord } from "./schema";

// Browser-safe catalog metadata only. Full chapter bodies stay in server-only seed data.
export const INITIAL_BOOKS: BookRecord[] =
[
  {
    "id": "book-neural-architectures",
    "title": "The Sovereign Mind: Neural Horizons & Human Agency",
    "author": "Dr. Elena Vance",
    "category": "AI & Philosophy",
    "tokenCost": 100,
    "coverUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "tall",
    "preview": "An evocative exploration of how synthetic reasoning engines reshape human intuition, creative sovereignty, and deep intellectual focus in the post-algorithmic age.",
    "tags": [
      "Bestseller",
      "AI Ethics",
      "Cognitive Science",
      "Deep Read"
    ],
    "rating": 4.95,
    "reads": 18420,
    "pages": 248,
    "createdAt": "2026-01-15T09:00:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "The Architecture of Attention",
        "body": ""
      },
      {
        "number": 2,
        "title": "Symbiosis with Reasoning Engines",
        "body": ""
      },
      {
        "number": 3,
        "title": "Designing a Life of Deep Literacy",
        "body": ""
      }
    ],
    "content": ""
  },
  {
    "id": "book-first-principles-handbook",
    "title": "The First-Principles Playbook: Mental Models for Builders",
    "author": "Siddharth Rao",
    "category": "Mental Models",
    "tokenCost": 20,
    "coverUrl": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "compact",
    "preview": "Unlockable with your 25 Welcome Tokens! A crisp, practical compendium of 12 timeless mental models from physics, evolutionary biology, and game theory.",
    "tags": [
      "Welcome Pick",
      "20 Tokens",
      "Mental Models",
      "Quick Read"
    ],
    "rating": 4.92,
    "reads": 51200,
    "pages": 140,
    "createdAt": "2026-02-15T08:00:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "Reasoning from Bedrock Truths",
        "body": ""
      },
      {
        "number": 2,
        "title": "Inversion & Pre-Mortem Thinking",
        "body": ""
      },
      {
        "number": 3,
        "title": "Second-Order Consequences",
        "body": ""
      }
    ],
    "content": ""
  },
  {
    "id": "book-velvet-kyoto",
    "title": "Midnight in Arashiyama: Notes on Stillness & Craft",
    "author": "Kenjiro Sato",
    "category": "Design & Aesthetics",
    "tokenCost": 150,
    "coverUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "portrait",
    "preview": "A visual and literary meditation on Japanese spatial harmony, wabi-sabi typography, bamboo architecture, and the timeless discipline of artisanal craft.",
    "tags": [
      "Aesthetics",
      "Minimalism",
      "Kyoto",
      "Architecture"
    ],
    "rating": 4.95,
    "reads": 24150,
    "pages": 196,
    "createdAt": "2026-01-20T12:00:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "Ma: The Eloquence of Empty Space",
        "body": ""
      },
      {
        "number": 2,
        "title": "The Patina of Honest Materials",
        "body": ""
      },
      {
        "number": 3,
        "title": "Lanterns Along the Katsura River",
        "body": ""
      }
    ],
    "content": ""
  },
  {
    "id": "book-zero-to-hypergrowth",
    "title": "Compound Velocity: Building Enduring Internet Empires",
    "author": "Aria Krishnan",
    "category": "Venture & Strategy",
    "tokenCost": 200,
    "coverUrl": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "medium",
    "preview": "Playbooks from iconic technology founders on asymmetric product bets, community-led distribution loops, pricing psychology, and high-trust micro-economies.",
    "tags": [
      "Startups",
      "Strategy",
      "Product",
      "Founders"
    ],
    "rating": 4.88,
    "reads": 31900,
    "pages": 312,
    "createdAt": "2026-02-01T14:00:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "The Law of Asymmetric Delight",
        "body": ""
      },
      {
        "number": 2,
        "title": "Tokenized Micro-Economies & Patronage",
        "body": ""
      },
      {
        "number": 3,
        "title": "Operating at High Cadence",
        "body": ""
      }
    ],
    "content": ""
  },
  {
    "id": "book-quantum-odyssey",
    "title": "Chronicles of the Astral Loom: A Speculative Tapestry",
    "author": "Julian Vance-Sterling",
    "category": "Sci-Fi & Speculative",
    "tokenCost": 350,
    "coverUrl": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "tall",
    "preview": "An epic hard-science fiction saga set aboard a ring-station orbiting a binary pulsar, where archivists weave memories of vanished worlds into living light.",
    "tags": [
      "Collector Edition",
      "Hard Sci-Fi",
      "Worldbuilding",
      "Epic"
    ],
    "rating": 4.97,
    "reads": 42800,
    "pages": 480,
    "createdAt": "2026-02-10T18:30:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "The Glass Observatory of Cygnus",
        "body": ""
      },
      {
        "number": 2,
        "title": "Echoes in the Photonic Lattice",
        "body": ""
      },
      {
        "number": 3,
        "title": "The Weaver's Oath",
        "body": ""
      }
    ],
    "content": ""
  },
  {
    "id": "book-alchemist-code",
    "title": "Botanical Illustrations & The Lost Herbarium of Florence",
    "author": "Clara Bellini",
    "category": "Art & History",
    "tokenCost": 150,
    "coverUrl": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "tall",
    "preview": "Discover the secret Renaissance notebooks where master painters and apothecaries cataloged rare Mediterranean flora in luminous mineral pigments.",
    "tags": [
      "Renaissance",
      "Botanical Art",
      "History",
      "Illustrated"
    ],
    "rating": 4.89,
    "reads": 15300,
    "pages": 224,
    "createdAt": "2026-02-20T11:20:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "Ultramarine & Malachite",
        "body": ""
      },
      {
        "number": 2,
        "title": "The Cipher in the Margins",
        "body": ""
      }
    ],
    "content": ""
  },
  {
    "id": "book-nordic-calm",
    "title": "Fjord & Hearth: Architecture of the Northern Light",
    "author": "Soren Lindqvist",
    "category": "Design & Aesthetics",
    "tokenCost": 100,
    "coverUrl": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "medium",
    "preview": "How Scandinavian architects harness low-angle winter sunlight, untreated pine, and acoustic warmth to craft sanctuaries for deep reading.",
    "tags": [
      "Nordic",
      "Interiors",
      "Sanctuary",
      "Craft"
    ],
    "rating": 4.87,
    "reads": 19400,
    "pages": 184,
    "createdAt": "2026-02-25T16:10:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "Capturing the Low Sun",
        "body": ""
      },
      {
        "number": 2,
        "title": "The Reading Corner as Hearth",
        "body": ""
      }
    ],
    "content": ""
  },
  {
    "id": "book-algorithmic-finance",
    "title": "Orderbook Physics: Microstructure of Modern Markets",
    "author": "Vikramaditya Sen",
    "category": "Venture & Strategy",
    "tokenCost": 350,
    "coverUrl": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "portrait",
    "preview": "A quantitative deep dive into liquidity cascades, market-making invariants, auction theory, and statistical arbitrage in continuous double auctions.",
    "tags": [
      "Quant",
      "Markets",
      "Mathematics",
      "350 Tokens"
    ],
    "rating": 4.96,
    "reads": 28750,
    "pages": 410,
    "createdAt": "2026-03-01T10:00:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "The Continuous Double Auction",
        "body": ""
      },
      {
        "number": 2,
        "title": "Inventory Risk & Spread Geometry",
        "body": ""
      }
    ],
    "content": ""
  },
  {
    "id": "book-nemotron-synthesis",
    "title": "Accelerated Intelligence: Inside Sparse Neural Reasoning",
    "author": "Dr. Aris Thorne",
    "category": "AI & Philosophy",
    "tokenCost": 200,
    "coverUrl": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "tall",
    "preview": "How frontier Nemotron-class architectures combine ultra-long context windows with chain-of-thought verification to solve multi-step scientific problems.",
    "tags": [
      "NVIDIA Nemotron",
      "Deep Learning",
      "Reasoning",
      "200 Tokens"
    ],
    "rating": 4.98,
    "reads": 36400,
    "pages": 290,
    "createdAt": "2026-03-04T11:00:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "The Rise of Test-Time Compute",
        "body": ""
      },
      {
        "number": 2,
        "title": "Long-Context Literary Comprehension",
        "body": ""
      }
    ],
    "content": ""
  },
  {
    "id": "book-stoic-craftsman",
    "title": "Letters from a Stoic Engineer: Calm in High-Stakes Systems",
    "author": "Marcus Aurelius Varma",
    "category": "Mental Models",
    "tokenCost": 100,
    "coverUrl": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=85",
    "aspectRatio": "compact",
    "preview": "Timeless lessons connecting Roman Stoic philosophy with modern distributed systems engineering, incident response, and emotional equanimity.",
    "tags": [
      "Stoicism",
      "Engineering",
      "Resilience",
      "100 Tokens"
    ],
    "rating": 4.91,
    "reads": 22900,
    "pages": 176,
    "createdAt": "2026-03-06T09:30:00.000Z",
    "chapters": [
      {
        "number": 1,
        "title": "The Dichotomy of Control in Production",
        "body": ""
      },
      {
        "number": 2,
        "title": "Amor Fati & Iterative Refinement",
        "body": ""
      }
    ],
    "content": ""
  }
]
;
