import { render, screen, waitFor } from '@testing-library/react'
import { RevenueChart } from '../app/dashboard/finances/revenue-payment/_components/RevenueChart'

// Mock ResponsiveContainer to avoid dimension warnings in tests
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children, width, height }: { children: React.ReactNode; width?: string | number; height?: string | number }) => (
    <div data-testid="responsive-container" style={{ width: width || 800, height: height || 400 }}>
      {children}
    </div>
  ),
}))

describe('RevenueChart', () => {
  test('renders title and buttons', async () => {
    render(<RevenueChart title="Revenue" />)

    expect(screen.getByText(/Revenue/i)).toBeInTheDocument()
    expect(screen.getByText(/Over time/i)).toBeInTheDocument()
    expect(screen.getByText(/This year/i)).toBeInTheDocument()
    expect(screen.getByText(/Last year/i)).toBeInTheDocument()
    
    // Wait for async state updates to complete
    await waitFor(() => {
      expect(screen.getByText(/Revenue/i)).toBeInTheDocument()
    })
  })
})
