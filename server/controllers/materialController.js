exports.getMaterials = (req, res) => {
    res.status(200).json({ success: true, message: 'Get all materials' });
  };
  
  exports.getMaterialById = (req, res) => {
    res.status(200).json({ success: true, message: `Get material ${req.params.id}` });
  };
  
  exports.createMaterial = (req, res) => {
    res.status(201).json({ success: true, message: 'Create material' });
  };
  
  exports.updateMaterial = (req, res) => {
    res.status(200).json({ success: true, message: `Update material ${req.params.id}` });
  };
  
  exports.deleteMaterial = (req, res) => {
    res.status(200).json({ success: true, message: `Delete material ${req.params.id}` });
  };