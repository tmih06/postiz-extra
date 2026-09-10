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

/**
 * Custom error type thrown when an API request fails with a non-2xx HTTP status.
 *
 * Captures HTTP status code and any parsed backend error response payload
 * for structured error handling in UI contexts.
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly details: Record<string, unknown> | null;

  /**
   * Constructs an `ApiClientError` with message, status code, and optional JSON details.
   *
   * @param message - User-facing or backend-provided error description.
   * @param status - HTTP response status code (e.g. 400, 401, 403, 404, 500).
   * @param details - Parsed JSON response body if returned by the backend, or null.
   */
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

/**
 * Factory creating an authenticated API client bound to Postiz backend endpoints.
 *
 * Configures base URL prefix (defaulting to `/api`), credential inclusion (`credentials: 'include'`)
 * for session cookies, unauthorized hooks (`onUnauthorized`), and typed HTTP helper methods.
 *
 * @param config - Optional configuration specifying custom `baseUrl` and `onUnauthorized` callback.
 * @returns An initialized `ApiClient` object providing typed API methods.
 */
export function createApiClient(config: ApiClientConfig = {}) {
  const baseUrl = config.baseUrl ?? '/api';

  /**
   * Internal HTTP fetch wrapper handling URL resolution, JSON headers, credentials, and error parsing.
   *
   * Automatically sets `Accept: application/json` and `Content-Type: application/json` (unless body is `FormData`).
   * Triggers `config.onUnauthorized()` on HTTP 401 status. Throws `ApiClientError` on non-2xx responses.
   * Resolves `undefined` on HTTP 204 No Content, and parsed JSON for other successful responses.
   *
   * @param endpoint - Relative path (e.g. `/user/self` or `/posts`).
   * @param options - Fetch `RequestInit` options including method, headers, and body.
   * @returns Parsed response body of type `T`, or undefined if 204.
   */
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
    /**
     * Fetches current authenticated user profile.
     *
     * @route GET /user/self
     * @returns The active user's profile details (`UserProfile`).
     */
    async getSelf(): Promise<UserProfile> {
      return request<UserProfile>('/user/self');
    },

    /**
     * Authenticates a user with email and password credentials.
     *
     * Sends local credentials and sets session cookies via credentials inclusion.
     *
     * @route POST /auth/login
     * @param credentials - User email and plaintext password.
     * @returns Object with `success: true` on successful authentication.
     */
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

    /**
     * Logs out current authenticated session and clears session state on backend.
     *
     * @route POST /user/logout
     */
    async logout(): Promise<void> {
      await request<void>('/user/logout', {
        method: 'POST',
      });
    },

    /**
     * Retrieves all customer profiles (workspaces/organizations) associated with the user.
     *
     * @route GET /integrations/customers
     * @returns Array of `CustomerProfile` records.
     */
    async getCustomers(): Promise<CustomerProfile[]> {
      return request<CustomerProfile[]>('/integrations/customers');
    },

    /**
     * Retrieves all connected social channel integrations across profiles.
     *
     * @route GET /integrations/list
     * @returns Object containing `integrations` array of `ChannelIntegration`.
     */
    async getIntegrations(): Promise<{ integrations: ChannelIntegration[] }> {
      return request<{ integrations: ChannelIntegration[] }>(
        '/integrations/list'
      );
    },

    /**
     * Finds the next available posting schedule slot based on user posting schedules.
     *
     * @route GET /posts/find-slot or /posts/find-slot/:integrationId
     * @param integrationId - Optional specific channel integration ID to find slot for.
     * @returns Object containing ISO date string of the next available posting slot.
     */
    async findNextSlot(integrationId?: string): Promise<{ date: string }> {
      const endpoint = integrationId
        ? `/posts/find-slot/${encodeURIComponent(integrationId)}`
        : '/posts/find-slot';
      return request<{ date: string }>(endpoint);
    },

    /**
     * Creates or schedules a new post across one or more social channel integrations.
     *
     * @route POST /posts
     * @param payload - Post creation data including content, channel integrations, release date, and settings.
     * @returns Response payload from backend upon post creation.
     */
    async createPost(payload: CreatePostPayload): Promise<unknown> {
      return request<unknown>('/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    /**
     * Retrieves posts within a specified date range, optionally filtered by customer profile ID.
     *
     * Used primarily by calendar and timeline views.
     *
     * @route GET /posts?startDate=...&endDate=...&customer=...
     * @param query - Query parameters containing ISO `startDate`, `endDate`, and optional `customer` ID.
     * @returns Array of grouped posts (`PostGroup[]`).
     */
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

    /**
     * Retrieves paginated list of posts with optional state and customer filtering.
     *
     * Used by list views, scheduled queues, drafts, and publication tables.
     *
     * @route GET /posts/list?...
     * @param query - Pagination and filtering options (page, limit, state, customer).
     * @returns Paginated posts response containing posts list and metadata.
     */
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

    /**
     * Retrieves individual post variants grouped under a single publication group ID.
     *
     * @route GET /posts/group/:group
     * @param group - Unique identifier of the post group.
     * @returns Array of post detail items for each channel variant in the group.
     */
    async getPostByGroup(group: string): Promise<PostDetailItem[]> {
      return request<PostDetailItem[]>(
        `/posts/group/${encodeURIComponent(group)}`
      );
    },

    /**
     * Deletes all posts belonging to the specified post group.
     *
     * @route DELETE /posts/:group
     * @param group - Unique identifier of the post group to delete.
     */
    async deletePost(group: string): Promise<void> {
      await request<void>(`/posts/${encodeURIComponent(group)}`, {
        method: 'DELETE',
      });
    },

    /**
     * Updates scheduled release date/time or reschedules an existing post.
     *
     * @route PUT /posts/:id/date
     * @param id - Post ID to update.
     * @param date - New scheduled release date in ISO string format.
     * @param action - Action type: `'schedule'` or `'update'`. Defaults to `'update'`.
     * @param republish - Whether to trigger republishing if already published. Defaults to `false`.
     */
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

    /**
     * Uploads a media file (image/video) via multipart form data.
     *
     * @route POST /media/upload-simple
     * @param file - File object to upload.
     * @returns Uploaded media item details (`UploadedMedia`) including URL and path.
     */
    async uploadMedia(file: File): Promise<UploadedMedia> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('preventSave', 'false');

      return request<UploadedMedia>('/media/upload-simple', {
        method: 'POST',
        body: formData,
      });
    },

    /**
     * Retrieves paginated media library items with optional search filtering.
     *
     * @route GET /media?page=...&search=...
     * @param page - 0-indexed page number. Defaults to `0`.
     * @param search - Optional filename or tag search filter.
     * @returns Paginated media items and total count.
     */
    async getMedia(page = 0, search?: string): Promise<MediaListResponse> {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      return request<MediaListResponse>(`/media?${params.toString()}`);
    },

    /**
     * Deletes a media item by its unique ID.
     *
     * @route DELETE /media/:id
     * @param id - Media item ID to remove.
     */
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
