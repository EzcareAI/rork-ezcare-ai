import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  let baseUrl = '';
  
  // If EXPO_PUBLIC_API_URL is set, use it (production)
  if (process.env.EXPO_PUBLIC_API_URL) {
    baseUrl = process.env.EXPO_PUBLIC_API_URL;
  } else if (typeof window !== 'undefined') {
    // For web platform in development, use current origin
    baseUrl = `${window.location.origin}/api`;
  } else {
    // For mobile in development
    baseUrl = "https://zvfley8yoowhncate9z5.rork.app/api";
  }
  
  console.log('tRPC getBaseUrl computed:', baseUrl);
  console.log('EXPO_PUBLIC_API_URL env var:', process.env.EXPO_PUBLIC_API_URL || 'NOT SET (using local)');
  console.log('window.location.origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
  console.log('Environment mode:', __DEV__ ? 'development' : 'production');
  
  return baseUrl;
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/trpc`,
      transformer: superjson,
      headers: async () => {
        // Get session from Supabase
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        
        return {
          authorization: session?.user?.id ? `Bearer ${session.user.id}` : '',
        };
      },
      fetch: async (url, options) => {
        if (__DEV__) {
          console.log('tRPC fetch URL:', url);
        }
        
        try {
          const response = await fetch(url, options);
          
          if (__DEV__) {
            console.log('tRPC response status:', response.status);
            console.log('tRPC response content-type:', response.headers.get('content-type'));
          }
          
          // Check if response is HTML (error page) instead of JSON
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('text/html')) {
            const htmlText = await response.text();
            console.error('Received HTML response instead of JSON:', htmlText.substring(0, 200));
            throw new Error(`tRPC fetch error: API endpoint returned HTML instead of JSON. Check if backend is properly mounted at ${url}`);
          }
          
          return response;
        } catch (error) {
          console.error('tRPC fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});