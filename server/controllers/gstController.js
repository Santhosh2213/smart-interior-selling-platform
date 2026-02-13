exports.getGstRates = (req, res) => {
    res.status(200).json({ success: true, message: 'Get all GST rates' });
  };
  
  exports.getGstRateById = (req, res) => {
    res.status(200).json({ success: true, message: `Get GST rate ${req.params.id}` });
  };
  
  exports.createGstRate = (req, res) => {
    res.status(201).json({ success: true, message: 'Create GST rate' });
  };
  
  exports.updateGstRate = (req, res) => {
    res.status(200).json({ success: true, message: `Update GST rate ${req.params.id}` });
  };
  
  exports.deleteGstRate = (req, res) => {
    res.status(200).json({ success: true, message: `Delete GST rate ${req.params.id}` });
  };