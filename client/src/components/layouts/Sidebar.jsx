import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  Bars2Icon,
  BuildingOffice2Icon,
  ExclamationTriangleIcon // Tambahkan icon ini
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose, isCompact, setIsCompact }) => {
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isCompact) {
        setIsCompact(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCompact, setIsCompact]);

  const navigation = [
    {
      category: 'Menu Utama',
      items: [
        {
          name: 'Dashboard',
          to: '/admin',
          icon: HomeIcon,
          end: true
        },
        {
          name: 'Data Penduduk',
          to: '/admin/citizens',
          icon: UserGroupIcon
        },
        {
          name: 'Data Warning',
          to: '/admin/warning',
          icon: ExclamationTriangleIcon
        },
      ]
    },
    {
      category: 'Layanan Surat',
      items: [
        {
          name: 'Buat Surat',
          to: '/admin/create-letter',
          icon: DocumentTextIcon
        },
        {
          name: 'History Surat',
          to: '/admin/letter-history',
          icon: ClockIcon
        },
      ]
    },
    ...(isSuperAdmin ? [{
      category: 'Administrator',
      items: [
        {
          name: 'Kelola Admin',
          to: '/superadmin/manage-admin',
          icon: Cog6ToothIcon
        },
        {
          name: 'Template Surat',
          to: '/superadmin/letter-templates',
          icon: DocumentTextIcon
        },
        {
          name: 'Pengaturan Desa',
          to: '/superadmin/village-settings',
          icon: BuildingOffice2Icon
        }
      ]
    }] : [])
  ];

  const sidebarClasses = `
    h-full
    bg-white
    ${!isMobile && isCompact ? 'w-16' : 'w-64'}
    flex flex-col
    shadow-lg md:shadow-none
    transition-all duration-300 ease-in-out
    border-r border-gray-200
  `;

  return (
    <div className={sidebarClasses}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
        {(isMobile || !isCompact) && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <span className="text-base font-semibold text-gray-900 truncate">
              Desa Rejomulyo
            </span>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            title={isCompact ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCompact ? (
              <Bars3Icon className="h-5 w-5" />
            ) : (
              <Bars2Icon className="h-5 w-5" />
            )}
          </button>
        )}
        {isMobile && (
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        {navigation.map((section, idx) => (
          <div key={section.category} className={idx !== 0 ? 'mt-6' : ''}>
            {(!isCompact || isMobile) && (
              <div className="px-3 mb-2">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.category}
                </h2>
              </div>
            )}
            
            <div className="space-y-1 px-2">
              {section.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.end}
                  onClick={isMobile ? onClose : undefined}
                  className={props => `
                    flex items-center gap-3 px-3 py-2
                    ${!isMobile && isCompact ? 'justify-center px-2' : ''}
                    rounded-lg
                    transition-all duration-150
                    hover:bg-gray-50
                    ${props.isActive 
                      ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                  title={!isMobile && isCompact ? item.name : undefined}
                >
                  <item.icon className={`
                    flex-shrink-0
                    ${isCompact ? 'h-6 w-6' : 'h-5 w-5'}
                  `} />
                  {(isMobile || !isCompact) && (
                    <span className="font-medium text-sm truncate">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer section */}
      <div className="border-t border-gray-200 px-2 py-4 shrink-0">
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className={`
            flex items-center gap-3 w-full rounded-lg
            ${!isMobile && isCompact ? 'justify-center p-2' : 'px-3 py-2'}
            text-gray-600 hover:text-red-600 hover:bg-red-50
            transition-all duration-150
          `}
          title={!isMobile && isCompact ? 'Logout' : undefined}
        >
          <ArrowLeftOnRectangleIcon className={`
            ${isCompact ? 'h-6 w-6' : 'h-5 w-5'}
          `} />
          {(isMobile || !isCompact) && (
            <span className="font-medium text-sm truncate">Logout</span>
          )}
        </button>
        
        {(isMobile || !isCompact) && (
          <div className="mt-4 px-3">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} KKN UNILA
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;