import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const pdfGenerator = {
  // Generate quotation PDF
  generateQuotation: async (quotation) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233);
    doc.text('QUOTATION', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`#${quotation.quotationNumber}`, 14, 28);
    
    // Company details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(quotation.seller?.businessName || 'SmartSeller', 14, 40);
    doc.setFontSize(9);
    doc.text(`GST: ${quotation.seller?.gstin || 'N/A'}`, 14, 46);
    
    // Customer details
    doc.text('Bill To:', 14, 60);
    doc.setFontSize(10);
    doc.text(quotation.customer?.name || '', 14, 66);
    doc.setFontSize(9);
    doc.text(quotation.customer?.address || '', 14, 72);
    
    // Date
    doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, 140, 60);
    doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 140, 66);
    
    // Items table
    const tableData = quotation.items.map(item => [
      item.materialName,
      item.quantity.toString(),
      item.unit,
      `₹${item.pricePerUnit}`,
      `${item.gstRate}%`,
      `₹${item.total.toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: 85,
      head: [['Item', 'Qty', 'Unit', 'Price', 'GST', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] }
    });
    
    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.text('Subtotal:', 140, finalY);
    doc.text(`₹${quotation.subtotal.toFixed(2)}`, 170, finalY, { align: 'right' });
    
    doc.text('GST:', 140, finalY + 6);
    doc.text(`₹${quotation.gstTotal.toFixed(2)}`, 170, finalY + 6, { align: 'right' });
    
    if (quotation.discount > 0) {
      doc.text('Discount:', 140, finalY + 12);
      doc.text(`-₹${quotation.discount.toFixed(2)}`, 170, finalY + 12, { align: 'right' });
    }
    
    doc.setFontSize(12);
    doc.setTextColor(14, 165, 233);
    doc.text('Total:', 140, finalY + 20);
    doc.text(`₹${quotation.total.toFixed(2)}`, 170, finalY + 20, { align: 'right' });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is a computer generated quotation. No signature required.', 14, 280);
    
    return doc;
  },
  
  // Generate invoice PDF
  generateInvoice: async (invoice) => {
    const doc = new jsPDF();
    
    // Similar structure to quotation but with invoice-specific details
    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233);
    doc.text('INVOICE', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`#${invoice.invoiceNumber}`, 14, 28);
    
    // ... rest of the invoice generation logic
    
    return doc;
  },
  
  // Download PDF
  downloadPDF: (doc, filename) => {
    doc.save(`${filename}.pdf`);
  }
};