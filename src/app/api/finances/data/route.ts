import { NextResponse } from "next/server";

const sample = {
  summary: {
    revenue: { value: "¢324,353", delta: "+11.01%" },
    withdrawals: { value: "¢324,353", delta: "-0.03%" },
    payments: { value: "¢324,353", delta: "+15.03%" },
    commission: { value: "¢324,353", delta: "+6.08%" },
  },
  chart: [
    { month: "Jan", thisYear: 9000, lastYear: 7000, overTime: 8000 },
    { month: "Feb", thisYear: 12000, lastYear: 11000, overTime: 11500 },
    { month: "Mar", thisYear: 14000, lastYear: 12000, overTime: 13000 },
    { month: "Apr", thisYear: 26000, lastYear: 15000, overTime: 20500 },
    { month: "May", thisYear: 30000, lastYear: 20000, overTime: 25000 },
    { month: "Jun", thisYear: 22000, lastYear: 16000, overTime: 19000 },
    { month: "Jul", thisYear: 24000, lastYear: 28000, overTime: 26000 },
  ],
};

export async function GET() {
  // In the future this can call a real database or proxy to an external API.
  return NextResponse.json(sample);
}
