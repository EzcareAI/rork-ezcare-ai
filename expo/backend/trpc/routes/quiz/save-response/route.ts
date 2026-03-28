import { publicProcedure } from '@/backend/trpc/create-context';
import { z } from 'zod';

export const saveQuizResponseProcedure = publicProcedure
  .input(z.object({
    name: z.string(),
    phone: z.string(),
    countryCode: z.string(),
    height: z.number(),
    weight: z.number(),
    sleepHours: z.number(),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
    smoking: z.boolean(),
    alcoholFrequency: z.enum(['never', 'rarely', 'occasionally', 'regularly', 'daily']),
    stressLevel: z.number().min(1).max(10),
    dietQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
    bmi: z.number(),
    bmiCategory: z.enum(['underweight', 'normal', 'overweight', 'obese']),
    healthScore: z.number().min(0).max(100),
  }))
  .mutation(async ({ input, ctx }) => {
    // Get user ID from request context (you'll need to implement auth middleware)
    // For now, we'll extract it from the request headers or implement a simple auth check
    const authHeader = ctx.req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    // This is a simplified approach - in production you'd validate the JWT token
    const userId = authHeader.replace('Bearer ', '');

    try {
      const { data, error } = await ctx.supabase
        .from('quiz_responses')
        .insert({
          user_id: userId,
          name: input.name,
          phone: input.phone,
          country_code: input.countryCode,
          height: input.height,
          weight: input.weight,
          sleep_hours: input.sleepHours,
          activity_level: input.activityLevel,
          smoking: input.smoking,
          alcohol_frequency: input.alcoholFrequency,
          stress_level: input.stressLevel,
          diet_quality: input.dietQuality,
          bmi: input.bmi,
          bmi_category: input.bmiCategory,
          health_score: input.healthScore,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: `Failed to save quiz response: ${error.message}` };
      }

      return { success: true, quizResponse: data };
    } catch (error) {
      return { success: false, error: `Failed to save quiz response: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  });