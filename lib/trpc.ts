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
    // For mobile in development, fallback to production URL
    baseUrl = "https://zvfley8yoowhncate9z5.rork.app/api";
  }
  
  // Ensure baseUrl doesn't end with a slash to avoid double slashes
  baseUrl = baseUrl.replace(/\/$/, '');
  
  console.log('🔍 tRPC getBaseUrl computed:', baseUrl);
  console.log('🔍 EXPO_PUBLIC_API_URL env var:', process.env.EXPO_PUBLIC_API_URL || 'NOT SET');
  console.log('🔍 window.location.origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
  console.log('🔍 Environment mode:', __DEV__ ? 'development' : 'production');
  
  return baseUrl;
};

// Test backend connectivity
const testBackendConnectivity = async (baseUrl: string): Promise<boolean> => {
  try {
    console.log('🔍 Testing backend connectivity to:', `${baseUrl}/hello`);
    const response = await fetch(`${baseUrl}/hello`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connectivity test successful:', data);
      return true;
    } else {
      console.error('❌ Backend connectivity test failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connectivity test error:', error);
    return false;
  }
};

// Custom fetch with retry logic and backend testing
const fetchWithRetry = async (input: URL | RequestInfo, init?: RequestInit, maxRetries = 2): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  // Validate URL input
  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new Error('Invalid URL provided to tRPC fetch');
  }
  
  console.log('🔍 tRPC fetch URL:', url);
  console.log('🔍 tRPC fetch options:', {
    method: init?.method,
    headers: init?.headers,
    body: init?.body ? 'present' : 'none'
  });
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...init?.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      console.log(`✅ tRPC response status (attempt ${attempt + 1}):`, response.status);
      console.log('✅ tRPC response content-type:', response.headers.get('content-type'));
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/html')) {
        const htmlText = await response.text();
        console.error('❌ Received HTML response instead of JSON:', htmlText.substring(0, 200));
        throw new Error(`API endpoint returned HTML instead of JSON. Backend may not be properly deployed.`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ tRPC HTTP error:', response.status, errorText);
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        // Retry on server errors (5xx) if we have attempts left
        if (attempt < maxRetries) {
          console.log(`🔄 Retrying request (attempt ${attempt + 2}/${maxRetries + 1})...`);
          await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error(`❌ tRPC fetch error (attempt ${attempt + 1}):`, error);
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (attempt < maxRetries) {
            console.log(`🔄 Retrying after timeout (attempt ${attempt + 2}/${maxRetries + 1})...`);
            await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000 * (attempt + 1)));
            continue;
          }
          throw new Error('Request timeout - backend may be unavailable');
        }
        
        if (error.message.includes('Failed to fetch')) {
          if (attempt < maxRetries) {
            console.log(`🔄 Retrying network error (attempt ${attempt + 2}/${maxRetries + 1})...`);
            await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000 * (attempt + 1)));
            continue;
          }
          
          // Test if it's a network issue or backend issue on final attempt
          try {
            const baseUrl = getBaseUrl();
            const backendReachable = await testBackendConnectivity(baseUrl);
            
            if (backendReachable) {
              throw new Error('Backend is reachable but tRPC endpoint failed. Check tRPC configuration.');
            } else {
              // Test general internet connectivity
              const testResponse = await fetch('https://httpbin.org/get', { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
              });
              if (testResponse.ok) {
                throw new Error('Network is working but backend is unreachable. Backend may be down or URL incorrect.');
              } else {
                throw new Error('Network connectivity issue detected.');
              }
            }
          } catch (testError) {
            if (testError instanceof Error && testError.message.includes('Backend is reachable')) {
              throw testError;
            }
            throw new Error('Network connectivity issue - check internet connection.');
          }
        }
      }
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      console.log(`🔄 Retrying after error (attempt ${attempt + 2}/${maxRetries + 1})...`);
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000 * (attempt + 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/trpc`,
      transformer: superjson,
      headers: async () => {
        try {
          // Get session from Supabase
          const { supabase } = await import('@/lib/supabase');
          const { data: { session } } = await supabase.auth.getSession();
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          };
          
          if (session?.user?.id) {
            headers.authorization = `Bearer ${session.user.id}`;
          }
          
          return headers;
        } catch (error) {
          console.warn('Failed to get Supabase session for tRPC headers:', error);
          return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          };
        }
      },
      fetch: fetchWithRetry,
    }),
  ],
});

// Test tRPC connectivity on initialization
if (typeof window !== 'undefined') {
  // Only run on client side
  setTimeout(async () => {
    try {
      console.log('🔍 Testing tRPC connectivity on initialization...');
      const result = await trpcClient.debug.ping.query();
      console.log('✅ tRPC connectivity test successful:', result);
    } catch (error) {
      console.error('❌ tRPC connectivity test failed:', error);
      // Test if backend is reachable at all
      try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/hello`);
        if (response.ok) {
          console.log('✅ Backend is reachable, but tRPC failed');
        } else {
          console.error('❌ Backend is not reachable');
        }
      } catch (backendError) {
        console.error('❌ Backend connectivity test failed:', backendError);
      }
    }
  }, 1000);
}