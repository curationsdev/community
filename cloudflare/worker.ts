export interface Env {
  CURATIONS_VOTES: KVNamespace;
  CURATIONS_IDEAS: KVNamespace;
  CURATIONS_FORUM: DurableObjectNamespace;
}

interface VotePayload {
  id: string;
}

interface IdeaPayload {
  title: string;
  description: string;
  categories?: string[];
}

interface ForumPayload {
  channel: string;
  title: string;
  message: string;
  author?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/vote" && request.method === "POST") {
      const payload = (await request.json()) as VotePayload;
      if (!payload.id) {
        return Response.json({ error: "Missing 'id' in vote payload" }, { status: 400 });
      }
      const key = payload.id;
      const current = Number((await env.CURATIONS_VOTES.get(key)) ?? "0");
      const total = current + 1;
      await env.CURATIONS_VOTES.put(key, String(total));
      return Response.json({ id: key, votes: total });
    }

    if (url.pathname === "/api/idea" && request.method === "POST") {
      const payload = (await request.json()) as IdeaPayload;
      const id = crypto.randomUUID();
      const record = {
        id,
        title: payload.title,
        description: payload.description,
        categories: payload.categories ?? [],
        votes: 0,
        createdAt: new Date().toISOString(),
      };
      await env.CURATIONS_IDEAS.put(id, JSON.stringify(record));
      return Response.json(record, { status: 201 });
    }

    if (url.pathname.startsWith("/api/forum")) {
      const id = env.CURATIONS_FORUM.idFromName("curations-forum");
      const stub = env.CURATIONS_FORUM.get(id);
      return stub.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};

export class ForumDurableObject {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const storage = this.state.storage;

    if (request.method === "POST") {
      const payload = (await request.json()) as ForumPayload;
      const channel = payload.channel ?? "general";
      const posts = ((await storage.get<ForumPayload[]>(channel)) ?? []) as ForumPayload[];
      const entry = {
        id: crypto.randomUUID(),
        channel,
        title: payload.title,
        message: payload.message,
        author: payload.author ?? "Anonymous",
        createdAt: new Date().toISOString(),
      };
      posts.push(entry);
      await storage.put(channel, posts);
      return Response.json(entry, { status: 201 });
    }

    if (url.searchParams.has("channel")) {
      const channel = url.searchParams.get("channel") ?? "general";
      const posts = ((await storage.get<ForumPayload[]>(channel)) ?? []) as ForumPayload[];
      return Response.json(posts);
    }

    const allKeys = await storage.list<ForumPayload[]>({
      start: undefined,
    });
    const result = Array.from(allKeys.entries()).map(([channel, posts]) => ({ channel, posts }));
    return Response.json(result);
  }
}
