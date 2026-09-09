# Clean Component Logic & State Architecture

Patterns for structuring maintainable, predictable, and resilient component logic in React 19 and TanStack Query.

## Architectural Principles

1. **Separation of Presentation and Orchestration**: Decouple visual rendering from network side-effects and global store management.
2. **Predictable Query Lifecycles**: Always account for the four states of asynchronous data: idle, pending, error, and settled.
3. **Immediate User Feedback**: Employ optimistic updates on mutations that modify lists or toggle states.
4. **Encapsulated State**: Extract multi-step UI logic into focused custom hooks.

## Presenter vs. Container Pattern

Split complex views into container components (responsible for queries, mutations, routing) and presenter components (purely props-driven):

```tsx
// Container: PostListContainer.tsx
export function PostListContainer() {
  const { data: posts, isLoading, isError, refetch } = usePostsQuery();
  const deleteMutation = useDeletePostMutation();

  if (isLoading) return <PostListSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!posts?.length) return <EmptyPostsView />;

  return (
    <PostListView
      posts={posts}
      onDelete={(id) => deleteMutation.mutate(id)}
      isDeleting={deleteMutation.isPending}
    />
  );
}

// Presenter: PostListView.tsx
interface PostListViewProps {
  posts: PostItem[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function PostListView({ posts, onDelete, isDeleting }: PostListViewProps) {
  return (
    <div className="divide-y divide-border border rounded-lg border-border">
      {posts.map((post) => (
        <PostRow
          key={post.id}
          post={post}
          onDelete={() => onDelete(post.id)}
          disabled={isDeleting}
        />
      ))}
    </div>
  );
}
```

## Data Fetching with TanStack Query

Standardize query keys and lifecycle management:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 1. Structured Query Keys
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: { status?: string }) => [...postKeys.lists(), filters] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
};

// 2. Query Hook
export function usePostsQuery(filters = {}) {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => api.getPosts(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
```

### Optimistic UI Mutations
When toggling item status or deleting entries, update local cache before awaiting the server response to ensure instant feedback:

```tsx
export function useToggleChannelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.toggleChannel(id, enabled),

    onMutate: async ({ id, enabled }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["channels"] });

      // Snapshot previous value
      const previousChannels = queryClient.getQueryData<Channel[]>(["channels"]);

      // Optimistically update cache
      queryClient.setQueryData<Channel[]>(["channels"], (old = []) =>
        old.map((ch) => (ch.id === id ? { ...ch, disabled: !enabled } : ch))
      );

      return { previousChannels };
    },

    onError: (_err, _variables, context) => {
      // Rollback to previous state on failure
      if (context?.previousChannels) {
        queryClient.setQueryData(["channels"], context.previousChannels);
      }
    },

    onSettled: () => {
      // Re-sync with server
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}
```

## Form Validation with Zod

Define form schema externally with Zod, keeping validation rules declarative and collocated:

```tsx
import { z } from "zod";
import { useState } from "react";

export const createPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(280, "Content exceeds 280 characters"),
  channelIds: z.array(z.string()).min(1, "Select at least one channel"),
  scheduledAt: z.string().datetime({ message: "Valid date required" }).optional(),
});

export type CreatePostFormValues = z.infer<typeof createPostSchema>;

export function usePostForm(onSubmit: (values: CreatePostFormValues) => Promise<void>) {
  const [values, setValues] = useState<Partial<CreatePostFormValues>>({ content: "", channelIds: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createPostSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, setValues, errors, isSubmitting, handleSubmit };
}
```

## Custom UI Hooks

Encapsulate state interactions (e.g. disclosure, debounced inputs, modal triggers) in dedicated hooks:

```tsx
import { useState, useEffect } from "react";

// Modal / Dialog disclosure hook
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);
  return { isOpen, open, close, toggle, setIsOpen };
}

// Input debounce hook for search queries
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
```

## Defensive Rendering & Boundaries

- **Null Safety**: Always provide default values for lists (`items ?? []`) and avoid accessing nested properties on potentially null objects (`channel?.integration?.name`).
- **Scoped Error Boundaries**: Wrap individual widgets or charts in error boundaries so that unexpected API responses degrade gracefully without crashing the global app shell.

## Completion Criteria

Component logic is verified when:
- [ ] View rendering is decoupled from asynchronous query definitions.
- [ ] Data queries handle pending, error, and empty data states without silent failures.
- [ ] Frequent list mutations (delete, status toggle) implement optimistic updates with automatic rollback.
- [ ] Complex multi-step UI logic or modals are encapsulated into testable custom hooks.
