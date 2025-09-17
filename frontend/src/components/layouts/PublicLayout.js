import React from 'react';
import Navigation from '../common/Navigation';
import Footer from '../common/Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;