import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const GSTBreakdownChart = ({ data }) => {
  const chartData = {
    labels: ['GST 5%', 'GST 12%', 'GST 18%', 'GST 28%'],
    datasets: [
      {
        label: 'GST Contribution',
        data: data || [300, 500, 800, 200],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(14, 165, 233, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(239, 68, 68, 0.5)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(14, 165, 233)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'GST Breakdown'
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default GSTBreakdownChart;