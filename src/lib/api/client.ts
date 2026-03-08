/**
 * DigiWebDex API Client
 * Replaces Supabase SDK with direct REST API calls to self-hosted backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken(): void {
    const stored = localStorage.getItem('auth_token');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.token = parsed.access_token || stored;
      } catch {
        this.token = stored;
      }
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', JSON.stringify({ access_token: token }));
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, params } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(this.buildUrl(endpoint, params), {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: data.error || data.message || 'Request failed',
            code: String(response.status),
          },
        };
      }

      return {
        data: data.data !== undefined ? data.data : data,
        error: null,
        count: data.count,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  // Auth methods
  auth = {
    signUp: async (email: string, password: string, fullName?: string) => {
      const result = await this.request<{ user: unknown; token: string }>('/auth/register', {
        method: 'POST',
        body: { email, password, full_name: fullName },
      });
      if (result.data && (result.data as { token?: string }).token) {
        this.setToken((result.data as { token: string }).token);
      }
      return result;
    },

    signIn: async (email: string, password: string) => {
      const result = await this.request<{ user: unknown; token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      if (result.data && (result.data as { token?: string }).token) {
        this.setToken((result.data as { token: string }).token);
      }
      return result;
    },

    signOut: async () => {
      const result = await this.request('/auth/logout', { method: 'POST' });
      this.setToken(null);
      return result;
    },

    getUser: async () => {
      return this.request<{ user: unknown }>('/auth/me');
    },

    getSession: async () => {
      const token = this.getToken();
      if (!token) {
        return { data: { session: null }, error: null };
      }
      const result = await this.request<{ user: unknown }>('/auth/me');
      if (result.data) {
        return { data: { session: { user: result.data, access_token: token } }, error: null };
      }
      return { data: { session: null }, error: result.error };
    },

    resetPasswordForEmail: async (email: string) => {
      return this.request('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
    },

    updateUser: async (data: { password?: string; email?: string }) => {
      return this.request('/auth/update-password', {
        method: 'POST',
        body: data,
      });
    },

    onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
      // Check initial state
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.request('/auth/me').then((result) => {
          if (result.data) {
            callback('SIGNED_IN', { user: result.data, access_token: token });
          } else {
            callback('SIGNED_OUT', null);
          }
        });
      } else {
        setTimeout(() => callback('SIGNED_OUT', null), 0);
      }

      // Listen for storage changes (cross-tab auth sync)
      const storageListener = (e: StorageEvent) => {
        if (e.key === 'auth_token') {
          if (e.newValue) {
            this.loadToken();
            this.request('/auth/me').then((result) => {
              if (result.data) {
                callback('SIGNED_IN', { user: result.data, access_token: e.newValue });
              }
            });
          } else {
            this.setToken(null);
            callback('SIGNED_OUT', null);
          }
        }
      };

      window.addEventListener('storage', storageListener);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              window.removeEventListener('storage', storageListener);
            },
          },
        },
      };
    },
  };

  // Database query builder
  from(table: string): QueryBuilder {
    return new QueryBuilder(this, table);
  }

  // Direct request method for custom endpoints
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Functions (edge function replacement)
  functions = {
    invoke: async <T>(functionName: string, options?: { body?: unknown }) => {
      return this.request<T>(`/functions/${functionName}`, {
        method: 'POST',
        body: options?.body,
      });
    },
  };

  // Storage
  storage = {
    from: (bucket: string) => new StorageBucket(this, bucket),
  };

  // Realtime (WebSocket)
  channel(channelName: string): RealtimeChannel {
    return new RealtimeChannel(channelName);
  }
}

// Query Builder for database-like operations
class QueryBuilder {
  private client: ApiClient;
  private table: string;
  private selectColumns: string = '*';
  private filters: Array<{ column: string; operator: string; value: unknown }> = [];
  private orderByColumn: string | null = null;
  private orderAscending: boolean = true;
  private limitCount: number | null = null;
  private offsetCount: number | null = null;
  private isSingle: boolean = false;
  private operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private insertData: unknown = null;

  constructor(client: ApiClient, table: string) {
    this.client = client;
    this.table = table;
  }

  select(columns: string = '*'): this {
    this.selectColumns = columns;
    this.operation = 'select';
    return this;
  }

  insert(data: unknown): this {
    this.operation = 'insert';
    this.insertData = data;
    return this;
  }

  update(data: unknown): this {
    this.operation = 'update';
    this.insertData = data;
    return this;
  }

  upsert(data: unknown, options?: { onConflict?: string }): this {
    this.operation = 'upsert';
    this.insertData = { data, onConflict: options?.onConflict };
    return this;
  }

  delete(): this {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, value: string): this {
    this.filters.push({ column, operator: 'like', value });
    return this;
  }

  ilike(column: string, value: string): this {
    this.filters.push({ column, operator: 'ilike', value });
    return this;
  }

  in(column: string, values: unknown[]): this {
    this.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  is(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'is', value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orderByColumn = column;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): this {
    this.offsetCount = from;
    this.limitCount = to - from + 1;
    return this;
  }

  single(): this {
    this.isSingle = true;
    this.limitCount = 1;
    return this;
  }

  maybeSingle(): this {
    this.isSingle = true;
    this.limitCount = 1;
    return this;
  }

  async then<T>(resolve: (value: ApiResponse<T>) => void): Promise<void> {
    const result = await this.execute<T>();
    resolve(result);
  }

  private async execute<T>(): Promise<ApiResponse<T>> {
    const params: Record<string, string | number | boolean | undefined> = {
      select: this.selectColumns,
    };

    // Add filters
    this.filters.forEach((filter, index) => {
      params[`filter_${index}`] = `${filter.column}.${filter.operator}.${JSON.stringify(filter.value)}`;
    });

    if (this.orderByColumn) {
      params.order = `${this.orderByColumn}.${this.orderAscending ? 'asc' : 'desc'}`;
    }

    if (this.limitCount !== null) {
      params.limit = this.limitCount;
    }

    if (this.offsetCount !== null) {
      params.offset = this.offsetCount;
    }

    let endpoint = `/data/${this.table}`;
    let method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET';
    let body: unknown = undefined;

    switch (this.operation) {
      case 'select':
        method = 'GET';
        break;
      case 'insert':
        method = 'POST';
        body = this.insertData;
        break;
      case 'update':
        method = 'PATCH';
        body = { data: this.insertData, filters: this.filters };
        break;
      case 'upsert':
        method = 'PUT';
        body = this.insertData;
        break;
      case 'delete':
        method = 'DELETE';
        body = { filters: this.filters };
        break;
    }

    const result = await (this.client as unknown as { request: <T>(endpoint: string, options: RequestOptions) => Promise<ApiResponse<T>> }).request<T>(endpoint, { method, params, body });

    if (this.isSingle && result.data) {
      const dataArray = result.data as unknown as unknown[];
      if (Array.isArray(dataArray)) {
        return {
          ...result,
          data: dataArray[0] as T || null,
        };
      }
    }

    return result;
  }
}

// Storage bucket for file operations
class StorageBucket {
  private client: ApiClient;
  private bucket: string;

  constructor(client: ApiClient, bucket: string) {
    this.client = client;
    this.bucket = bucket;
  }

  async upload(path: string, file: File | Blob, options?: { upsert?: boolean }): Promise<ApiResponse<{ path: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    if (options?.upsert) {
      formData.append('upsert', 'true');
    }

    const token = this.client.getToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/storage/${this.bucket}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      return { data: null, error: { message: data.error || 'Upload failed' } };
    }

    return { data: { path: data.path }, error: null };
  }

  async download(path: string): Promise<ApiResponse<Blob>> {
    const token = this.client.getToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/storage/${this.bucket}/${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      return { data: null, error: { message: 'Download failed' } };
    }

    const blob = await response.blob();
    return { data: blob, error: null };
  }

  async remove(paths: string[]): Promise<ApiResponse<void>> {
    return this.client.delete(`/storage/${this.bucket}?paths=${paths.join(',')}`);
  }

  getPublicUrl(path: string): { data: { publicUrl: string } } {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    return {
      data: {
        publicUrl: `${baseUrl}/storage/${this.bucket}/public/${path}`,
      },
    };
  }
}

// Realtime channel for WebSocket
class RealtimeChannel {
  private channelName: string;
  private ws: WebSocket | null = null;
  private handlers: Map<string, ((payload: unknown) => void)[]> = new Map();

  constructor(channelName: string) {
    this.channelName = channelName;
  }

  on(
    event: string,
    filter: { event: string; schema: string; table?: string } | string,
    callback: (payload: unknown) => void
  ): this {
    const eventKey = typeof filter === 'string' ? filter : `${filter.schema}.${filter.table || '*'}.${filter.event}`;
    if (!this.handlers.has(eventKey)) {
      this.handlers.set(eventKey, []);
    }
    this.handlers.get(eventKey)!.push(callback);
    return this;
  }

  subscribe(): this {
    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:3001') + '/ws';
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.ws?.send(JSON.stringify({
          type: 'subscribe',
          channel: this.channelName,
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const eventKey = `${data.schema || 'public'}.${data.table || '*'}.${data.event || '*'}`;
          
          // Call matching handlers
          this.handlers.forEach((callbacks, key) => {
            if (key === eventKey || key.includes('*')) {
              callbacks.forEach((cb) => cb(data));
            }
          });
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }

    return this;
  }

  unsubscribe(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
  }
}

// Create and export the API client instance
export const api = new ApiClient(API_BASE_URL);

// Export for backward compatibility with existing code that imports 'supabase'
export const supabase = api;

// Type exports
export type { ApiResponse, RequestOptions };
