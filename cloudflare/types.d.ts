export {};

/**
 * Minimal Cloudflare Workers runtime interfaces used by the CURATIONS worker.
 * These definitions cover just the surface area referenced in `cloudflare/worker.ts`
 * so local development and type-checking do not depend on the `@cloudflare/workers-types`
 * package, which simplifies CI in environments without npm registry access.
 */
declare global {
  interface KVNamespace {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
      keys: Array<{ name: string }>;
      list_complete?: boolean;
      cursor?: string;
    }>;
    delete(key: string): Promise<void>;
  }

  interface DurableObjectNamespace {
    idFromName(name: string): DurableObjectId;
    get(id: DurableObjectId): DurableObjectStub;
  }

  interface DurableObjectId {
    toString(): string;
  }

  interface DurableObjectStub {
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
  }

  interface DurableObjectState {
    storage: DurableObjectStorage;
    waitUntil(promise: Promise<unknown>): void;
  }

  interface DurableObjectStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    put<T = unknown>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<boolean>;
    list<T = unknown>(options?: {
      prefix?: string;
      start?: string;
      end?: string;
      limit?: number;
    }): Promise<Map<string, T>>;
  }
}
