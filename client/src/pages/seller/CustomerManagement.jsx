import React, { useState, useEffect } from 'react';
import { sellerService } from '../../services/sellerService';
import { 
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CustomerManagement = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(c => 
        c.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.userId?.phone?.includes(searchQuery)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await sellerService.getCustomers();
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600">View and manage your customers</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold">Customers ({filteredCustomers.length})</h2>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer._id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedCustomer?._id === customer._id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{customer.userId?.name}</p>
                      <p className="text-sm text-gray-600">{customer.userId?.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-6">Customer Details</h2>
              
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedCustomer.userId?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Preferred Unit</p>
                    <p className="font-medium capitalize">{selectedCustomer.preferredUnits}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Contact Information</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{selectedCustomer.userId?.email}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{selectedCustomer.userId?.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Addresses</p>
                  {selectedCustomer.addresses?.map((address, index) => (
                    <div key={index} className="flex items-start mb-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        {address.isDefault && (
                          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded mt-1 inline-block">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold">{selectedCustomer.projects?.length || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => window.location.href = `/chat?customer=${selectedCustomer._id}`}
                    className="btn-primary flex items-center"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                    Send Message
                  </button>
                  <button className="btn-secondary">
                    View Projects
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customer selected</h3>
              <p className="text-gray-600">Select a customer from the list to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;