import { render, screen } from '@testing-library/react'
import SummaryCards from '../app/dashboard/finances/revenue-payment/_components/SummaryCards'

describe('SummaryCards', () => {
  test('renders four cards', async () => {
    render(<SummaryCards />)

    expect(await screen.findByText(/Revenue/i)).toBeInTheDocument()
    expect(await screen.findByText(/Withdrawals/i)).toBeInTheDocument()
    expect(await screen.findByText(/Payments/i)).toBeInTheDocument()
    expect(await screen.findByText(/Commission/i)).toBeInTheDocument()
  })
})
