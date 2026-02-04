import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, Briefcase, Inbox, User, Bookmark, Zap } from 'lucide-react';

const tabs = [
  { path: '/feed', label: 'Feed', icon: LayoutGrid },
  { path: '/saved', label: 'Saved', icon: Bookmark },
  { path: '/applications', label: 'Applied', icon: Briefcase },
  { path: '/inbox', label: 'Inbox', icon: Inbox },
  { path: '/profile', label: 'Profile', icon: User }
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Don't show nav on auth pages or when not authenticated
  if (!isAuthenticated || ['/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  // Don't show on preview or screening pages (screening is a full-blocking flow)
  if (location.pathname.startsWith('/preview/') || location.pathname === '/screening') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

      <div className="safe-area-bottom pb-4 px-4 pointer-events-auto">
        <nav className="glass backdrop-blur-xl bg-white/80 border border-white/50 shadow-2xl shadow-purple-500/10 rounded-3xl h-16 flex items-center justify-around relative">

          {tabs.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || (path === '/feed' && location.pathname === '/');

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${isActive
                  ? 'text-purple-600 -translate-y-2'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                  }`}
              >
                {/* Active Indicator Background */}
                <div
                  className={`absolute inset-0 bg-white rounded-2xl shadow-lg shadow-purple-200/50 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                />

                {/* Icon */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? 'text-purple-600 fill-purple-100' : 'text-slate-400'}
                    />
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold leading-none animate-in fade-in slide-in-from-bottom-1 duration-300">
                      {label}
                    </span>
                  )}
                </div>

                {/* Active Dot */}
                {isActive && (
                  <div className="absolute -bottom-2 w-1 h-1 bg-purple-500 rounded-full animate-in zoom-in duration-300" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
