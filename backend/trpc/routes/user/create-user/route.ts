import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getUserProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const { userId } = input;

    try {
      if (!ctx.supabase) {
        throw new Error('Database connection not available. Check backend environment variables.');
      }
      
      const { data, error } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // If table doesn't exist, provide helpful error
        if (error.code === 'PGRST116' || error.message.includes('schema cache')) {
          throw new Error('Database tables not found. Please run the SQL schema in your Supabase dashboard first. Check SUPABASE_SETUP.md for instructions.');
        }
        
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('User not found');
      }

      return { success: true, user: data };
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const createUserProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { userId, email, name } = input;

    try {
      if (!ctx.supabase) {
        throw new Error('Database connection not available. Check backend environment variables.');
      }
      
      // First check if user already exists (due to trigger)
      const { data: existingUser } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (existingUser) {
        // Update name if provided
        if (name && !existingUser.name) {
          const { data: updatedUser } = await ctx.supabase!
            .from('users')
            .update({ name })
            .eq('id', userId)
            .select()
            .single();
          
          return { success: true, user: updatedUser || existingUser };
        }
        return { success: true, user: existingUser };
      }

      // If user doesn't exist, create it
      const { data, error } = await ctx.supabase!
        .from('users')
        .upsert({
          id: userId,
          email,
          name: name || null,
          credits: 20,
          subscription_plan: 'trial',
        }, {
          onConflict: 'id'
        })
        .select()
        .maybeSingle();

      if (error) {
        // If it's a duplicate key error, try to fetch the existing user
        if (error.code === '23505') {
          const { data: fetchedUser } = await ctx.supabase!
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (fetchedUser) {
            return { success: true, user: fetchedUser };
          }
        }
        throw new Error(`Failed to create user profile: ${error.message}`);
      }

      return { success: true, user: data };
    } catch (error) {
      throw new Error(`Failed to create user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

export const updateUserSubscriptionProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    subscriptionPlan: z.enum(['trial', 'starter', 'pro', 'premium']),
    credits: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { userId, subscriptionPlan, credits } = input;

    try {
      if (!ctx.supabase) {
        throw new Error('Database connection not available. Check backend environment variables.');
      }
      
      const updateData: any = {
        subscription_plan: subscriptionPlan,
        credits_reset_date: new Date().toISOString(),
      };

      if (credits !== undefined) {
        updateData.credits = credits;
      } else {
        // Set default credits based on plan
        const defaultCredits = {
          trial: 20,
          starter: 50,
          pro: 200,
          premium: 999999,
        };
        updateData.credits = defaultCredits[subscriptionPlan];
      }

      const { data, error } = await ctx.supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update subscription: ${error.message}`);
      }

      return { success: true, user: data };
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });