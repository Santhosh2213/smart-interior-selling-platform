import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addresses: [{
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: true
    }],
    preferredUnits: 'feet'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await customerService.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.user?.name || '',
        email: response.data.user?.email || '',
        phone: response.data.user?.phone || '',
        addresses: response.data.addresses || [{
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: true
        }],
        preferredUnits: response.data.preferredUnits || 'feet'
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressChange = (index, field, value) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData({ ...formData, addresses: newAddresses });
  };

  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [
        ...formData.addresses,
        {
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false
        }
      ]
    });
  };

  const removeAddress = (index) => {
    if (formData.addresses.length === 1) {
      toast.error('At least one address is required');
      return;
    }
    const newAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: newAddresses });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await customerService.updateProfile(formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditing(false);
                fetchProfile();
              }}
              className="btn-secondary flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Avatar */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-primary-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">{formData.name}</h2>
              <p className="text-primary-100">{formData.email}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          {editing ? (
            <form className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Unit
                  </label>
                  <select
                    name="preferredUnits"
                    value={formData.preferredUnits}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="feet">Feet (ft)</option>
                    <option value="meter">Meters (m)</option>
                  </select>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Addresses</h3>
                  <button
                    type="button"
                    onClick={addAddress}
                    className="btn-secondary text-sm"
                  >
                    Add Address
                  </button>
                </div>

                {formData.addresses.map((address, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4 relative">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={address.addressLine1}
                        onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                        className="input-field"
                      />
                      
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={address.addressLine2}
                        onChange={(e) => handleAddressChange(index, 'addressLine2', e.target.value)}
                        className="input-field"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={address.city}
                          onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                          className="input-field"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={address.state}
                          onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                          className="input-field"
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={address.pincode}
                        onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                        className="input-field"
                      />
                      
                      {index === 0 && (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={address.isDefault}
                            onChange={(e) => handleAddressChange(index, 'isDefault', e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-600">
                            Set as default address
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Basic Info Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{profile?.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{profile?.user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Preferred Unit</p>
                  <p className="font-medium capitalize">{profile?.preferredUnits}</p>
                </div>
              </div>

              {/* Addresses Display */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Addresses</h3>
                {profile?.addresses?.map((address, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city}, {address.state} - {address.pincode}</p>
                        {address.isDefault && (
                          <span className="inline-block mt-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                            Default Address
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;