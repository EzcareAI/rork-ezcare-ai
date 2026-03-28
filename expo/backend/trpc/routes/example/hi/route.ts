import { publicProcedure } from '@/backend/trpc/create-context';

export const hiProcedure = publicProcedure.query(() => {
  return { message: 'Hello from tRPC!' };
});

// Also export as default for backward compatibility
export default hiProcedure;