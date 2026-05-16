const User = require('../models/User');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');
const Designer = require('../models/Designer');

// ==================== CUSTOMER PROFILE ====================
exports.getCustomerProfile = async (req, res) => {
  try {
    console.log('=== GET Customer Profile ===');
    console.log('User ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let customer = await Customer.findOne({ userId: user._id });
    
    // Create customer if doesn't exist
    if (!customer) {
      customer = new Customer({ userId: user._id });
      await customer.save();
      console.log('Created new customer profile');
    }
    
    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || null,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      gstin: customer.gstin || '',
      preferredUnits: customer.preferredUnits || 'feet',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    };

    // Get address if exists
    if (customer.addresses && customer.addresses.length > 0) {
      const addr = customer.addresses[0];
      profile.address = {
        street: addr.addressLine1 || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
        country: 'India'
      };
    }

    console.log('Profile sent successfully');
    res.json({ success: true, data: profile });
    
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    console.log('=== UPDATE Customer Profile ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    const { name, email, phone, gstin, preferredUnits, address } = req.body;
    
    // 1. Update User
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }
      user.email = email;
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();
    console.log('User updated successfully');

    // 2. Update Customer
    let customer = await Customer.findOne({ userId: user._id });
    if (!customer) {
      customer = new Customer({ userId: user._id });
    }
    
    if (gstin !== undefined) customer.gstin = gstin || null;
    if (preferredUnits !== undefined) customer.preferredUnits = preferredUnits;
    
    // 3. Handle address
    if (address) {
      if (!customer.addresses) {
        customer.addresses = [];
      }
      
      // Build address object
      const addressObj = {
        addressLine1: address.street || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        isDefault: true
      };
      
      // Check if address has any data
      const hasAddressData = addressObj.addressLine1 || addressObj.city || addressObj.state || addressObj.pincode;
      
      if (hasAddressData) {
        if (customer.addresses.length > 0) {
          // Update existing address
          customer.addresses[0] = addressObj;
        } else {
          // Add new address
          customer.addresses.push(addressObj);
        }
        console.log('Address updated:', addressObj);
      } else if (customer.addresses.length > 0 && !hasAddressData) {
        // Clear address if empty data is sent
        customer.addresses = [];
      }
    }
    
    await customer.save();
    console.log('Customer updated successfully');

    // 4. Prepare response
    const responseAddress = {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    };
    
    if (customer.addresses && customer.addresses.length > 0) {
      const addr = customer.addresses[0];
      responseAddress.street = addr.addressLine1 || '';
      responseAddress.city = addr.city || '';
      responseAddress.state = addr.state || '';
      responseAddress.pincode = addr.pincode || '';
    }

    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      gstin: customer.gstin || '',
      preferredUnits: customer.preferredUnits || 'feet',
      address: responseAddress
    };

    res.json({ success: true, data: profile });
    
  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadCustomerAvatar = async (req, res) => {
  try {
    console.log('=== Upload Customer Avatar ===');
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Create a data URL from the buffer
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    user.avatar = dataUrl;
    await user.save();
    
    console.log('Avatar saved as data URL');
    res.json({ success: true, avatar: user.avatar });
    
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeCustomerAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.avatar = null;
    await user.save();
    res.json({ success: true, message: 'Avatar removed' });
  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== SELLER PROFILE ====================
exports.getSellerProfile = async (req, res) => {
  try {
    console.log('=== GET Seller Profile ===');
    console.log('User ID:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let seller = await Seller.findOne({ userId: user._id });
    
    // Create seller if doesn't exist
    if (!seller) {
      seller = new Seller({ 
        userId: user._id,
        businessName: user.name || ''
      });
      await seller.save();
      console.log('Created new seller profile');
    }
    
    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || null,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      businessName: seller.businessName || '',
      businessAddress: {
        street: seller.businessAddress?.addressLine1 || '',
        city: seller.businessAddress?.city || '',
        state: seller.businessAddress?.state || '',
        pincode: seller.businessAddress?.pincode || '',
        country: 'India'
      },
      gstin: seller.gstin || '',
      pan: seller.pan || '',
      bankDetails: {
        accountHolderName: seller.bankDetails?.accountHolderName || '',
        accountNumber: seller.bankDetails?.accountNumber || '',
        ifscCode: seller.bankDetails?.ifscCode || '',
        bankName: seller.bankDetails?.bankName || '',
        branchName: seller.bankDetails?.branchName || ''
      }
    };

    console.log('Seller profile sent successfully');
    res.json({ success: true, data: profile });
    
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSellerProfile = async (req, res) => {
  try {
    console.log('=== UPDATE Seller Profile ===');
    console.log('Request body:', req.body);
    
    const { name, email, phone, businessName, businessAddress, gstin, pan, bankDetails } = req.body;
    
    // 1. Update User
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }
      user.email = email;
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();
    console.log('User updated successfully');

    // 2. Update Seller
    let seller = await Seller.findOne({ userId: user._id });
    if (!seller) {
      seller = new Seller({ userId: user._id });
    }
    
    if (businessName !== undefined) seller.businessName = businessName;
    if (gstin !== undefined) seller.gstin = gstin;
    if (pan !== undefined) seller.pan = pan;
    
    // Update business address
    if (businessAddress) {
      seller.businessAddress = {
        addressLine1: businessAddress.street || '',
        addressLine2: businessAddress.addressLine2 || '',
        city: businessAddress.city || '',
        state: businessAddress.state || '',
        pincode: businessAddress.pincode || ''
      };
    }
    
    // Update bank details
    if (bankDetails) {
      seller.bankDetails = {
        accountHolderName: bankDetails.accountHolderName || '',
        accountNumber: bankDetails.accountNumber || '',
        ifscCode: bankDetails.ifscCode || '',
        bankName: bankDetails.bankName || '',
        branchName: bankDetails.branchName || ''
      };
    }
    
    await seller.save();
    console.log('Seller updated successfully');

    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      businessName: seller.businessName || '',
      businessAddress: {
        street: seller.businessAddress?.addressLine1 || '',
        city: seller.businessAddress?.city || '',
        state: seller.businessAddress?.state || '',
        pincode: seller.businessAddress?.pincode || '',
        country: 'India'
      },
      gstin: seller.gstin || '',
      pan: seller.pan || '',
      bankDetails: {
        accountHolderName: seller.bankDetails?.accountHolderName || '',
        accountNumber: seller.bankDetails?.accountNumber || '',
        ifscCode: seller.bankDetails?.ifscCode || '',
        bankName: seller.bankDetails?.bankName || '',
        branchName: seller.bankDetails?.branchName || ''
      }
    };

    res.json({ success: true, data: profile });
    
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadSellerAvatar = async (req, res) => {
  try {
    console.log('=== Upload Seller Avatar ===');
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    user.avatar = dataUrl;
    await user.save();
    
    res.json({ success: true, avatar: user.avatar });
    
  } catch (error) {
    console.error('Upload seller avatar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeSellerAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.avatar = null;
    await user.save();
    res.json({ success: true, message: 'Avatar removed' });
  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== DESIGNER PROFILE ====================
exports.getDesignerProfile = async (req, res) => {
  try {
    console.log('=== GET Designer Profile ===');
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let designer = await Designer.findOne({ userId: user._id });
    
    if (!designer) {
      designer = new Designer({ userId: user._id });
      await designer.save();
      console.log('Created new designer profile');
    }
    
    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || null,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      specialization: designer.specialization || [],
      experience: designer.experience || '',
      bio: designer.bio || '',
      portfolio: designer.portfolio || []
    };

    res.json({ success: true, data: profile });
    
  } catch (error) {
    console.error('Get designer profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateDesignerProfile = async (req, res) => {
  try {
    console.log('=== UPDATE Designer Profile ===');
    console.log('Request body:', req.body);
    
    const { name, email, phone, specialization, experience, bio, portfolio } = req.body;
    
    // 1. Update User
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }
      user.email = email;
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    // 2. Update Designer
    let designer = await Designer.findOne({ userId: user._id });
    if (!designer) {
      designer = new Designer({ userId: user._id });
    }
    
    if (specialization !== undefined) designer.specialization = specialization;
    if (experience !== undefined) designer.experience = experience;
    if (bio !== undefined) designer.bio = bio;
    if (portfolio !== undefined) designer.portfolio = portfolio;
    
    await designer.save();

    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      specialization: designer.specialization || [],
      experience: designer.experience || '',
      bio: designer.bio || '',
      portfolio: designer.portfolio || []
    };

    res.json({ success: true, data: profile });
    
  } catch (error) {
    console.error('Update designer profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadDesignerAvatar = async (req, res) => {
  try {
    console.log('=== Upload Designer Avatar ===');
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    user.avatar = dataUrl;
    await user.save();
    
    res.json({ success: true, avatar: user.avatar });
    
  } catch (error) {
    console.error('Upload designer avatar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeDesignerAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.avatar = null;
    await user.save();
    res.json({ success: true, message: 'Avatar removed' });
  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};