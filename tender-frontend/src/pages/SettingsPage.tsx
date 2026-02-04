import { useState } from 'react';
import { AppLayout } from '../components/layout';
import { Button, Modal } from '../components/common';
import { useAuthStore } from '../stores';
import { useNavigate } from 'react-router-dom';
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
    Github,
    Linkedin,
    FileText,
    AlertTriangle,
} from 'lucide-react';

interface SettingsItemProps {
    icon: React.ReactNode;
    label: string;
    description?: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
}

function SettingsItem({ icon, label, description, onClick, rightElement, danger }: SettingsItemProps) {
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

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
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

export function SettingsPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteAccount = () => {
        // In production, this would call an API to delete the account
        console.log('Account deletion requested');
        setShowDeleteModal(false);
        logout();
        navigate('/login');
    };

    return (
        <AppLayout>
            <div className="px-6 py-8 pb-24 max-w-2xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your account and preferences</p>
                </header>

                {/* Profile Summary Card */}
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <User size={28} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-bold">{user?.name || 'User'}</p>
                            <p className="text-cyan-100 text-sm">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="px-4 py-2 bg-white/20 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
                        >
                            Edit Profile
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
                        description="Manage your data and permissions"
                    />
                </SettingsSection>

                {/* Premium Section */}
                <SettingsSection title="Premium">
                    <SettingsItem
                        icon={<Sparkles size={20} className="text-amber-500" />}
                        label="Upgrade to Premium"
                        description="Get unlimited swipes and more"
                        rightElement={
                            <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-full">
                                PRO
                            </span>
                        }
                    />
                    <SettingsItem
                        icon={<CreditCard size={20} className="text-gray-600" />}
                        label="Manage Subscription"
                        description="View billing and payment methods"
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
                                className={`w-12 h-7 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-cyan-500' : 'bg-gray-300'
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
                                className={`w-12 h-7 rounded-full transition-colors relative ${darkMode ? 'bg-cyan-500' : 'bg-gray-300'
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
                        description="Swipe behavior, auto-apply settings"
                    />
                </SettingsSection>

                {/* Connected Accounts Section */}
                <SettingsSection title="Connected Accounts">
                    <SettingsItem
                        icon={<Linkedin size={20} className="text-blue-600" />}
                        label="LinkedIn"
                        description="Not connected"
                        rightElement={
                            <span className="text-cyan-600 text-sm font-semibold">Connect</span>
                        }
                    />
                    <SettingsItem
                        icon={<Github size={20} className="text-gray-900" />}
                        label="GitHub"
                        description="Not connected"
                        rightElement={
                            <span className="text-cyan-600 text-sm font-semibold">Connect</span>
                        }
                    />
                </SettingsSection>

                {/* Support Section */}
                <SettingsSection title="Support">
                    <SettingsItem
                        icon={<HelpCircle size={20} className="text-gray-600" />}
                        label="Help Center"
                        description="FAQs and support articles"
                        rightElement={<ExternalLink size={18} className="text-gray-400" />}
                    />
                    <SettingsItem
                        icon={<FileText size={20} className="text-gray-600" />}
                        label="Terms of Service"
                        rightElement={<ExternalLink size={18} className="text-gray-400" />}
                    />
                    <SettingsItem
                        icon={<Shield size={20} className="text-gray-600" />}
                        label="Privacy Policy"
                        rightElement={<ExternalLink size={18} className="text-gray-400" />}
                    />
                </SettingsSection>

                {/* Danger Zone */}
                <SettingsSection title="Account Actions">
                    <SettingsItem
                        icon={<LogOut size={20} className="text-gray-600" />}
                        label="Log Out"
                        onClick={() => setShowLogoutModal(true)}
                    />
                    <SettingsItem
                        icon={<Trash2 size={20} className="text-red-500" />}
                        label="Delete Account"
                        description="Permanently delete your account and data"
                        onClick={() => setShowDeleteModal(true)}
                        danger
                    />
                </SettingsSection>

                {/* App Version */}
                <div className="text-center py-6 text-gray-400 text-sm">
                    <p>OpportunityMatch v1.0.0</p>
                    <p className="mt-1">Made with ❤️ for job seekers</p>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Log Out"
            >
                <div className="p-6">
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to log out? You'll need to sign in again to access your account.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowLogoutModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Account Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl mb-4 border border-red-100">
                        <AlertTriangle size={24} className="text-red-500" />
                        <div>
                            <p className="font-semibold text-red-800">This action cannot be undone</p>
                            <p className="text-sm text-red-600">All your data will be permanently deleted.</p>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-6">
                        This will permanently delete your account, including all your applications, saved jobs, and profile information.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </Button>
                        <button
                            onClick={handleDeleteAccount}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
