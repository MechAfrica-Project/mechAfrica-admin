"use client";
import { getFarmersOverTime } from "@/lib/dummyData";

export default function ChartCard() {
  const chartData = getFarmersOverTime();
  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        <span className="text-[#00594C]">Farmers</span> Count Overtime
      </h3>

      {/* Chart Container */}
      <div className="h-44 md:h-39 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className="ml-8 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-100"
                style={{ top: `${i * 25}%` }}
              />
            ))}
          </div>

          {/* Chart line */}
          <svg className="absolute inset-0 w-full h-full">
            <polyline
              fill="none"
              stroke="#00594C"
              strokeWidth="2"
              points={chartData
                .map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 100 - (d.value / maxValue) * 100;
                  return `${x},${y}`;
                })
                .join(" ")}
            />

            {/* Data points */}
            {chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * 100;
              const y = 100 - (d.value / maxValue) * 100;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#00594C"
                  className="hover:r-6 transition-all"
                />
              );
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-500">
          {chartData.map((d, i) => (
            <span key={i} className="text-center">
              {d.month}
            </span>
          ))}
        </div>
      </div>

      {/* Chart Summary */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <span>
          Total Growth: +
          {(
            ((chartData[chartData.length - 1].value - chartData[0].value) /
              chartData[0].value) *
            100
          ).toFixed(1)}
          %
        </span>
        <span>Peak: {maxValue} farmers</span>
      </div>
    </div>
  );
}
