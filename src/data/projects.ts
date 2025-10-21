export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  status: "Ideating" | "Building" | "Live";
  repo: string;
  tags: string[];
  votes: number;
  bodyHtml?: string;
  links?: {
    label: string;
    url: string;
  }[];
}

export const projects: Project[] = [
  {
    slug: "curations-community-core",
    title: "CURATIONS Community Core",
    tagline: "Astro-powered hub for everything Human × AI",
    description:
      "Foundational portal bundling homepage, project directory, ideas board, and forum with a shared brutalist design language.",
    status: "Building",
    repo: "https://github.com/curationsdev/community",
    tags: ["astro", "design-system", "hub"],
    votes: 32,
    bodyHtml: `<h2>What we're building</h2>
<ul>
  <li>Modular Astro layout with dynamic project cards</li>
  <li>Cloudflare Worker endpoints for votes & submissions</li>
  <li>Durable Objects prototype for async chat</li>
</ul>
<h2>Collaboration wishlist</h2>
<p>Designers, copywriters, vibe coders, prompt engineers</p>`,
    links: [
      { label: "Design Figma", url: "https://www.figma.com/community" },
      { label: "Submit Issue", url: "https://github.com/curationsdev/community/issues/new" },
    ],
  },
  {
    slug: "prompt-gallery",
    title: "Prompt Gallery",
    tagline: "Crowdsourced prompt inspiration",
    description:
      "Community showcase for AI prompt recipes with remix metadata, previews, and vibe tags for marketing, storytelling, and creative coding.",
    status: "Ideating",
    repo: "https://github.com/curationsdev/community",
    tags: ["prompts", "gallery", "ai"],
    votes: 18,
  },
  {
    slug: "curations-la",
    title: "Curations LA",
    tagline: "Good vibes only city guide",
    description:
      "Hyperlocal newsletter explorer highlighting good vibes, neighborhood stories, and upcoming IRL gatherings.",
    status: "Live",
    repo: "https://la.curations.cc",
    tags: ["newsletter", "community", "events"],
    votes: 44,
    links: [{ label: "Visit Site", url: "https://la.curations.cc" }],
  },
];

export const getProjectBySlug = (slug: string) =>
  projects.find((project) => project.slug === slug);
