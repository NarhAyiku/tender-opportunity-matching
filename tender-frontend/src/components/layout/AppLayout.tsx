import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sparkles, Bell } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function AppLayout({ children, showNav = true }: AppLayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <Sparkles size={18} />
          </div>
          <span className="text-xl font-display font-bold text-gray-900 tracking-tight">The Hub</span>
        </div>

        <nav className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-full">
          {[
            { path: '/feed', label: 'Discover' },
            { path: '/applications', label: 'Applications' },
            { path: '/saved', label: 'Saved' }
          ].map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${isActive(link.path)
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <Bell size={20} />
          </button>

          <Link to="/profile">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-md">
              JD
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-display font-bold text-gray-900">The Hub</span>
        </div>
        <Link to="/profile">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
            JD
          </div>
        </Link>
      </header>

      <main className={`flex-1 ${showNav ? 'pb-20 md:pb-0' : ''} max-w-7xl mx-auto w-full`}>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
