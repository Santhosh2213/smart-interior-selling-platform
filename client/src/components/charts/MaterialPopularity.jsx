import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MaterialPopularity = ({ data }) => {
  const chartData = {
    labels: data?.labels || ['Tiles', 'Wood', 'Glass', 'Paints', 'Hardware'],
    datasets: [
      {
        label: 'Times Used',
        data: data?.counts || [45, 32, 28, 51, 39],
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Material Popularity'
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MaterialPopularity;