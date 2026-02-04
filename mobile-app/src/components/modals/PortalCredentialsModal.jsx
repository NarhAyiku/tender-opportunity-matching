import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

/**
 * PortalCredentialsModal - Display portal login credentials
 * @param {Object} props
 * @param {Object} props.application - Application with portal credentials
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 */
export default function PortalCredentialsModal({ application, isOpen, onClose }) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(null);

    if (!application) return null;

    const hasCredentials = application.portal_url || application.portal_username;

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const openPortal = () => {
        if (application.portal_url) {
            window.open(application.portal_url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl"
                    >
                        {/* Header */}
                        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Portal Credentials</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {!hasCredentials ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-600 font-medium">No credentials saved</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        You applied directly through our platform
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Security Warning */}
                                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-700">
                                            <strong>Security Note:</strong> These credentials are stored locally on your device.
                                            Never share them with anyone.
                                        </p>
                                    </div>

                                    {/* Portal URL */}
                                    {application.portal_url && (
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Application Portal
                                            </label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="flex-1 p-3 bg-slate-50 rounded-xl text-sm text-slate-700 truncate">
                                                    {application.portal_url}
                                                </div>
                                                <button
                                                    onClick={openPortal}
                                                    className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors"
                                                    title="Open Portal"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Username */}
                                    {application.portal_username && (
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Username / Email
                                            </label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="flex-1 p-3 bg-slate-50 rounded-xl text-sm text-slate-700">
                                                    {application.portal_username}
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(application.portal_username, 'username')}
                                                    className={`p-3 rounded-xl transition-colors ${copied === 'username'
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    title="Copy"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Password */}
                                    {application.portal_password_encrypted && (
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Password
                                            </label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="flex-1 p-3 bg-slate-50 rounded-xl text-sm text-slate-700 font-mono">
                                                    {showPassword ? '••••••••' : '••••••••'}
                                                    {/* In production, would decrypt and show actual password */}
                                                </div>
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                                                    title={showPassword ? 'Hide' : 'Show'}
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 border-t border-slate-100 p-4">
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
