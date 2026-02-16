export const gstCalculator = {
  // Calculate GST for a single item
  calculateItemGST: (amount, rate) => {
    const gstAmount = amount * (rate / 100);
    return {
      amount,
      rate,
      gst: gstAmount,
      total: amount + gstAmount,
      cgst: gstAmount / 2,
      sgst: gstAmount / 2
    };
  },
  
  // Calculate total GST for multiple items
  calculateTotalGST: (items) => {
    let subtotal = 0;
    let gstTotal = 0;
    
    items.forEach(item => {
      const itemSubtotal = item.quantity * item.pricePerUnit;
      const itemGST = itemSubtotal * (item.gstRate / 100);
      
      subtotal += itemSubtotal;
      gstTotal += itemGST;
    });
    
    return {
      subtotal,
      gstTotal,
      total: subtotal + gstTotal
    };
  },
  
  // Split GST into CGST and SGST
  splitGST: (amount, rate) => {
    const gstAmount = amount * (rate / 100);
    return {
      cgst: gstAmount / 2,
      sgst: gstAmount / 2
    };
  },
  
  // Calculate final amount after discount
  calculateFinalAmount: (subtotal, gstTotal, discount = 0, discountType = 'percentage') => {
    let discountAmount = 0;
    
    if (discountType === 'percentage') {
      discountAmount = (subtotal + gstTotal) * (discount / 100);
    } else {
      discountAmount = discount;
    }
    
    return {
      subtotal,
      gstTotal,
      discount: discountAmount,
      total: subtotal + gstTotal - discountAmount
    };
  },
  
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }
};