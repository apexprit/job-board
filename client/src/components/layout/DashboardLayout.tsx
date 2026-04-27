import React, { useState, ReactNode, useMemo } from 'react';
import Sidebar, { SidebarItem } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
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
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  sidebarItems?: SidebarItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showFooter: _showFooter = true,
  sidebarItems,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Generate role-based sidebar items
  const defaultSidebarItems: SidebarItem[] = useMemo(() => {
    const role = user?.role || 'candidate';
    
    if (role === 'employer') {
      return [
        { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/employer/dashboard' },
        { label: 'My Jobs', icon: <Briefcase className="w-5 h-5" />, path: '/employer/jobs' },
        { label: 'Applications', icon: <FileText className="w-5 h-5" />, path: '/employer/applications' },
        { label: 'Company', icon: <Building className="w-5 h-5" />, path: '/employer/company' },
        { label: 'Profile', icon: <User className="w-5 h-5" />, path: '/employer/profile' },
        { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/employer/settings' },
      ];
    }
    
    if (role === 'admin') {
      return [
        { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/admin/dashboard' },
        { label: 'Users', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
        { label: 'Jobs', icon: <Briefcase className="w-5 h-5" />, path: '/admin/jobs' },
        { label: 'Analytics', icon: <BarChart className="w-5 h-5" />, path: '/admin/analytics' },
        { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
      ];
    }
    
    // Candidate (seeker) default
    return [
      { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/seeker/dashboard' },
      { label: 'Find Jobs', icon: <Briefcase className="w-5 h-5" />, path: '/jobs' },
      { label: 'Applications', icon: <FileText className="w-5 h-5" />, path: '/seeker/applications' },
      { label: 'Profile', icon: <User className="w-5 h-5" />, path: '/seeker/profile' },
      { label: 'Notifications', icon: <Bell className="w-5 h-5" />, path: '/seeker/notifications' },
      { label: 'Help & Support', icon: <HelpCircle className="w-5 h-5" />, path: '/seeker/help' },
    ];
  }, [user?.role]);

  return (
    <div className="flex flex-1">
        {/* Sidebar - Only show for authenticated users */}
        {user && (
          <Sidebar
            items={sidebarItems || defaultSidebarItems}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        )}

        {/* Main Content */}
      <main className={`flex-1 ${user ? '' : 'max-w-7xl mx-auto w-full'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;