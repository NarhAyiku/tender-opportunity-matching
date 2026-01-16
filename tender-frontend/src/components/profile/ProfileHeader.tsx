import { User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { useAuthStore } from '../../stores';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const completionPercentage = user.profile_completion || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {user.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.name || 'Profile'}
              className="w-20 h-20 rounded-full object-cover bg-gray-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-primary-600" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {user.name || 'Complete your profile'}
            </h1>
            <p className="text-gray-600">{user.email}</p>
            {user.headline && (
              <p className="text-gray-500 text-sm mt-1">{user.headline}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/preferences')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Profile completion */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Profile completion</span>
          <span className="text-primary-600 font-semibold">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
