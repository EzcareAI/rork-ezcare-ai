import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase, User } from "@/lib/supabase";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import Purchases from "react-native-purchases";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
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
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) {
        console.error("Error loading user profile:", error.message, error.code);
        if (error.code === "PGRST116") {
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            const email = sessionData.session?.user?.email || "";

            const { data: newUser, error: createError } = await supabase
              .from("users")
              .insert({
                id: userId,
                email,
                name: null,
                credits: 10,
                subscription_plan: "trial",
              })
              .select()
              .single();
            if (createError) {
              console.error("Failed to create user:", createError);
            } else if (newUser) {
              setUser(newUser);
              setIsLoading(false);
              return;
            }
          } catch (createError) {
            if (__DEV__) {
              console.error("Failed to create user:", createError);
            }
          }
        }
        setIsLoading(false);
        return;
      }

      if (data) {
        try {
          if (data.credits === null || typeof data.credits === "undefined") {
            const { data: updated, error: updateError } = await supabase
              .from("users")
              .update({ credits: 10 })
              .eq("id", userId)
              .select()
              .single();

            if (updateError) {
              console.error(
                "Failed to backfill credits for user:",
                updateError
              );
              setUser(data);
            } else {
              setUser(data);
            }
          } else {
            setUser(data);
          }
        } catch (patchErr) {
          console.error("Error patching null credits:", patchErr);
          setUser(data);
        }
      }
    } catch (error) {
      console.error(
        "Error loading user profile:",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user.id);

          try {
            try {
              await (Purchases as any).logIn(session.user.id);
            } catch (inner) {
              if ((Purchases as any).identify)
                await (Purchases as any).identify(session.user.id);
            }
          } catch (e) {
            console.warn("RevenueCat identification failed:", e);
          }

          import("@/lib/syncSubscription")
            .then(({ syncSubscription }) =>
              syncSubscription({ id: session.user.id }).catch((e: any) =>
                console.warn("syncSubscription failed:", e)
              )
            )
            .catch((e) =>
              console.warn("Failed to import syncSubscription:", e)
            );
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;

        setTimeout(async () => {
          if (!isMounted) return;

          try {
            setSession(session);

            if (session?.user) {
              await loadUserProfile(session.user.id);
            } else {
              setUser(null);
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            setIsLoading(false);
          }
        }, 0);
      }
    );

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
        if (error.message.includes("Invalid login credentials")) {
          return {
            success: false,
            error: "Email not found or incorrect password",
          };
        }
        return { success: false, error: error.message };
      }

      if (data?.user) {
        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return { success: false, error: "Login failed" };
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name?.trim() || null },
            emailRedirectTo: `${
              process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
              (typeof window !== "undefined"
                ? window.location.origin
                : "https://zvfley8yoowhncate9z5.rork.app")
            }/auth/callback`,
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await loadUserProfile(data.user.id);
          } catch (apiError) {
            console.log(
              "User profile creation failed:",
              apiError instanceof Error ? apiError.message : "Unknown error"
            );
          }

          return { success: true };
        }

        return { success: false, error: "Signup failed" };
      } catch (error) {
        console.error("Signup error:", error);
        return { success: false, error: "Signup failed" };
      }
    },
    [loadUserProfile]
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, []);

  const updateCredits = useCallback(
    async (credits: number) => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("users")
            .update({ credits })
            .eq("id", user.id)
            .select()
            .single();

          if (error) {
            console.error("Error updating credits:", error);
            return;
          }

          if (data) {
            setUser(data);
          }
        } catch (error) {
          console.error("Error updating credits:", error);
        }
      }
    },
    [user]
  );

  const updateSubscription = useCallback(
    async (plan: string) => {
      if (user) {
        try {
          const credits =
            plan === "trial"
              ? 10
              : plan === "starter"
              ? 50
              : plan === "pro"
              ? 300
              : plan === "premium"
              ? "∞"
              : user.credits;

          const { data, error } = await supabase
            .from("users")
            .update({
              subscription_plan: plan as User["subscription_plan"],
              credits,
            })
            .eq("id", user.id)
            .select()
            .single();

          if (error) {
            console.error("Error updating subscription:", error);
            return;
          }

          if (data) {
            setUser(data);
          }
        } catch (error) {
          console.error("Error updating subscription:", error);
        }
      }
    },
    [user]
  );

  const deleteAccount = useCallback(async () => {
    if (!user || !session) {
      return { success: false, error: "No user logged in" };
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "delete-account",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error("Failed to delete account:", error);
        return {
          success: false,
          error: error.message || "Failed to delete account",
        };
      }

      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return { success: true };
    } catch (error) {
      console.error("Delete account error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete account",
      };
    }
  }, [user, session]);

  return useMemo(
    () => ({
      user,
      session,
      isLoading,
      login,
      signup,
      logout,
      updateCredits,
      updateSubscription,
      deleteAccount,
    }),
    [
      user,
      session,
      isLoading,
      login,
      signup,
      logout,
      updateCredits,
      updateSubscription,
      deleteAccount,
    ]
  );
});
