import { render, screen } from '@testing-library/react'
import { RevenueChart } from '../app/dashboard/finances/revenue-payment/_components/RevenueChart'

describe('RevenueChart', () => {
  test('renders title and buttons', () => {
    render(<RevenueChart title="Revenue" />)

    expect(screen.getByText(/Revenue/i)).toBeInTheDocument()
    expect(screen.getByText(/Over time/i)).toBeInTheDocument()
    expect(screen.getByText(/This year/i)).toBeInTheDocument()
    expect(screen.getByText(/Last year/i)).toBeInTheDocument()
  })
})
