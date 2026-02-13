// @desc    Get all quotations
// @route   GET /api/quotations
exports.getQuotations = (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get all quotations'
    });
  };
  
  // @desc    Get single quotation
  // @route   GET /api/quotations/:id
  exports.getQuotationById = (req, res) => {
    res.status(200).json({
      success: true,
      message: `Get quotation with id ${req.params.id}`
    });
  };
  
  // @desc    Create quotation
  // @route   POST /api/quotations
  exports.createQuotation = (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create quotation'
    });
  };
  
  // @desc    Update quotation
  // @route   PUT /api/quotations/:id
  exports.updateQuotation = (req, res) => {
    res.status(200).json({
      success: true,
      message: `Update quotation with id ${req.params.id}`
    });
  };
  
  // @desc    Delete quotation
  // @route   DELETE /api/quotations/:id
  exports.deleteQuotation = (req, res) => {
    res.status(200).json({
      success: true,
      message: `Delete quotation with id ${req.params.id}`
    });
  };
  
  // @desc    Generate quotation PDF
  // @route   GET /api/quotations/:id/pdf
  exports.generateQuotationPDF = (req, res) => {
    res.status(200).json({
      success: true,
      message: `Generate PDF for quotation with id ${req.params.id}`
    });
  };