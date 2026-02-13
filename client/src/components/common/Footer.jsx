import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 text-sm">
            © 2024 SmartSeller Platform. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/terms" className="text-gray-600 hover:text-primary-600 text-sm">
              Terms
            </a>
            <a href="/privacy" className="text-gray-600 hover:text-primary-600 text-sm">
              Privacy
            </a>
            <a href="/help" className="text-gray-600 hover:text-primary-600 text-sm">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;