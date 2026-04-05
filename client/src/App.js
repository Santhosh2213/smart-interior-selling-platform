import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <AppRoutes />
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              // Default options for all toasts
              duration: 4000,
              className: '',
              style: {
                padding: '16px',
                borderRadius: '12px',
                background: '#fff',
                color: '#1f2937',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                fontWeight: '500',
                fontSize: '14px',
                maxWidth: '380px',
                border: '1px solid #e5e7eb',
              },
              // Success toast styling
              success: {
                duration: 4000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #86efac',
                  boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.2)',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f0fdf4',
                },
              },
              // Error toast styling
              error: {
                duration: 5000,
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.2)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
              // Loading toast styling
              loading: {
                duration: Infinity,
                style: {
                  background: '#eff6ff',
                  color: '#1e40af',
                  border: '1px solid #93c5fd',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#eff6ff',
                },
              },
            }}
          >
            {/* Custom close button can be added here if needed */}
            {(t) => (
              <div className="flex items-center justify-between w-full">
                <span>{t.message}</span>
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </Toaster>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;