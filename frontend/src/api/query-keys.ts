export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
};

export const micrositeKeys = {
  all: ["microsites"] as const,
  lists: () => [...micrositeKeys.all, "list"] as const,
  list: (page: number, size: number) =>
    [...micrositeKeys.lists(), { page, size }] as const,
  details: () => [...micrositeKeys.all, "detail"] as const,
  detail: (id: string) => [...micrositeKeys.details(), id] as const,
  bySlug: (slug: string) => [...micrositeKeys.all, "slug", slug] as const,
};

export const themeKeys = {
  all: ["themes"] as const,
  lists: () => [...themeKeys.all, "list"] as const,
  detail: (id: string) => [...themeKeys.all, id] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  unread: () => [...notificationKeys.all, "unread"] as const,
};

export const analyticsKeys = {
  all: ["analytics"] as const,
  microsite: (id: string) => [...analyticsKeys.all, id] as const,
};
