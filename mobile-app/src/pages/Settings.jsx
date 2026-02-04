import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Bell,
    Shield,
    CreditCard,
    HelpCircle,
    LogOut,
    Trash2,
    ChevronRight,
    Moon,
    Globe,
    Smartphone,
    Mail,
    Lock,
    ExternalLink,
    Sparkles,
    MessageCircle,
    ChevronLeft,
    X,
} from 'lucide-react';

function SettingsItem({ icon, label, description, onClick, rightElement, danger }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50 rounded-xl ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-900'
                }`}
        >
            <div className={`p-2.5 rounded-xl ${danger ? 'bg-red-50' : 'bg-gray-100'}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`font-semibold ${danger ? 'text-red-600' : 'text-gray-900'}`}>{label}</p>
                {description && (
                    <p className="text-sm text-gray-500 truncate">{description}</p>
                )}
            </div>
            {rightElement || <ChevronRight size={20} className="text-gray-400" />}
        </button>
    );
}

function SettingsSection({ title, children }) {
    return (
        <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">
                {title}
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {children}
            </div>
        </div>
    );
}

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function Settings() {
    const navigate = useNavigate();
    const { user, profile, logout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleDeleteAccount = () => {
        console.log('Account deletion requested');
        setShowDeleteModal(false);
        logout();
        navigate('/login');
    };

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                </div>
            </header>

            <div className="px-4 py-6 pb-24">
                {/* Profile Card */}
                <div
                    className="rounded-2xl p-6 mb-6 text-white shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--gradient-mid) 100%)'
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <User size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-bold">{displayName}</p>
                            <p className="text-white/80 text-sm">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="px-4 py-2 bg-white/20 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
                        >
                            Edit
                        </button>
                    </div>
                </div>

                {/* Account Section */}
                <SettingsSection title="Account">
                    <SettingsItem
                        icon={<Mail size={20} className="text-gray-600" />}
                        label="Email"
                        description={user?.email || 'Not set'}
                    />
                    <SettingsItem
                        icon={<Lock size={20} className="text-gray-600" />}
                        label="Change Password"
                        description="Update your password"
                    />
                    <SettingsItem
                        icon={<Shield size={20} className="text-gray-600" />}
                        label="Privacy & Security"
                        description="Manage your data"
                    />
                </SettingsSection>

                {/* Premium Section */}
                <SettingsSection title="Premium">
                    <SettingsItem
                        icon={<Sparkles size={20} className="text-amber-500" />}
                        label="Upgrade to Premium"
                        description="Get unlimited swipes"
                        rightElement={
                            <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-full">
                                PRO
                            </span>
                        }
                    />
                    <SettingsItem
                        icon={<CreditCard size={20} className="text-gray-600" />}
                        label="Manage Subscription"
                        description="Billing and payments"
                    />
                </SettingsSection>

                {/* Preferences Section */}
                <SettingsSection title="Preferences">
                    <SettingsItem
                        icon={<Bell size={20} className="text-gray-600" />}
                        label="Notifications"
                        description={notificationsEnabled ? 'Enabled' : 'Disabled'}
                        rightElement={
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setNotificationsEnabled(!notificationsEnabled);
                                }}
                                className={`w-12 h-7 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        }
                    />
                    <SettingsItem
                        icon={<Moon size={20} className="text-gray-600" />}
                        label="Dark Mode"
                        description={darkMode ? 'On' : 'Off'}
                        rightElement={
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDarkMode(!darkMode);
                                }}
                                className={`w-12 h-7 rounded-full transition-colors relative ${darkMode ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        }
                    />
                    <SettingsItem
                        icon={<Globe size={20} className="text-gray-600" />}
                        label="Language"
                        description="English (US)"
                    />
                    <SettingsItem
                        icon={<Smartphone size={20} className="text-gray-600" />}
                        label="App Preferences"
                        description="Swipe behavior"
                    />
                </SettingsSection>

                {/* Support Section */}
                <SettingsSection title="Support">
                    <SettingsItem
                        icon={<MessageCircle size={20} className="text-gray-600" />}
                        label="Send Feedback"
                        description="Help us improve"
                        onClick={() => navigate('/feedback')}
                    />
                    <SettingsItem
                        icon={<HelpCircle size={20} className="text-gray-600" />}
                        label="Help Center"
                        description="FAQs and support"
                        rightElement={<ExternalLink size={18} className="text-gray-400" />}
                    />
                </SettingsSection>

                {/* Account Actions */}
                <SettingsSection title="Account Actions">
                    <SettingsItem
                        icon={<LogOut size={20} className="text-gray-600" />}
                        label="Log Out"
                        onClick={() => setShowLogoutModal(true)}
                    />
                    <SettingsItem
                        icon={<Trash2 size={20} className="text-red-500" />}
                        label="Delete Account"
                        description="Permanently delete all data"
                        onClick={() => setShowDeleteModal(true)}
                        danger
                    />
                </SettingsSection>

                {/* App Version */}
                <div className="text-center py-6 text-gray-400 text-sm">
                    <p>TENDER v1.0.0</p>
                </div>
            </div>

            {/* Logout Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Log Out"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to log out?
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 py-3 bg-[var(--color-primary)] hover:opacity-90 text-white font-semibold rounded-xl transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Account Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl mb-4 border border-red-100">
                        <Trash2 size={24} className="text-red-500" />
                        <div>
                            <p className="font-semibold text-red-800">This cannot be undone</p>
                            <p className="text-sm text-red-600">All your data will be deleted.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
