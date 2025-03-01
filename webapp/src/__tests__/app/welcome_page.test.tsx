import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WelcomePage from '@/app/page';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  cookies: () => ({
    get: vi.fn().mockReturnValue({ value: 'mock-cookie-value' }),
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({ 
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Image component
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />
}));

// Mock auth utilities
vi.mock('@/utils/supabase/auth', () => ({
  getUserData: vi.fn().mockResolvedValue(null),
  signout: vi.fn().mockResolvedValue({ success: true, error: null }),
}));

describe("Welcome page", () => {
  it('should render the landing page', async () => {
    render(<WelcomePage />);
    
    const navbar = screen.getByTestId('landing-page-navbar');
    expect(navbar).toBeDefined();
  });
});