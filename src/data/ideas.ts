export interface Idea {
  slug: string;
  title: string;
  description: string;
  categories: string[];
  votes: number;
}

export const ideas: Idea[] = [
  {
    slug: "launch-vibe-check",
    title: "Weekly Vibe Check",
    description:
      "Async forum thread with curated question prompts where humans + AI riff together. Publish top insights to Gibber newsletter.",
    categories: ["community", "content"],
    votes: 27,
  },
  {
    slug: "ai-studio-sessions",
    title: "AI Studio Sessions",
    description:
      "Livestream-friendly workflow for pairing community members with AI copilots to build marketing experiments in real time.",
    categories: ["events", "ai"],
    votes: 35,
  },
  {
    slug: "open-spec-library",
    title: "Open Spec Library",
    description:
      "Curated prompts, creative briefs, and marketing assets with remix rights and attribution back to contributors.",
    categories: ["prompts", "library"],
    votes: 40,
  },
];
