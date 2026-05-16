import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getSellerProfile, 
  updateSellerProfile,
  uploadSellerAvatar,
  removeSellerAvatar
} from '../../services/profileService';
import Loader from '../../components/common/Loader';
import { 
  UserIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  TrashIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SellerProfilePage = () => {
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
    businessName: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    gstin: '',
    pan: '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: ''
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getSellerProfile();
      console.log('Loaded seller profile data:', data);
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        businessName: data.businessName || '',
        businessAddress: {
          street: data.businessAddress?.street || '',
          city: data.businessAddress?.city || '',
          state: data.businessAddress?.state || '',
          pincode: data.businessAddress?.pincode || '',
          country: data.businessAddress?.country || 'India'
        },
        gstin: data.gstin || '',
        pan: data.pan || '',
        bankDetails: {
          accountHolderName: data.bankDetails?.accountHolderName || '',
          accountNumber: data.bankDetails?.accountNumber || '',
          ifscCode: data.bankDetails?.ifscCode || '',
          bankName: data.bankDetails?.bankName || '',
          branchName: data.bankDetails?.branchName || ''
        }
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
    if (name.startsWith('businessAddress.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        businessAddress: {
          ...prev.businessAddress,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('bankDetails.')) {
      const bankField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bankField]: value
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
      const result = await uploadSellerAvatar(file);
      setProfile(prev => ({ ...prev, avatar: result.avatar }));
      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    
    setUploading(true);
    try {
      await removeSellerAvatar();
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
      const updatedProfile = await updateSellerProfile(formData);
      console.log('Updated profile:', updatedProfile);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
      // Reload profile to ensure fresh data
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      businessName: profile.businessName || '',
      businessAddress: {
        street: profile.businessAddress?.street || '',
        city: profile.businessAddress?.city || '',
        state: profile.businessAddress?.state || '',
        pincode: profile.businessAddress?.pincode || '',
        country: profile.businessAddress?.country || 'India'
      },
      gstin: profile.gstin || '',
      pan: profile.pan || '',
      bankDetails: {
        accountHolderName: profile.bankDetails?.accountHolderName || '',
        accountNumber: profile.bankDetails?.accountNumber || '',
        ifscCode: profile.bankDetails?.ifscCode || '',
        bankName: profile.bankDetails?.bankName || '',
        branchName: profile.bankDetails?.branchName || ''
      }
    });
    setEditing(false);
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading && !profile) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Seller Profile</h1>
                <p className="text-blue-100 mt-1">Manage your business information</p>
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
                      alt={profile.businessName || 'Seller'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (profile?.businessName?.charAt(0) || profile?.name?.charAt(0) || 'S').toUpperCase()
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
                <h2 className="text-xl font-bold text-gray-800">{profile?.businessName || profile?.name || 'Seller'}</h2>
                <p className="text-gray-500">
                  Seller since {formatDate(profile?.createdAt)}
                </p>
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
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                      <input 
                        type="text" 
                        name="businessName" 
                        value={formData.businessName} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN *</label>
                      <input 
                        type="text" 
                        name="gstin" 
                        value={formData.gstin} 
                        onChange={handleInputChange} 
                        placeholder="22AAAAA0000A1Z" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PAN *</label>
                      <input 
                        type="text" 
                        name="pan" 
                        value={formData.pan} 
                        onChange={handleInputChange} 
                        placeholder="AAAAA0000A" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                      <input 
                        type="text" 
                        name="businessAddress.street" 
                        value={formData.businessAddress.street} 
                        onChange={handleInputChange} 
                        placeholder="Street Address" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" 
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          name="businessAddress.city" 
                          value={formData.businessAddress.city} 
                          onChange={handleInputChange} 
                          placeholder="City" 
                          className="border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <input 
                          type="text" 
                          name="businessAddress.state" 
                          value={formData.businessAddress.state} 
                          onChange={handleInputChange} 
                          placeholder="State" 
                          className="border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <input 
                          type="text" 
                          name="businessAddress.pincode" 
                          value={formData.businessAddress.pincode} 
                          onChange={handleInputChange} 
                          placeholder="Pincode" 
                          className="border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <input 
                          type="text" 
                          name="businessAddress.country" 
                          value={formData.businessAddress.country} 
                          onChange={handleInputChange} 
                          placeholder="Country" 
                          className="border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BanknotesIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                      <input 
                        type="text" 
                        name="bankDetails.accountHolderName" 
                        value={formData.bankDetails.accountHolderName} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input 
                        type="text" 
                        name="bankDetails.accountNumber" 
                        value={formData.bankDetails.accountNumber} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                      <input 
                        type="text" 
                        name="bankDetails.ifscCode" 
                        value={formData.bankDetails.ifscCode} 
                        onChange={handleInputChange} 
                        placeholder="SBIN0001234" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input 
                        type="text" 
                        name="bankDetails.bankName" 
                        value={formData.bankDetails.bankName} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                      <input 
                        type="text" 
                        name="bankDetails.branchName" 
                        value={formData.bankDetails.branchName} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" /> Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{profile?.name || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{profile?.email || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium">{profile?.businessName || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">GSTIN</p>
                      <p className="font-medium">{profile?.gstin || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">PAN</p>
                      <p className="font-medium">{profile?.pan || 'Not provided'}</p>
                    </div>
                  </div>
                  {(profile?.businessAddress?.street || profile?.businessAddress?.city) && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-2 flex items-center">
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        Business Address
                      </p>
                      <p className="text-gray-800">
                        {profile.businessAddress.street && <>{profile.businessAddress.street}<br /></>}
                        {profile.businessAddress.city && profile.businessAddress.state ? (
                          <>{profile.businessAddress.city}, {profile.businessAddress.state}</>
                        ) : (
                          <>{profile.businessAddress.city || profile.businessAddress.state}</>
                        )}
                        <br />
                        {profile.businessAddress.pincode && <>PIN: {profile.businessAddress.pincode}<br /></>}
                        {profile.businessAddress.country || 'India'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bank Details */}
                {(profile?.bankDetails?.accountNumber || profile?.bankDetails?.bankName) && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <BanknotesIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Bank Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Account Holder</p>
                        <p className="font-medium">{profile?.bankDetails?.accountHolderName || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="font-medium">{profile?.bankDetails?.accountNumber ? '••••' + profile.bankDetails.accountNumber.slice(-4) : 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">IFSC Code</p>
                        <p className="font-medium">{profile?.bankDetails?.ifscCode || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium">{profile?.bankDetails?.bankName || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{formatDate(profile?.createdAt)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(profile?.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => navigate('/seller/dashboard')} 
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;