

// Mock tRPC client that returns fallback data when backend is unavailable
export const createMockTRPCClient = () => {
  const mockClient = {
    debug: {
      ping: {
        query: async () => ({ message: 'pong (mock)', timestamp: new Date().toISOString() })
      }
    },
    example: {
      hi: {
        query: async () => ({ message: 'Hello from mock backend!' })
      }
    },
    chat: {
      saveChat: {
        mutate: async (data: any) => {
          console.warn('🔄 Mock: Chat save attempted but backend unavailable');
          return { success: false, message: 'Backend unavailable' };
        }
      },
      getHistory: {
        query: async () => {
          console.warn('🔄 Mock: Chat history requested but backend unavailable');
          return [];
        }
      }
    },
    quiz: {
      saveResponse: {
        mutate: async (data: any) => {
          console.warn('🔄 Mock: Quiz response save attempted but backend unavailable');
          return { success: false, message: 'Backend unavailable' };
        }
      },
      getHistory: {
        query: async () => {
          console.warn('🔄 Mock: Quiz history requested but backend unavailable');
          return [];
        }
      }
    },
    user: {
      createUser: {
        mutate: async (data: any) => {
          console.warn('🔄 Mock: User creation attempted but backend unavailable');
          return { success: false, message: 'Backend unavailable' };
        }
      },
      getUser: {
        query: async () => {
          console.warn('🔄 Mock: User data requested but backend unavailable');
          return null;
        }
      },
      updateSubscription: {
        mutate: async (data: any) => {
          console.warn('🔄 Mock: Subscription update attempted but backend unavailable');
          return { success: false, message: 'Backend unavailable' };
        }
      },
      deleteAccount: {
        mutate: async (data: any) => {
          console.warn('🔄 Mock: Account deletion attempted but backend unavailable');
          return { success: false, message: 'Backend unavailable' };
        }
      }
    },
    stripe: {
      createCheckoutSession: {
        mutate: async (data: any) => {
          console.warn('🔄 Mock: Stripe checkout attempted but backend unavailable');
          throw new Error('Payment system unavailable - backend not connected');
        }
      },
      getSubscription: {
        query: async () => {
          console.warn('🔄 Mock: Subscription data requested but backend unavailable');
          return null;
        }
      },
      cancelSubscription: {
        mutate: async (data: any) => {
          console.warn('🔄 Mock: Subscription cancellation attempted but backend unavailable');
          return { success: false, message: 'Backend unavailable' };
        }
      }
    },
    test: {
      database: {
        query: async () => {
          console.warn('🔄 Mock: Database test requested but backend unavailable');
          return { success: false, message: 'Backend unavailable' };
        }
      }
    }
  };

  return mockClient as any;
};

// Test if backend is available
export const testBackendConnectivity = async (baseUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseUrl}/hello`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
};