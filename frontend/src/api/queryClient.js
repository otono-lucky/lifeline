import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global defaults – tune these
      staleTime: 1000 * 60 * 5,      // 5 minutes – very common
      gcTime: 1000 * 60 * 30,        // 30 minutes garbage collection
      retry: 1,                      // retry once
      refetchOnWindowFocus: false,   // usually false for better UX
      refetchOnReconnect: false,
      // You can override per query
    },
    mutations: {
      retry: 0, // most mutations shouldn't retry
    },
  },
});