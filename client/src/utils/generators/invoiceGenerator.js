import { pdfGenerator } from './pdfGenerator';

export const invoiceGenerator = {
  // Generate invoice from order
  generateFromOrder: (order) => {
    return {
      invoiceNumber: `INV-${Date.now()}`,
      orderId: order._id,
      customer: order.customer,
      seller: order.seller,
      items: order.items,
      subtotal: order.subtotal,
      gstTotal: order.gstTotal,
      discount: order.discount,
      total: order.total,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      paymentStatus: 'pending'
    };
  },
  
  // Calculate tax breakup
  calculateTaxBreakup: (items) => {
    const breakup = {};
    
    items.forEach(item => {
      const rate = item.gstRate;
      if (!breakup[rate]) {
        breakup[rate] = {
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          total: 0
        };
      }
      
      breakup[rate].taxableValue += item.subtotal;
      breakup[rate].cgst += item.subtotal * (rate / 2 / 100);
      breakup[rate].sgst += item.subtotal * (rate / 2 / 100);
      breakup[rate].total += item.subtotal * (rate / 100);
    });
    
    return breakup;
  },
  
  // Format invoice number
  formatInvoiceNumber: (number) => {
    return `INV-${new Date().getFullYear()}-${String(number).padStart(6, '0')}`;
  },
  
  // Generate PDF
  generatePDF: async (invoice) => {
    return await pdfGenerator.generateInvoice(invoice);
  }
};