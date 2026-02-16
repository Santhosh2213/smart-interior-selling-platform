import React, { useState } from 'react';
import { 
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: 'How do I create a new project?',
      answer: 'To create a new project, log in to your customer account, click on "New Project" from the dashboard, fill in the project details, add measurements, upload photos, and select materials. Once done, submit it for quotation.'
    },
    {
      question: 'How are GST rates calculated?',
      answer: 'GST rates are applied based on the material category. Tiles: 5%, Wood: 12%, Glass: 18%, Paints: 18%, Hardware: 12%. The total GST is split equally into CGST and SGST for intra-state transactions.'
    },
    {
      question: 'How long does it take to get a quotation?',
      answer: 'Typically, sellers respond to quotation requests within 24-48 hours. You will receive a notification once your quotation is ready.'
    },
    {
      question: 'Can I edit my project after submission?',
      answer: 'Once a project is submitted for quotation, you cannot edit it. However, you can contact the seller through chat to discuss any changes.'
    },
    {
      question: 'How do I track my order?',
      answer: 'After your quotation is accepted and payment is made, you can track your order status from the Order Tracking page in your dashboard.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept Credit/Debit cards, UPI (Google Pay, PhonePe, Paytm), and Net Banking from all major banks.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const guides = [
        {
      title: 'Getting Started Guide',
      description: 'Learn how to create your first project and get quotations',
      icon: BookOpenIcon,
      link: '/help/getting-started'
    },
    {
      title: 'Seller Handbook',
      description: 'Complete guide for sellers to manage their business',
      icon: BookOpenIcon,
      link: '/help/seller-handbook'
    },
    {
      title: 'Designer Tips',
      description: 'Best practices for providing design consultations',
      icon: BookOpenIcon,
      link: '/help/designer-tips'
    }
  ];

  const support = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: ChatBubbleLeftIcon,
      action: 'Start Chat',
      link: '/chat/support'
    },
    {
      title: 'Phone Support',
      description: 'Call us at +91 98765 43210',
      icon: PhoneIcon,
      action: 'Call Now',
      link: 'tel:+919876543210'
    },
    {
      title: 'Email Support',
      description: 'support@smartseller.com',
      icon: EnvelopeIcon,
      action: 'Send Email',
      link: 'mailto:support@smartseller.com'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">How can we help you?</h1>
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <QuestionMarkCircleIcon className="h-6 w-6 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No FAQs found matching your search.</p>
          </div>
        )}
      </div>

      {/* Guides */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Guides & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <a
                key={index}
                href={guide.link}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <Icon className="h-8 w-8 text-primary-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-600">{guide.description}</p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Contact Support */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {support.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6 text-center">
                <Icon className="h-8 w-8 text-primary-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                <a
                  href={item.link}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {item.action} →
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Business Hours */}
      <div className="mt-12 bg-primary-50 rounded-lg p-6">
        <h3 className="font-semibold text-primary-900 mb-2">Business Hours</h3>
        <p className="text-primary-800">Monday - Friday: 9:00 AM - 6:00 PM</p>
        <p className="text-primary-800">Saturday: 10:00 AM - 4:00 PM</p>
        <p className="text-primary-800">Sunday: Closed</p>
        <p className="text-primary-800 mt-2">We typically respond within 24 hours during business days.</p>
      </div>
    </div>
  );
};

export default HelpCenter;