import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bars3Icon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="h-16 flex justify-between items-center px-4 relative">
        {/* Menu button (mobile only) */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          )}
          
          {/* Breadcrumb area */}
          <div className="flex-1">
            {/* Add breadcrumb here if needed */}
          </div>
        </div>

        {/* Profile section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <UserCircleIcon className="h-5 w-5" />
            </div>
            <span className="hidden md:block text-sm font-medium">
              {user?.username}
            </span>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/admin/settings');
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center mr-3">
                  <Cog6ToothIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">Pengaturan</span>
                  <span className="text-xs text-gray-500">Kelola akun Anda</span>
                </div>
              </button>
              <div className="h-[1px] bg-gray-200 my-1 mx-4"></div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mr-3">
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">Logout</span>
                  <span className="text-xs text-red-500">Keluar dari aplikasi</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;