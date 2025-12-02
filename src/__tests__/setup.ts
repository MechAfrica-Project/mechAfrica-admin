import '@testing-library/jest-dom'

// mock fetch globally for tests
type Sample = {
  summary: {
    revenue: { value: string; delta: string }
    withdrawals: { value: string; delta: string }
    payments: { value: string; delta: string }
    commission: { value: string; delta: string }
  }
  chart: Array<{ month: string; thisYear: number; lastYear: number; overTime: number }>
}

;(globalThis as unknown as { fetch?: (input?: RequestInfo) => Promise<{ json: () => Promise<Sample> }> }).fetch = () => {
  const sample: Sample = {
    summary: {
      revenue: { value: '¢324,353', delta: '+11.01%' },
      withdrawals: { value: '¢324,353', delta: '-0.03%' },
      payments: { value: '¢324,353', delta: '+15.03%' },
      commission: { value: '¢324,353', delta: '+6.08%' },
    },
    chart: [
      { month: 'Jan', thisYear: 9000, lastYear: 7000, overTime: 8000 },
      { month: 'Feb', thisYear: 12000, lastYear: 11000, overTime: 11500 },
    ],
  }

  return Promise.resolve({ json: () => Promise.resolve(sample) })
}
