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

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Handle vote POST (increment)
    if (url.pathname === "/api/vote" && request.method === "POST") {
      const payload = (await request.json()) as VotePayload;
      if (!payload.id) {
        return new Response(
          JSON.stringify({ error: "Missing 'id' in vote payload" }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
      const key = payload.id;
      const current = Number((await env.CURATIONS_VOTES.get(key)) ?? "0");
      const total = current + 1;
      await env.CURATIONS_VOTES.put(key, String(total));
      return new Response(
        JSON.stringify({ id: key, votes: total }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
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
        
        return new Response(
          JSON.stringify(votes),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        console.error('Error fetching votes:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch votes' }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // Handle debug endpoint (check specific vote)
    if (url.pathname.startsWith("/api/vote/") && request.method === "GET") {
      const id = url.pathname.split("/api/vote/")[1];
      const count = await env.CURATIONS_VOTES.get(id);
      return new Response(
        JSON.stringify({ id, count: count ? Number(count) : 0, exists: count !== null }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
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
      return new Response(
        JSON.stringify(record),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
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
      return new Response(
        JSON.stringify(ideas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (url.pathname.startsWith("/api/forum")) {
      const id = env.CURATIONS_FORUM.idFromName("curations-forum");
      const stub = env.CURATIONS_FORUM.get(id);
      const response = await stub.fetch(request);
      
      // Add CORS headers to forum responses
      const newHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(corsHeaders)) {
        newHeaders.set(key, value);
      }
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
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
      return new Response(
        JSON.stringify(entry),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (url.searchParams.has("channel")) {
      const channel = url.searchParams.get("channel") ?? "general";
      const posts = ((await storage.get<ForumPayload[]>(channel)) ?? []) as ForumPayload[];
      return new Response(
        JSON.stringify(posts),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const allKeys = await storage.list<ForumPayload[]>({});
    const result = Array.from(allKeys.entries()).map(([channel, posts]) => ({ channel, posts }));
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
