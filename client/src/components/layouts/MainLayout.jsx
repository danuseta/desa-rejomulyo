// MainLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar container */}
      <aside className={`
        fixed md:sticky md:top-0 
        h-screen
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        z-30
      `}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          isCompact={isCompact}
          setIsCompact={setIsCompact}
        />
      </aside>

      {/* Main content area */}
      <div className={`
        flex-1 flex flex-col min-h-screen w-full 
        ${isCompact ? 'md:w-[calc(100%-4rem)]' : 'md:w-[calc(100%-16rem)]'}
        transition-all duration-300 ease-in-out
      `}>
        {/* Fixed navbar that adjusts with sidebar */}
        <header className={`
          fixed top-0 right-0 left-0 
          ${isCompact ? 'md:left-16' : 'md:left-64'}
          transition-all duration-300 ease-in-out
          z-20
        `}>
          <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </header>

        {/* Main content */}
        <main className="flex-1 mt-16 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;