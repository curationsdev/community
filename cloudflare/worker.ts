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

    // Handle vote POST (increment)
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

    // Handle vote GET (fetch current counts)
    if (url.pathname === "/api/votes" && request.method === "GET") {
      try {
        const list = await env.CURATIONS_VOTES.list();
        const votes: Record<string, number> = {};
        
        // Process all keys from the list
        await Promise.all(
          list.keys.map(async (key) => {
            const count = await env.CURATIONS_VOTES.get(key.name);
            if (count !== null) {
              votes[key.name] = Number(count);
            }
          })
        );
        
        return Response.json(votes);
      } catch (error) {
        console.error('Error fetching votes:', error);
        return Response.json({ error: 'Failed to fetch votes' }, { status: 500 });
      }
    }

    // Handle debug endpoint (check specific vote)
    if (url.pathname.startsWith("/api/vote/") && request.method === "GET") {
      const id = url.pathname.split("/api/vote/")[1];
      const count = await env.CURATIONS_VOTES.get(id);
      return Response.json({ id, count: count ? Number(count) : 0, exists: count !== null });
    }

    // Handle idea POST (create new)
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

    // Handle ideas GET (fetch all)
    if (url.pathname === "/api/ideas" && request.method === "GET") {
      const list = await env.CURATIONS_IDEAS.list();
      const ideas = [];
      for (const key of list.keys) {
        const data = await env.CURATIONS_IDEAS.get(key.name);
        if (data) {
          ideas.push(JSON.parse(data));
        }
      }
      return Response.json(ideas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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

    const allKeys = await storage.list<ForumPayload[]>({});
    const result = Array.from(allKeys.entries()).map(([channel, posts]) => ({ channel, posts }));
    return Response.json(result);
  }
}
