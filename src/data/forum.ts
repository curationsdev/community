export interface ForumPost {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  likes: number;
}

export interface ForumChannel {
  slug: string;
  title: string;
  description: string;
  posts: ForumPost[];
}

export const channels: ForumChannel[] = [
  {
    slug: "general",
    title: "General",
    description: "Open hallway for updates, shoutouts, and vibes.",
    posts: [
      {
        id: "welcome-thread",
        title: "Welcome to the Human × AI Playground",
        author: "Codex",
        excerpt: "Drop your intros, what you're building, and who you want to jam with.",
        likes: 12,
      },
      {
        id: "launch-roadmap",
        title: "Launch Roadmap",
        author: "CURATIONS",
        excerpt: "Milestones for taking community.curations.dev from sketch to live.",
        likes: 9,
      },
    ],
  },
  {
    slug: "prompts",
    title: "Prompts",
    description: "Share, remix, and iterate on prompt recipes.",
    posts: [
      {
        id: "brand-drift",
        title: "Brand Drift Narrative Prompt",
        author: "Harper",
        excerpt: "Story prompt for generating campaign arcs that evolve weekly.",
        likes: 14,
      },
    ],
  },
  {
    slug: "tools",
    title: "Tools",
    description: "Discuss creative stacks, automations, and experiments.",
    posts: [
      {
        id: "astro-workers",
        title: "Astro + Workers Integration Tips",
        author: "Nova",
        excerpt: "Lessons learned hooking Astro frontend into Cloudflare Worker endpoints.",
        likes: 11,
      },
    ],
  },
  {
    slug: "feedback",
    title: "Feedback",
    description: "Ship a thing? Need a vibe check? Post here.",
    posts: [
      {
        id: "homepage-review",
        title: "Homepage iteration feedback",
        author: "River",
        excerpt: "Looking for color palette notes & copy edits before launch.",
        likes: 7,
      },
    ],
  },
];

export const getChannelBySlug = (slug: string) =>
  channels.find((channel) => channel.slug === slug);
