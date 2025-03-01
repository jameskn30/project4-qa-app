import { vi } from 'vitest';

// Setup global mocks used across multiple tests
export const setupMocks = () => {
  // Mock auth utilities
  vi.mock('@/utils/supabase/auth', () => ({
    getUserData: vi.fn().mockResolvedValue(null),
    signout: vi.fn().mockResolvedValue({ success: true, error: null }),
  }));
};
