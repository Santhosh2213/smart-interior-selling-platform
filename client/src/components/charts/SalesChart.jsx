import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const SalesChart = ({ data, title = 'Sales Overview' }) => {
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: data?.sales || [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1
      },
      {
        label: 'Revenue',
        data: data?.revenue || [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: title
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;