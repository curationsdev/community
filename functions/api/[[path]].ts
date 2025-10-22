// Cloudflare Pages Function to proxy API requests to Worker
// This file handles all /api/* routes and forwards them to the Worker

interface Env {
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

export async function onRequest(context: {
  request: Request;
  env: Env;
  params: { path?: string };
}): Promise<Response> {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  // Reconstruct the full path including /api prefix
  const path = params.path || '';
  const fullPath = `/api/${path}`;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  // Handle vote POST (increment)
  if (fullPath === '/api/vote' && request.method === 'POST') {
    try {
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
      const current = Number((await env.CURATIONS_VOTES.get(key)) ?? '0');
      const total = current + 1;
      await env.CURATIONS_VOTES.put(key, String(total));
      return new Response(JSON.stringify({ id: key, votes: total }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (error) {
      console.error('Vote error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process vote' }),
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

  // Handle vote GET (fetch current counts)
  if (fullPath === '/api/votes' && request.method === 'GET') {
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

      return new Response(JSON.stringify(votes), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
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
  if (fullPath.startsWith('/api/vote/') && request.method === 'GET') {
    try {
      const id = fullPath.split('/api/vote/')[1];
      const count = await env.CURATIONS_VOTES.get(id);
      return new Response(
        JSON.stringify({
          id,
          count: count ? Number(count) : 0,
          exists: count !== null,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      console.error('Vote fetch error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch vote' }),
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

  // Handle idea POST (create new)
  if (fullPath === '/api/idea' && request.method === 'POST') {
    try {
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
      return new Response(JSON.stringify(record), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (error) {
      console.error('Idea submission error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit idea' }),
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

  // Handle ideas GET (fetch all)
  if (fullPath === '/api/ideas' && request.method === 'GET') {
    try {
      const list = await env.CURATIONS_IDEAS.list();
      const ideas = [];
      for (const key of list.keys) {
        const data = await env.CURATIONS_IDEAS.get(key.name);
        if (data) {
          ideas.push(JSON.parse(data));
        }
      }
      return new Response(
        JSON.stringify(
          ideas.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        ),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      console.error('Error fetching ideas:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch ideas' }),
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

  // Handle forum routes (if Durable Objects are enabled)
  if (fullPath.startsWith('/api/forum')) {
    // Check if Durable Objects are available
    if (!env.CURATIONS_FORUM) {
      return new Response(
        JSON.stringify({
          error: 'Forum feature not available. Durable Objects need to be enabled.',
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    try {
      const id = env.CURATIONS_FORUM.idFromName('curations-forum');
      const stub = env.CURATIONS_FORUM.get(id);
      const response = await stub.fetch(request);
      
      // Add CORS headers to the response
      const newHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(corsHeaders)) {
        newHeaders.set(key, value);
      }
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      console.error('Forum error:', error);
      return new Response(
        JSON.stringify({ error: 'Forum service unavailable' }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  }

  // Not found
  return new Response(
    JSON.stringify({ error: 'Not found', path: fullPath }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}
