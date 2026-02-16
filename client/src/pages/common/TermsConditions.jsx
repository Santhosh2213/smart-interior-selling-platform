import React from 'react';

const TermsConditions = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
      <p className="text-gray-600 mb-8">Last updated: February 2024</p>

      <div className="prose prose-primary max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-600 mb-2">
            Welcome to SmartSeller Platform. By accessing or using our platform, you agree to be bound by these terms and conditions. Please read them carefully before using our services.
          </p>
          <p className="text-gray-600">
            If you do not agree with any part of these terms, you may not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Definitions</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><strong>"Platform"</strong> refers to the SmartSeller website and mobile application.</li>
            <li><strong>"User"</strong> refers to any individual or entity using the Platform.</li>
            <li><strong>"Customer"</strong> refers to users seeking quotations for construction materials.</li>
            <li><strong>"Seller"</strong> refers to businesses providing quotations and selling materials.</li>
            <li><strong>"Designer"</strong> refers to professionals providing design consultations.</li>
            <li><strong>"Content"</strong> refers to all information, data, text, images, and materials on the Platform.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
          <p className="text-gray-600 mb-2">
            To use certain features of the Platform, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
            <li>Updating your information as necessary</li>
          </ul>
          <p className="text-gray-600 mt-2">
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Services</h2>
          <h3 className="font-medium text-gray-900 mb-2">For Customers:</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Create and manage construction projects</li>
            <li>Upload photos and add measurements</li>
            <li>Receive quotations from sellers</li>
            <li>Get design consultations</li>
            <li>Place orders and track deliveries</li>
          </ul>

          <h3 className="font-medium text-gray-900 mb-2">For Sellers:</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Receive project requests</li>
            <li>Create and send quotations</li>
            <li>Manage material database</li>
            <li>Process orders and generate invoices</li>
            <li>Track payments</li>
          </ul>

          <h3 className="font-medium text-gray-900 mb-2">For Designers:</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Provide design consultations</li>
            <li>Suggest materials</li>
            <li>Review project photos</li>
            <li>Collaborate with customers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Quotations and Payments</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>All quotations provided by sellers are estimates and may vary based on actual requirements.</li>
            <li>Quotations are valid for the period specified in the document.</li>
            <li>Payments must be made through the Platform's integrated payment system.</li>
            <li>We use Razorpay for secure payment processing.</li>
            <li>Refunds are subject to the seller's return and refund policy.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. GST and Taxes</h2>
          <p className="text-gray-600 mb-2">
            All prices displayed are exclusive of applicable taxes unless stated otherwise. GST will be calculated and added as per the prevailing rates:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Tiles: 5% GST</li>
            <li>Wood: 12% GST</li>
            <li>Glass: 18% GST</li>
            <li>Paints: 18% GST</li>
            <li>Hardware: 12% GST</li>
          </ul>
          <p className="text-gray-600 mt-2">
            Sellers are responsible for issuing valid tax invoices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-600 mb-2">
            All content on the Platform, including but not limited to logos, designs, text, graphics, software, and source code, is the property of SmartSeller or its licensors and is protected by intellectual property laws.
          </p>
          <p className="text-gray-600">
            Users may not copy, modify, distribute, or create derivative works without explicit permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
          <p className="text-gray-600 mb-2">
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using the Platform, you consent to our privacy practices.
          </p>
          <p className="text-gray-600">
            We use industry-standard security measures to protect your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-600">
            To the maximum extent permitted by law, SmartSeller shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mt-2">
            <li>Your use or inability to use the Platform</li>
            <li>Any conduct or content of any third party</li>
            <li>Unauthorized access to or alteration of your transmissions or data</li>
            <li>Statements or conduct of any third party</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
          <p className="text-gray-600">
            You agree to indemnify and hold SmartSeller and its affiliates, officers, agents, and employees harmless from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of your use of the Platform, your violation of these Terms, or your violation of any rights of another.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Modifications to Terms</h2>
          <p className="text-gray-600">
            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Platform. Your continued use of the Platform after such modifications constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
          <p className="text-gray-600">
            These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
          <p className="text-gray-600 mb-2">If you have any questions about these Terms, please contact us at:</p>
          <ul className="list-none text-gray-600">
            <li><strong>Email:</strong> legal@smartseller.com</li>
            <li><strong>Phone:</strong> +91 98765 43210</li>
            <li><strong>Address:</strong> 123 Business Park, Mumbai, Maharashtra - 400001</li>
          </ul>
        </section>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-center">
            By using SmartSeller Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;