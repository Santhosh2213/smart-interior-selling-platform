import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getDesignerProfile, 
  updateDesignerProfile,
  uploadDesignerAvatar,
  removeDesignerAvatar
} from '../../services/profileService';
import Loader from '../../components/common/Loader';
import { 
  UserIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  TrashIcon,
  BriefcaseIcon,
  CalendarIcon,
  StarIcon,
  DocumentTextIcon,
  PlusIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DesignerProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newPortfolioItem, setNewPortfolioItem] = useState({ 
    title: '', 
    description: '', 
    imageUrl: '' 
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [],
    experience: '',
    bio: '',
    portfolio: []
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getDesignerProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        specialization: data.specialization || [],
        experience: data.experience || '',
        bio: data.bio || '',
        portfolio: data.portfolio || []
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecializationChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, specialization: selected }));
  };

  const addPortfolioItem = () => {
    if (newPortfolioItem.title && newPortfolioItem.imageUrl) {
      setFormData(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, { 
          title: newPortfolioItem.title, 
          description: newPortfolioItem.description, 
          imageUrl: newPortfolioItem.imageUrl,
          projectDate: new Date()
        }]
      }));
      setNewPortfolioItem({ title: '', description: '', imageUrl: '' });
      toast.success('Portfolio item added');
    } else {
      toast.error('Please provide title and image URL');
    }
  };

  const removePortfolioItem = (index) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
    toast.success('Portfolio item removed');
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
      const result = await uploadDesignerAvatar(file);
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
      await removeDesignerAvatar();
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
      const updatedProfile = await updateDesignerProfile(formData);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
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
      specialization: profile.specialization || [],
      experience: profile.experience || '',
      bio: profile.bio || '',
      portfolio: profile.portfolio || []
    });
    setEditing(false);
  };

  if (loading && !profile) {
    return <Loader />;
  }

  const specializationOptions = ['residential', 'commercial', 'industrial', 'landscape'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Designer Profile</h1>
                <p className="text-blue-100 mt-1">Showcase your skills and portfolio</p>
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
                    profile?.name?.charAt(0)?.toUpperCase() || 'D'
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
                <h2 className="text-xl font-bold text-gray-800">{profile?.name || 'Designer'}</h2>
                <p className="text-gray-500">Designer since {new Date(profile?.createdAt).toLocaleDateString()}</p>
                {profile?.avatar && !editing && (
                  <button 
                    onClick={handleRemoveImage} 
                    disabled={uploading} 
                    className="text-red-500 text-sm hover:text-red-700 mt-1 flex items-center"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" /> Remove photo
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                    <input 
                      type="number" 
                      name="experience" 
                      value={formData.experience} 
                      onChange={handleInputChange} 
                      min="0" 
                      max="50" 
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <select 
                      multiple 
                      value={formData.specialization} 
                      onChange={handleSpecializationChange} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      size={4}
                    >
                      {specializationOptions.map(opt => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleInputChange} 
                      rows="4" 
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Tell us about your design philosophy and experience..." 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                    <div className="space-y-3">
                      {formData.portfolio.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removePortfolioItem(idx)} 
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          placeholder="Project Title" 
                          value={newPortfolioItem.title} 
                          onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })} 
                          className="border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <input 
                          type="text" 
                          placeholder="Image URL" 
                          value={newPortfolioItem.imageUrl} 
                          onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, imageUrl: e.target.value })} 
                          className="border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <div className="md:col-span-2">
                          <input 
                            type="text" 
                            placeholder="Description (optional)" 
                            value={newPortfolioItem.description} 
                            onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })} 
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={addPortfolioItem} 
                        className="w-full border-2 border-dashed border-blue-300 rounded-xl py-2 text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Portfolio Item
                      </button>
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

                {(profile?.specialization?.length > 0 || profile?.experience) && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <BriefcaseIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Professional Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.specialization?.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500">Specialization</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.specialization.map(spec => (
                              <span key={spec} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile?.experience && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500">Experience</p>
                          <p className="font-medium">{profile.experience} years</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {profile?.bio && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Bio
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700">{profile.bio}</p>
                    </div>
                  </div>
                )}

                {profile?.portfolio?.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <StarIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Portfolio ({profile.portfolio.length} items)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.portfolio.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                            }}
                          />
                          <div className="p-4">
                            <h4 className="font-semibold">{item.title}</h4>
                            {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">
                        {new Date(profile?.createdAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">
                        {new Date(profile?.updatedAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => navigate('/designer/dashboard')} 
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignerProfilePage;