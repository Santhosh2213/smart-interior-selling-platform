import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import SalesChart from '../../components/charts/SalesChart';
import RevenueChart from '../../components/charts/RevenueChart';
import GSTBreakdownChart from '../../components/charts/GSTBreakdownChart';
import MaterialPopularity from '../../components/charts/MaterialPopularity';
import { 
  DocumentArrowDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState({
    sales: {},
    revenue: {},
    gst: {},
    materials: {},
    summary: {
      totalSales: 0,
      totalRevenue: 0,
      totalGST: 0,
      averageOrderValue: 0,
      topCustomer: null,
      topMaterial: null
    }
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getReports(dateRange);
      setReportData(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await reportService.exportReport(dateRange, format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">View business performance and insights</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('pdf')}
            className="btn-secondary flex items-center"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="btn-secondary flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            Excel
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="input-field"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Sales</p>
          <p className="text-2xl font-bold">{reportData.summary.totalSales}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{reportData.summary.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total GST</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{reportData.summary.totalGST.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Avg Order Value</p>
          <p className="text-2xl font-bold text-purple-600">
            ₹{reportData.summary.averageOrderValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Top Material</p>
          <p className="text-lg font-bold truncate">{reportData.summary.topMaterial || 'N/A'}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart data={reportData.sales} title="Sales Overview" />
        <RevenueChart data={reportData.revenue} title="Revenue Trend" />
        <GSTBreakdownChart data={reportData.gst} />
        <MaterialPopularity data={reportData.materials} />
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Top Customers</h2>
        <div className="space-y-4">
          {reportData.topCustomers?.map((customer, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{customer.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{customer.orderCount} orders</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;