import React from 'react';
import { Header, Footer } from './components';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        // ... existing code ...
      </main>
      <Footer />
    </div>
  );
};

export default Layout;