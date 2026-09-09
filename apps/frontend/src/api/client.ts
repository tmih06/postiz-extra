import type {
  ApiClientConfig,
  ChannelIntegration,
  CreatePostPayload,
  CustomerProfile,
  MediaListResponse,
  PostDetailItem,
  PostGroup,
  PostsListResponse,
  UploadedMedia,
  UserProfile,
} from './types';

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly details: Record<string, unknown> | null;

  constructor(
    message: string,
    status: number,
    details: Record<string, unknown> | null = null
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

export function createApiClient(config: ApiClientConfig = {}) {
  const baseUrl = config.baseUrl ?? '/api';

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    };
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (response.status === 401) {
      config.onUnauthorized?.();
    }

    if (!response.ok) {
      const errorText = await response.text();
      let parsedJson: Record<string, unknown> | null = null;
      try {
        const candidate: unknown = JSON.parse(errorText);
        if (candidate && typeof candidate === 'object') {
          parsedJson = candidate as Record<string, unknown>;
        }
      } catch {
        parsedJson = null;
      }

      const errorMessage =
        (parsedJson?.error as string | undefined) ??
        (parsedJson?.message as string | undefined) ??
        (parsedJson?.msg as string | undefined) ??
        errorText ??
        `Request failed with status ${response.status}`;

      throw new ApiClientError(errorMessage, response.status, parsedJson);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return {
    async getSelf(): Promise<UserProfile> {
      return request<UserProfile>('/user/self');
    },

    async login(credentials: {
      email: string;
      password: string;
    }): Promise<{ success: boolean }> {
      await request<{ register?: boolean }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          ...credentials,
          provider: 'LOCAL',
        }),
      });
      return { success: true };
    },

    async logout(): Promise<void> {
      await request<void>('/user/logout', {
        method: 'POST',
      });
    },

    async getCustomers(): Promise<CustomerProfile[]> {
      return request<CustomerProfile[]>('/integrations/customers');
    },

    async getIntegrations(): Promise<{ integrations: ChannelIntegration[] }> {
      return request<{ integrations: ChannelIntegration[] }>(
        '/integrations/list'
      );
    },

    async findNextSlot(integrationId?: string): Promise<{ date: string }> {
      const endpoint = integrationId
        ? `/posts/find-slot/${encodeURIComponent(integrationId)}`
        : '/posts/find-slot';
      return request<{ date: string }>(endpoint);
    },

    async createPost(payload: CreatePostPayload): Promise<unknown> {
      return request<unknown>('/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getPosts(query: {
      startDate: string;
      endDate: string;
      customer?: string;
    }): Promise<PostGroup[]> {
      const params = new URLSearchParams({
        startDate: query.startDate,
        endDate: query.endDate,
      });
      if (query.customer) {
        params.set('customer', query.customer);
      }
      return request<PostGroup[]>(`/posts?${params.toString()}`);
    },

    async getPostsList(
      query: {
        page?: number;
        limit?: number;
        state?: string;
        customer?: string;
      } = {}
    ): Promise<PostsListResponse> {
      const params = new URLSearchParams();
      if (query.page !== undefined) params.set('page', String(query.page));
      if (query.limit !== undefined) params.set('limit', String(query.limit));
      if (query.state) params.set('state', query.state);
      if (query.customer) params.set('customer', query.customer);

      const queryString = params.toString();
      const endpoint = queryString ? `/posts/list?${queryString}` : '/posts/list';
      return request<PostsListResponse>(endpoint);
    },

    async getPostByGroup(group: string): Promise<PostDetailItem[]> {
      return request<PostDetailItem[]>(
        `/posts/group/${encodeURIComponent(group)}`
      );
    },

    async deletePost(group: string): Promise<void> {
      await request<void>(`/posts/${encodeURIComponent(group)}`, {
        method: 'DELETE',
      });
    },

    async changePostDate(
      id: string,
      date: string,
      action: 'schedule' | 'update' = 'update',
      republish = false
    ): Promise<void> {
      await request<void>(`/posts/${encodeURIComponent(id)}/date`, {
        method: 'PUT',
        body: JSON.stringify({ date, action, republish }),
      });
    },

    async uploadMedia(file: File): Promise<UploadedMedia> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('preventSave', 'false');

      return request<UploadedMedia>('/media/upload-simple', {
        method: 'POST',
        body: formData,
      });
    },

    async getMedia(page = 0, search?: string): Promise<MediaListResponse> {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      return request<MediaListResponse>(`/media?${params.toString()}`);
    },

    async deleteMedia(id: string): Promise<void> {
      await request<void>(`/media/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  };
}
export interface ApiClient {
  getSelf(): Promise<UserProfile>;
  login(credentials: { email: string; password: string }): Promise<{ success: boolean }>;
  logout(): Promise<void>;
  getCustomers(): Promise<CustomerProfile[]>;
  getIntegrations(): Promise<{ integrations: ChannelIntegration[] }>;
  findNextSlot(integrationId?: string): Promise<{ date: string }>;
  createPost(payload: CreatePostPayload): Promise<unknown>;
  getPosts(query: { startDate: string; endDate: string; customer?: string }): Promise<PostGroup[]>;
  getPostsList(query?: { page?: number; limit?: number; state?: string; customer?: string }): Promise<PostsListResponse>;
  getPostByGroup(group: string): Promise<PostDetailItem[]>;
  deletePost(group: string): Promise<void>;
  changePostDate(id: string, date: string, action?: 'schedule' | 'update', republish?: boolean): Promise<void>;
  uploadMedia(file: File): Promise<UploadedMedia>;
  getMedia(page?: number, search?: string): Promise<MediaListResponse>;
  deleteMedia(id: string): Promise<void>;
}
