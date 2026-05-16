import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCustomerProfile, 
  updateCustomerProfile,
  uploadCustomerAvatar,
  removeCustomerAvatar
} from '../../services/profileService';
import Loader from '../../components/common/Loader';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  HomeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CustomerProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    gstin: '',
    preferredUnits: 'feet'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCustomerProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          pincode: data.address?.pincode || '',
          country: data.address?.country || 'India'
        },
        gstin: data.gstin || '',
        preferredUnits: data.preferredUnits || 'feet'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    
    setUploading(true);
    try {
      const result = await uploadCustomerAvatar(file);
      setProfile(prev => ({ ...prev, avatar: result.avatar }));
      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    
    setUploading(true);
    try {
      await removeCustomerAvatar();
      setProfile(prev => ({ ...prev, avatar: null }));
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedProfile = await updateCustomerProfile(formData);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: {
        street: profile.address?.street || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        pincode: profile.address?.pincode || '',
        country: profile.address?.country || 'India'
      },
      gstin: profile.gstin || '',
      preferredUnits: profile.preferredUnits || 'feet'
    });
    setEditing(false);
  };

  if (loading && !profile) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <p className="text-blue-100 mt-1">Manage your personal information</p>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-white text-blue-600 px-5 py-2 rounded-xl hover:bg-blue-50 transition-all flex items-center shadow-md"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Avatar Section */}
          <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-8 border-b">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {profile?.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt={profile.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                {!editing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 text-white hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <CameraIcon className="h-4 w-4" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{profile?.name || 'Customer'}</h2>
                <p className="text-gray-500">Customer since {new Date(profile?.createdAt).toLocaleDateString()}</p>
                {profile?.avatar && !editing && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={uploading}
                    className="text-red-500 text-sm hover:text-red-700 mt-1 flex items-center"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form/View Section */}
          <div className="p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleInputChange}
                      placeholder="22AAAAA0000A1Z"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Units
                    </label>
                    <select
                      name="preferredUnits"
                      value={formData.preferredUnits}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="feet">Feet</option>
                      <option value="meter">Meters</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-800">{profile?.name || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-800">{profile?.email || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-800">{profile?.phone || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">GSTIN</p>
                      <p className="font-medium text-gray-800">{profile?.gstin || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Preferred Units</p>
                      <p className="font-medium text-gray-800 capitalize">{profile?.preferredUnits || 'Feet'}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {(profile?.address?.street || profile?.address?.city) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Address
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-800">
                        {profile.address.street && <>{profile.address.street}<br /></>}
                        {profile.address.city && profile.address.state ? (
                          <>{profile.address.city}, {profile.address.state}</>
                        ) : (
                          <>{profile.address.city || profile.address.state}</>
                        )}
                        <br />
                        {profile.address.pincode && <>PIN: {profile.address.pincode}<br /></>}
                        {profile.address.country || 'India'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-800">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-800">
                        {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;