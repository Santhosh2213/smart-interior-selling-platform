exports.authorize = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: `User role ${req.user.role} is not authorized to access this route`
        });
      }
      next();
    };
  };
  
  // Specific role middleware
  exports.isCustomer = (req, res, next) => {
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Only customers can access this route'
      });
    }
    next();
  };
  
  exports.isSeller = (req, res, next) => {
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        error: 'Only sellers can access this route'
      });
    }
    next();
  };
  
  exports.isDesigner = (req, res, next) => {
    if (req.user.role !== 'designer') {
      return res.status(403).json({
        success: false,
        error: 'Only designers can access this route'
      });
    }
    next();
  };