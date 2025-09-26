import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { createMockTRPCClient, testBackendConnectivity } from "@/lib/trpc-fallback";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  let baseUrl = '';
  
  // Always use local development server in development mode
  if (__DEV__) {
    if (typeof window !== 'undefined') {
      // For web platform in development, use current origin
      baseUrl = `${window.location.origin}/api`;
    } else {
      // For mobile in development, use localhost (this will be tunneled by Expo)
      baseUrl = 'http://localhost:8081/api';
    }
  } else {
    // In production, use the production API URL
    baseUrl = process.env.EXPO_PUBLIC_API_URL || "https://zvfley8yoowhncate9z5.rork.app/api";
  }
  
  // Ensure baseUrl doesn't end with a slash to avoid double slashes
  baseUrl = baseUrl.replace(/\/$/, '');
  
  if (__DEV__) {
    console.log('🔍 tRPC getBaseUrl computed:', baseUrl);
    console.log('🔍 EXPO_PUBLIC_API_URL env var:', process.env.EXPO_PUBLIC_API_URL || 'NOT SET');
    console.log('🔍 window.location.origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
    console.log('🔍 Environment mode:', __DEV__ ? 'development' : 'production');
    console.log('🔍 Development mode detected, using local backend');
  }
  
  return baseUrl;
};



// Custom fetch with retry logic and backend testing
const fetchWithRetry = async (input: URL | RequestInfo, init?: RequestInit, maxRetries = 2): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  // Validate URL input
  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new Error('Invalid URL provided to tRPC fetch');
  }
  
  if (__DEV__) {
    console.log('🔍 tRPC fetch URL:', url);
    console.log('🔍 tRPC fetch options:', {
      method: init?.method,
      headers: init?.headers,
      body: init?.body ? 'present' : 'none'
    });
  }
  
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
      
      if (__DEV__) {
        console.log(`✅ tRPC response status (attempt ${attempt + 1}):`, response.status);
        console.log('✅ tRPC response content-type:', response.headers.get('content-type'));
      }
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/html')) {
        const htmlText = await response.text();
        if (__DEV__) {
          console.error('❌ Received HTML response instead of JSON:', htmlText.substring(0, 200));
        }
        throw new Error(`Backend returned HTML instead of JSON. Backend may not be deployed properly.`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        if (__DEV__) {
          console.error('❌ tRPC HTTP error:', response.status, errorText);
        }
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        // Retry on server errors (5xx) if we have attempts left
        if (attempt < maxRetries) {
          if (__DEV__) {
            console.log(`🔄 Retrying request (attempt ${attempt + 2}/${maxRetries + 1})...`);
          }
          await new Promise((resolve) => setTimeout(() => resolve(undefined), 1500));
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ tRPC fetch error (attempt ${attempt + 1}):`, error);
      }
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (attempt < maxRetries) {
            if (__DEV__) {
              console.log(`🔄 Retrying after timeout (attempt ${attempt + 2}/${maxRetries + 1})...`);
            }
            await new Promise((resolve) => setTimeout(() => resolve(undefined), 2000));
            continue;
          }
          throw new Error('Request timeout - backend may be unavailable');
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          if (attempt < maxRetries) {
            if (__DEV__) {
              console.log(`🔄 Retrying network error (attempt ${attempt + 2}/${maxRetries + 1})...`);
            }
            await new Promise((resolve) => setTimeout(() => resolve(undefined), 2000));
            continue;
          }
          
          throw new Error('Network connectivity issue - check internet connection.');
        }
      }
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      if (__DEV__) {
        console.log(`🔄 Retrying after error (attempt ${attempt + 2}/${maxRetries + 1})...`);
      }
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 2000));
    }
  }
  
  throw new Error('Max retries exceeded');
};

// Create the real tRPC client
const createRealTRPCClient = () => createTRPCClient<AppRouter>({
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

// Initialize with mock client, will be replaced if backend is available
let _trpcClient: any = createMockTRPCClient();
let _backendAvailable = false;

// Export the client (will be either real or mock)
export const trpcClient = new Proxy({} as any, {
  get(target, prop) {
    return _trpcClient[prop];
  }
});

// Test backend connectivity and switch to real client if available
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    const baseUrl = getBaseUrl();
    console.log('🔍 Testing backend connectivity...');
    
    const isBackendAvailable = await testBackendConnectivity(baseUrl);
    
    if (isBackendAvailable) {
      console.log('✅ Backend is available, switching to real tRPC client');
      try {
        _trpcClient = createRealTRPCClient();
        _backendAvailable = true;
        
        // Test tRPC specifically
        const result = await _trpcClient.debug.ping.query();
        console.log('✅ tRPC connectivity test successful:', result);
      } catch (error) {
        console.warn('⚠️ Backend available but tRPC failed, using mock client:', error instanceof Error ? error.message : 'Unknown error');
        _trpcClient = createMockTRPCClient();
        _backendAvailable = false;
      }
    } else {
      console.warn('⚠️ Backend not available, using mock tRPC client');
      if (__DEV__) {
        console.warn('⚠️ This is expected in development if the backend is not running');
        console.warn('⚠️ The app will still work with mock data');
      }
    }
  }, 1000);
}

// Export function to check if backend is available
export const isBackendAvailable = () => _backendAvailable;