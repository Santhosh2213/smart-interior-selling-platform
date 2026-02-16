import React, { useState, useEffect } from 'react';
import { sellerService } from '../../services/sellerService';
import { 
  BuildingOfficeIcon,
  IdentificationIcon,
  BanknotesIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const BusinessSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState({
    businessName: '',
    businessAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: ''
    },
    gstin: '',
    pan: '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: ''
    },
    email: '',
    phone: '',
    logo: null
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await sellerService.getBusinessSettings();
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    if (section === 'main') {
      setSettings({ ...settings, [field]: value });
    } else {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [field]: value
        }
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await sellerService.updateBusinessSettings(settings);
      toast.success('Settings updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('logo', file);
      
      try {
        const response = await sellerService.uploadLogo(formData);
        setSettings({ ...settings, logo: response.data.logoUrl });
        toast.success('Logo uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload logo');
      }
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
          <p className="text-gray-600">Manage your business information</p>
        </div>
        
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit Settings
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditing(false);
                fetchSettings();
              }}
              className="btn-secondary flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
            Business Information
          </h2>
        </div>
        
        <div className="p-6">
          {/* Logo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
                )}
              </div>
              {editing && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="btn-secondary cursor-pointer"
                  >
                    Upload Logo
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => handleChange('main', 'businessName', e.target.value)}
                  className="input-field"
                  required
                />
              ) : (
                <p className="text-gray-900">{settings.businessName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('main', 'email', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{settings.email || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange('main', 'phone', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{settings.phone || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-primary-600" />
            Business Address
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.businessAddress.addressLine1}
                  onChange={(e) => handleChange('businessAddress', 'addressLine1', e.target.value)}
                  className="input-field"
                  required
                />
              ) : (
                <p className="text-gray-900">{settings.businessAddress.addressLine1 || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.businessAddress.addressLine2}
                  onChange={(e) => handleChange('businessAddress', 'addressLine2', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{settings.businessAddress.addressLine2 || 'Not provided'}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={settings.businessAddress.city}
                    onChange={(e) => handleChange('businessAddress', 'city', e.target.value)}
                    className="input-field"
                    required
                  />
                ) : (
                  <p className="text-gray-900">{settings.businessAddress.city || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={settings.businessAddress.state}
                    onChange={(e) => handleChange('businessAddress', 'state', e.target.value)}
                    className="input-field"
                    required
                  />
                ) : (
                  <p className="text-gray-900">{settings.businessAddress.state || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={settings.businessAddress.pincode}
                    onChange={(e) => handleChange('businessAddress', 'pincode', e.target.value)}
                    className="input-field"
                    required
                  />
                ) : (
                  <p className="text-gray-900">{settings.businessAddress.pincode || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <IdentificationIcon className="h-5 w-5 mr-2 text-primary-600" />
            Tax Information
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GSTIN *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.gstin}
                  onChange={(e) => handleChange('main', 'gstin', e.target.value)}
                  className="input-field"
                  required
                  pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                />
              ) : (
                <p className="text-gray-900">{settings.gstin}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.pan}
                  onChange={(e) => handleChange('main', 'pan', e.target.value)}
                  className="input-field"
                  required
                  pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                />
              ) : (
                <p className="text-gray-900">{settings.pan}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <BanknotesIcon className="h-5 w-5 mr-2 text-primary-600" />
            Bank Details
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.bankDetails.accountHolderName}
                  onChange={(e) => handleChange('bankDetails', 'accountHolderName', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{settings.bankDetails.accountHolderName || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.bankDetails.accountNumber}
                  onChange={(e) => handleChange('bankDetails', 'accountNumber', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{settings.bankDetails.accountNumber || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.bankDetails.ifscCode}
                  onChange={(e) => handleChange('bankDetails', 'ifscCode', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{settings.bankDetails.ifscCode || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.bankDetails.bankName}
                  onChange={(e) => handleChange('bankDetails', 'bankName', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{settings.bankDetails.bankName || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={settings.bankDetails.branchName}
                  onChange={(e) => handleChange('bankDetails', 'branchName', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{settings.bankDetails.branchName || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;