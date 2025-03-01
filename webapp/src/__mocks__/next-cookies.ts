import { vi } from 'vitest';

// Mock for Next.js cookies functionality
export const mockCookies = {
  get: vi.fn().mockReturnValue({ value: 'mock-cookie-value' }),
  getAll: vi.fn().mockReturnValue([]),
  set: vi.fn(),
  delete: vi.fn(),
};

export default () => mockCookies;
