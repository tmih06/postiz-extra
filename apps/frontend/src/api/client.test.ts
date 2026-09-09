import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApiClient } from './client';

describe('browser-safe API client seam', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('fetches self user profile with credentials include and correct headers', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'u1',
        email: 'user@example.com',
        name: 'Test Creator',
        orgId: 'org1',
      }),
    });

    const user = await client.getSelf();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/user/self',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      })
    );
    expect(user.email).toBe('user@example.com');
  });

  it('logs in against /auth/login with LOCAL provider and extracts error message on 400', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Invalid credentials',
    });

    await expect(
      client.login({ email: 'bad@example.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          email: 'bad@example.com',
          password: 'wrong',
          provider: 'LOCAL',
        }),
      })
    );
  });

  it('fetches customers (profile identities) and integrations (channels)', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        { id: 'c1', name: 'Brand Alpha', orgId: 'org1' },
        { id: 'c2', name: 'Brand Beta', orgId: 'org1' },
      ],
    });

    const customers = await client.getCustomers();
    expect(fetchMock).toHaveBeenCalledWith('/api/integrations/customers', expect.anything());
    expect(customers).toHaveLength(2);
    expect(customers[0].name).toBe('Brand Alpha');

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        integrations: [
          {
            id: 'int1',
            name: 'YouTube Alpha',
            providerIdentifier: 'youtube',
            customerId: 'c1',
            disabled: false,
            refreshNeeded: false,
          },
          {
            id: 'int2',
            name: 'TikTok Ungrouped',
            providerIdentifier: 'tiktok',
            customerId: null,
            disabled: false,
            refreshNeeded: false,
          },
        ],
      }),
    });

    const res = await client.getIntegrations();
    expect(fetchMock).toHaveBeenCalledWith('/api/integrations/list', expect.anything());
    expect(res.integrations).toHaveLength(2);
    expect(res.integrations[1].customerId).toBeNull();
  });

  it('queries next-slot suggestion truthfully without claiming atomic reservation', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ date: '2026-09-15T14:00:00.000Z' }),
    });

    const slot = await client.findNextSlot('int1');
    expect(fetchMock).toHaveBeenCalledWith('/api/posts/find-slot/int1', expect.anything());
    expect(slot.date).toBe('2026-09-15T14:00:00.000Z');
  });

  it('submits post with explicit channel selection and surface structured validation error on failure', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () =>
        JSON.stringify({
          name: 'PostValidationException',
          message: 'Post is too long for X',
          provider: 'x',
          error: 'post is too long, please fix it',
        }),
    });

    const postPayload = {
      type: 'draft' as const,
      date: '2026-09-12T10:00:00.000Z',
      shortLink: false,
      tags: [],
      posts: [
        {
          integration: { id: 'int1' },
          value: [{ content: 'Hello world', image: [] }],
          settings: {},
        },
      ],
    };

    await expect(client.createPost(postPayload)).rejects.toThrow('post is too long');
  });

  it('uploads media via FormData to /media/upload-simple', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'med1',
        path: '/uploads/image.png',
        name: 'image.png',
      }),
    });

    const dummyFile = new File(['dummy'], 'image.png', { type: 'image/png' });
    const media = await client.uploadMedia(dummyFile);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/media/upload-simple',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: expect.any(FormData),
      })
    );
    expect(media.id).toBe('med1');
    expect(media.path).toBe('/uploads/image.png');
  });

  it('triggers onUnauthorized callback on 401 response', async () => {
    const onUnauthorized = vi.fn();
    const client = createApiClient({ baseUrl: '/api', onUnauthorized });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    await expect(client.getSelf()).rejects.toThrow();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('formats query parameters correctly for getPosts and getPostsList', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await client.getPosts({
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      customer: 'cust1',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts?startDate=2026-09-01&endDate=2026-09-30&customer=cust1',
      expect.anything()
    );

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ posts: [], total: 0 }),
    });

    await client.getPostsList({
      page: 2,
      limit: 10,
      state: 'scheduled',
      customer: 'cust1',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts/list?page=2&limit=10&state=scheduled&customer=cust1',
      expect.anything()
    );
  });

  it('supports deletePost and changePostDate', async () => {
    const client = createApiClient({ baseUrl: '/api' });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await client.deletePost('grp-123');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts/grp-123',
      expect.objectContaining({ method: 'DELETE' })
    );

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await client.changePostDate('post-1', '2026-09-20T12:00:00Z', 'schedule');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/posts/post-1/date',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          date: '2026-09-20T12:00:00Z',
          action: 'schedule',
          republish: false,
        }),
      })
    );
  });
});
