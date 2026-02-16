import React, { useState } from 'react';
import Modal from '../common/Modal';
import { EnvelopeIcon, LinkIcon, DocumentArrowDownIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ShareQuoteModal = ({ isOpen, onClose, quote }) => {
  const [email, setEmail] = useState('');
  const [shareMethod, setShareMethod] = useState('email');

  const handleShare = () => {
    if (shareMethod === 'email') {
      // Send email
      toast.success(`Quote sent to ${email}`);
    } else if (shareMethod === 'link') {
      // Copy link
      navigator.clipboard.writeText(`${window.location.origin}/quote/${quote._id}`);
      toast.success('Link copied to clipboard');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Quotation" size="md">
      <div className="space-y-6">
        {/* Share Methods */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShareMethod('email')}
            className={`flex-1 p-4 border rounded-lg text-center transition-all ${
              shareMethod === 'email' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <EnvelopeIcon className={`h-6 w-6 mx-auto mb-2 ${shareMethod === 'email' ? 'text-primary-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${shareMethod === 'email' ? 'text-primary-600' : 'text-gray-600'}`}>Email</span>
          </button>

          <button
            onClick={() => setShareMethod('link')}
            className={`flex-1 p-4 border rounded-lg text-center transition-all ${
              shareMethod === 'link' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <LinkIcon className={`h-6 w-6 mx-auto mb-2 ${shareMethod === 'link' ? 'text-primary-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${shareMethod === 'link' ? 'text-primary-600' : 'text-gray-600'}`}>Share Link</span>
          </button>

          <button
            onClick={() => setShareMethod('download')}
            className={`flex-1 p-4 border rounded-lg text-center transition-all ${
              shareMethod === 'download' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <DocumentArrowDownIcon className={`h-6 w-6 mx-auto mb-2 ${shareMethod === 'download' ? 'text-primary-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${shareMethod === 'download' ? 'text-primary-600' : 'text-gray-600'}`}>Download</span>
          </button>

          <button
            onClick={() => setShareMethod('qr')}
            className={`flex-1 p-4 border rounded-lg text-center transition-all ${
              shareMethod === 'qr' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <QrCodeIcon className={`h-6 w-6 mx-auto mb-2 ${shareMethod === 'qr' ? 'text-primary-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${shareMethod === 'qr' ? 'text-primary-600' : 'text-gray-600'}`}>QR Code</span>
          </button>
        </div>

        {/* Email Input */}
        {shareMethod === 'email' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="customer@example.com"
            />
          </div>
        )}

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Quotation #{quote?.quotationNumber}</p>
          <p className="text-xs text-gray-500">Valid until: {new Date(quote?.validUntil).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total Amount: ₹{quote?.total?.toFixed(2)}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleShare} className="btn-primary">
            {shareMethod === 'email' ? 'Send Email' : shareMethod === 'link' ? 'Copy Link' : shareMethod === 'download' ? 'Download PDF' : 'Generate QR'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareQuoteModal;