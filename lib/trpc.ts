import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";


export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Always use the deployed backend URL
  const deployedUrl = "https://zvfley8yoowhncate9z5.rork.app/api";
  
  // Check if we have a custom API URL from environment
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  const baseUrl = envUrl || deployedUrl;
  
  if (__DEV__) {
    console.log('🔍 tRPC getBaseUrl computed:', baseUrl);
    console.log('🔍 EXPO_PUBLIC_API_URL env var:', envUrl || 'NOT SET');
    console.log('🔍 Using deployed backend URL');
  }
  
  return baseUrl;
};

// Test if the backend URL is accessible
const testBackendUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Test backend connectivity
const testBackendConnectivity = async (): Promise<void> => {
  const baseUrl = getBaseUrl();
  
  if (__DEV__) {
    console.log('🔍 Testing backend connectivity to:', baseUrl);
    
    try {
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      console.log('✅ Backend connectivity test:', response.status, response.statusText);
      
      if (!response.ok) {
        const text = await response.text();
        console.log('📄 Backend response:', text.substring(0, 200));
      }
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
    }
  }
};

// Run connectivity test on module load
if (__DEV__) {
  testBackendConnectivity();
}



// Test if backend is available
const testBackendHealth = async (baseUrl: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${baseUrl}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (__DEV__) {
      console.log(`🔍 Backend health check for ${baseUrl}: ${response.status}`);
    }
    
    return response.ok;
  } catch (error) {
    if (__DEV__) {
      console.log(`❌ Backend health check failed for ${baseUrl}:`, error instanceof Error ? error.message : 'Unknown error');
    }
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
  
  if (__DEV__) {
    console.log('🔍 tRPC fetch URL:', url);
    console.log('🔍 tRPC fetch options:', {
      method: init?.method,
      headers: init?.headers,
      body: init?.body ? 'present' : 'none'
    });
  }
  
  // Test backend health on first tRPC request
  if (typeof input === 'string' && input.includes('/trpc/') && isBackendOnline === null) {
    const baseUrl = input.split('/trpc/')[0];
    const isHealthy = await testBackendHealth(baseUrl);
    isBackendOnline = isHealthy;
    if (!isHealthy) {
      if (__DEV__) {
        console.error('❌ Backend health check failed, requests will likely fail');
      }
      // Don't throw here, let the request proceed and fail naturally
      // This allows the retry logic to work
    }
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
        
        if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed') || error.message.includes('fetch')) {
          if (attempt < maxRetries) {
            if (__DEV__) {
              console.log(`🔄 Retrying network error (attempt ${attempt + 2}/${maxRetries + 1})...`);
            }
            await new Promise((resolve) => setTimeout(() => resolve(undefined), 1000));
            continue;
          }
          
          console.error('🚨 CRITICAL: Backend deployment is not accessible!');
          console.error('🚨 URL attempted:', url);
          console.error('🚨 This indicates the backend is not deployed to Rork platform');
          
          // Try to provide more helpful error information
          const isLocalhost = url.includes('localhost');
          const isRorkDomain = url.includes('.rork.app');
          
          if (isLocalhost) {
            throw new Error('Backend is trying to connect to localhost but should use deployed URL. Check EXPO_PUBLIC_API_URL environment variable.');
          } else if (isRorkDomain) {
            throw new Error('Backend deployment not found on Rork platform. The app may not be properly deployed or the backend may be down.');
          } else {
            throw new Error('Backend deployment not accessible. Check the API URL configuration.');
          }
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

// Backend status tracking
let isBackendOnline: boolean | null = null; // null = not tested yet

// Create the tRPC client with fallback logic
export const trpcClient = createRealTRPCClient(); // Always use real client, let retry logic handle failures

// Export function to check if backend is available
export const isBackendAvailable = () => isBackendOnline ?? false;

// Function to reset client cache (useful for retrying connection)
export const resetTRPCClient = () => {
  isBackendOnline = null;
};

// Function to test and set backend status
export const checkBackendStatus = async (): Promise<boolean> => {
  const baseUrl = getBaseUrl();
  try {
    const isHealthy = await testBackendHealth(baseUrl);
    isBackendOnline = isHealthy;
    if (__DEV__) {
      console.log(isHealthy ? '✅ Backend is online' : '❌ Backend is offline');
    }
    return isHealthy;
  } catch (error) {
    isBackendOnline = false;
    if (__DEV__) {
      console.log('❌ Backend connectivity test failed:', error);
    }
    return false;
  }
};