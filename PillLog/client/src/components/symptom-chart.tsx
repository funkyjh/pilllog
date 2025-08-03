import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { SymptomRecord } from "@shared/schema";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

Chart.register(...registerables);

interface SymptomChartProps {
  data: SymptomRecord[];
}

export default function SymptomChart({ data }: SymptomChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Prepare data for chart
    const sortedData = [...data]
      .sort((a, b) => new Date(a.recordedAt!).getTime() - new Date(b.recordedAt!).getTime())
      .slice(-7); // Last 7 records

    const labels = sortedData.map(record => 
      format(new Date(record.recordedAt!), 'M/d', { locale: ko })
    );
    
    const painLevels = sortedData.map(record => record.painLevel);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '통증 수준',
          data: painLevels,
          borderColor: 'hsl(207, 90%, 54%)',
          backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'hsl(207, 90%, 54%)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: '통증 수준 (0-10)'
            },
            ticks: {
              stepSize: 1
            }
          },
          x: {
            title: {
              display: true,
              text: '날짜'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `통증 수준: ${context.parsed.y}/10`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <i className="fas fa-chart-line text-4xl mb-2"></i>
          <p>증상 기록이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
