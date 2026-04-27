import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Building,
  User,
  FileText,
  Settings,
  Bell,
  BarChart,
  Users,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  active?: boolean;
  badge?: number;
  children?: SidebarItem[];
}

interface SidebarProps {
  items?: SidebarItem[] | undefined;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarUserName: React.FC = () => {
  const { user } = useAuth();
  return <p className="text-sm font-medium text-gray-900">{user ? `${user.firstName} ${user.lastName}` : 'User'}</p>;
};

const SidebarUserRole: React.FC = () => {
  const { user } = useAuth();
  const roleLabels: Record<string, string> = {
    candidate: 'Job Seeker',
    employer: 'Employer',
    admin: 'Administrator',
  };
  return <p className="text-xs text-gray-500">{user ? roleLabels[user.role] || user.role : ''}</p>;
};

const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onToggleCollapse 
}) => {
  const location = useLocation();

  const defaultItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard',
    },
    {
      label: 'My Jobs',
      icon: <Briefcase className="w-5 h-5" />,
      path: '/dashboard/jobs',
      badge: 3,
    },
    {
      label: 'Applications',
      icon: <FileText className="w-5 h-5" />,
      path: '/dashboard/applications',
    },
    {
      label: 'Companies',
      icon: <Building className="w-5 h-5" />,
      path: '/dashboard/companies',
    },
    {
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      path: '/dashboard/profile',
    },
    {
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/dashboard/notifications',
      badge: 5,
    },
    {
      label: 'Analytics',
      icon: <BarChart className="w-5 h-5" />,
      path: '/dashboard/analytics',
    },
    {
      label: 'Team',
      icon: <Users className="w-5 h-5" />,
      path: '/dashboard/team',
    },
    {
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/dashboard/settings',
    },
    {
      label: 'Help & Support',
      icon: <HelpCircle className="w-5 h-5" />,
      path: '/dashboard/help',
    },
  ];

  const sidebarItems = items || defaultItems;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside className={`bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`
                  flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                  ${active 
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <div className={`${active ? 'text-primary-600' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!collapsed && (
                  <>
                    <span className="ml-3 flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        {!collapsed && (
          <div className="px-4 my-6">
            <div className="border-t border-gray-200"></div>
          </div>
        )}

        {/* User Profile Section */}
        {!collapsed && (
          <div className="px-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <SidebarUserName />
                  <SidebarUserRole />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed ? (
          <div className="text-xs text-gray-500">
            <p>© {new Date().getFullYear()} JobBoard</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">JB</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;