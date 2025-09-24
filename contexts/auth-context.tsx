import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, User } from '@/lib/supabase';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { trpcClient } from '@/lib/trpc';



export interface AuthState {
  user: User | null; 
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateCredits: (credits: number) => Promise<void>;
  updateSubscription: (plan: string) => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

export const [AuthProvider, useAuth] = createContextHook((): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      // Try to load user via tRPC first (bypasses RLS)
      console.log('Loading user profile via tRPC for userId:', userId);
      const result = await trpcClient.user.getUser.query({ userId });
      if (result.success && result.user) {
        console.log('User loaded successfully via tRPC');
        setUser(result.user);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log('tRPC user fetch failed, trying direct Supabase:', error instanceof Error ? error.message : 'Unknown error');
      // Don't fail completely, continue with Supabase fallback
    }

    try {
      // Fallback to direct Supabase query
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error.message, error.code);
        // If user doesn't exist, try to create it via tRPC
        if (error.code === 'PGRST116') {
          console.log('User profile not found, attempting to create via tRPC');
          try {
            const createResult = await trpcClient.user.createUser.mutate({
              userId,
              email: '', // Will be filled by the auth trigger
            });
            if (createResult.success && createResult.user) {
              setUser(createResult.user);
              setIsLoading(false);
              return;
            }
          } catch (createError) {
            console.error('Failed to create user via tRPC:', createError);
          }
        }
        setIsLoading(false);
        return;
      }

      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;
      
      // Use setTimeout to ensure state updates happen after render
      setTimeout(async () => {
        if (!isMounted) return;
        
        try {
          if (__DEV__ && event && session?.user?.email) {
            console.log('Auth state changed:', event, session.user.email);
          }
          setSession(session);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          setIsLoading(false);
        }
      }, 0);
    });

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);



  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Don't set loading to false here - let the auth state change handler do it
        // This prevents the brief moment where user is null
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || (typeof window !== 'undefined' ? window.location.origin : 'https://zvfley8yoowhncate9z5.rork.app')}/auth/callback`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile immediately via tRPC
        try {
          const result = await trpcClient.user.createUser.mutate({
            userId: data.user.id,
            email: data.user.email || email,
            name: name || '',
          });
          console.log('User profile created:', result);
          
          // If email confirmation is disabled, user is immediately confirmed
          if (data.user.email_confirmed_at || !data.user.confirmation_sent_at) {
            // User is confirmed, load their profile
            await loadUserProfile(data.user.id);
          }
        } catch (apiError) {
          console.log('User profile creation via tRPC failed:', apiError);
          // Continue anyway, the auth trigger might handle it
        }

        return { success: true };
      }
      
      return { success: false, error: 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed' };
    }
  }, [loadUserProfile]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  const updateCredits = useCallback(async (credits: number) => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ credits })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating credits:', error);
          return;
        }

        if (data) {
          setUser(data);
        }
      } catch (error) {
        console.error('Error updating credits:', error);
      }
    }
  }, [user]);

  const updateSubscription = useCallback(async (plan: string) => {
    if (user) {
      try {
        const credits = plan === 'starter' ? 200 : plan === 'pro' ? 1000 : plan === 'premium' ? 999999 : user.credits;
        
        const { data, error } = await supabase
          .from('users')
          .update({ 
            subscription_plan: plan as User['subscription_plan'],
            credits 
          })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating subscription:', error);
          return;
        }

        if (data) {
          setUser(data);
        }
      } catch (error) {
        console.error('Error updating subscription:', error);
      }
    }
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Delete user data via tRPC
      const result = await trpcClient.user.deleteAccount.mutate({ userId: user.id });
      
      if (result.success) {
        // Sign out the user
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to delete account' };
      }
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }, [user]);

  return useMemo(() => ({
    user,
    session,
    isLoading,
    login,
    signup,
    logout,
    updateCredits,
    updateSubscription,
    deleteAccount,
  }), [user, session, isLoading, login, signup, logout, updateCredits, updateSubscription, deleteAccount]);
});