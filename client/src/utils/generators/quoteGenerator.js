import { pdfGenerator } from './pdfGenerator';

export const quoteGenerator = {
  // Generate quote number
  generateQuoteNumber: () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `QT-${year}${month}-${random}`;
  },
  
  // Calculate quote summary
  calculateSummary: (items, laborCost = 0, transportCost = 0, discount = 0, discountType = 'percentage') => {
    let subtotal = 0;
    let gstTotal = 0;
    
    items.forEach(item => {
      const itemSubtotal = item.quantity * item.pricePerUnit;
      subtotal += itemSubtotal;
      gstTotal += itemSubtotal * (item.gstRate / 100);
    });
    
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal + gstTotal) * (discount / 100);
    } else {
      discountAmount = discount;
    }
    
    const total = subtotal + gstTotal + laborCost + transportCost - discountAmount;
    
    return {
      subtotal,
      gstTotal,
      laborCost,
      transportCost,
      discount: discountAmount,
      total
    };
  },
  
  // Validate quote items
  validateItems: (items) => {
    return items.every(item => 
      item.materialId &&
      item.quantity > 0 &&
      item.pricePerUnit > 0 &&
      item.gstRate >= 0
    );
  },
  
  // Generate PDF
  generatePDF: async (quotation) => {
    return await pdfGenerator.generateQuotation(quotation);
  }
};