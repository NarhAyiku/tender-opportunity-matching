import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Bookmark, User, MessageSquare } from 'lucide-react';

const navItems = [
  { path: '/feed', icon: Home, label: 'Feed' },
  { path: '/inbox', icon: MessageSquare, label: 'Inbox' },
  { path: '/applications', icon: Briefcase, label: 'Apps' },
  { path: '/saved', icon: Bookmark, label: 'Saved' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
