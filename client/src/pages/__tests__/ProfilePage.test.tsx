
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfilePage from '../ProfilePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as auth from '@/hooks/use-auth';

// Mock the auth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn()
}));

const queryClient = new QueryClient();

describe('ProfilePage', () => {
  const mockUser = {
    name: 'Test User',
    grade: 4,
    securityQuestions: [
      { question: 'What is your favorite color?', answer: 'Blue' },
      { question: 'What is your pet\'s name?', answer: 'Max' },
      { question: 'What city were you born in?', answer: 'Boston' }
    ]
  };

  beforeEach(() => {
    vi.mocked(auth.useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn()
    });
  });

  it('renders the form with user data', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    );

    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4')).toBeInTheDocument();
  });

  it('handles name change', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    expect(nameInput).toHaveValue('New Name');
  });

  it('validates grade input', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    );

    const gradeInput = screen.getByLabelText(/Grade Level/i);
    fireEvent.change(gradeInput, { target: { value: '6' } });

    await waitFor(() => {
      expect(screen.getByText(/Grade must be between 3 and 5/i)).toBeInTheDocument();
    });
  });

  it('handles security question changes', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfilePage />
      </QueryClientProvider>
    );

    const questionAnswer = screen.getAllByPlaceholderText(/Enter your answer/i)[0];
    fireEvent.change(questionAnswer, { target: { value: 'Red' } });

    expect(questionAnswer).toHaveValue('Red');
  });
});
