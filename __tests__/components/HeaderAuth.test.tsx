import { render, screen } from '@testing-library/react'
import HeaderAuth from '@/src/components/HeaderAuth'
import { SessionProvider } from 'next-auth/react'

// Mock do next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('HeaderAuth', () => {
  it('should render login button when not authenticated', () => {
    const useSession = jest.requireMock('next-auth/react').useSession
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(
      <SessionProvider>
        <HeaderAuth />
      </SessionProvider>
    )

    expect(screen.getByText('Entrar')).toBeTruthy()
    expect(screen.queryByText('Sair')).toBeFalsy()
  })

  it('should render user info and logout button when authenticated', () => {
    const useSession = jest.requireMock('next-auth/react').useSession
    useSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    })

    render(
      <SessionProvider>
        <HeaderAuth />
      </SessionProvider>
    )

    expect(screen.getByText('Test User')).toBeTruthy()
    expect(screen.getByText('Sair')).toBeTruthy()
    expect(screen.queryByText('Entrar')).toBeFalsy()
  })

  it('should render loading state', () => {
    const useSession = jest.requireMock('next-auth/react').useSession
    useSession.mockReturnValue({
      data: null,
      status: 'loading',
    })

    render(
      <SessionProvider>
        <HeaderAuth />
      </SessionProvider>
    )

    expect(screen.getByTestId('loading-skeleton')).toBeTruthy()
 })
})
