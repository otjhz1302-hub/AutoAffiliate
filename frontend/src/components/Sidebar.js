import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Calendar, FileText, BarChart3, Package, LogOut, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = ({ admin, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/integrations', icon: Settings, label: 'Integrations' },
    { path: '/scheduler', icon: Calendar, label: 'Scheduler' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/posts', icon: FileText, label: 'Posts' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <div className="w-64 h-screen bg-white/95 backdrop-blur-xl border-r border-gray-200 flex flex-col fixed left-0 top-0 shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">AutoAffiliate</h2>
            <p className="text-xs text-gray-500">Publisher</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Logged in as</p>
          <p className="font-semibold text-gray-900 truncate">{admin?.username}</p>
        </div>
        <Button
          onClick={onLogout}
          data-testid="logout-button"
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;