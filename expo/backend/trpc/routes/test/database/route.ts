import { publicProcedure } from '@/backend/trpc/create-context';

export const testDatabaseProcedure = publicProcedure
  .query(async ({ ctx }) => {
    try {

      
      // Test basic connection
      const { error: connectionError } = await ctx.supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (connectionError) {

        return {
          success: false,
          error: connectionError.message,
          tables: [],
          message: 'Database connection failed. Check if tables exist in Supabase.'
        };
      }
      
      // Test all required tables
      const tables = ['users', 'quiz_responses', 'chats', 'subscriptions'];
      const tableResults = [];
      
      for (const table of tables) {
        try {
          const { error } = await ctx.supabase
            .from(table)
            .select('count')
            .limit(1);
            
          tableResults.push({
            table,
            exists: !error,
            error: error?.message || null
          });
        } catch (err) {
          tableResults.push({
            table,
            exists: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }
      
      const allTablesExist = tableResults.every(t => t.exists);
      
      return {
        success: allTablesExist,
        tables: tableResults,
        message: allTablesExist 
          ? 'All database tables are working correctly!' 
          : 'Some tables are missing. Please run the SQL schema in your Supabase dashboard.'
      };
      
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tables: [],
        message: 'Failed to test database connection.'
      };
    }
  });