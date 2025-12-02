import { renderHook } from '@testing-library/react'
import { waitFor } from '@testing-library/react'
import { useFinancesData } from '../app/dashboard/finances/revenue-payment/_components/useFinancesData'

describe('useFinancesData', () => {
  test('fetches and returns data', async () => {
    const { result } = renderHook(() => useFinancesData())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.summary).toBeDefined()
  })
})
