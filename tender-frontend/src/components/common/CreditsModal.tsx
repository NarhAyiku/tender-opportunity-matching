import { createPortal } from 'react-dom';
import { X, Zap, Gift, Users, ExternalLink } from 'lucide-react';
import { useCreditsStore } from '../../stores/creditsStore';
import { Button } from './Button';

interface CreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const socialPlatforms = [
    { id: 'tiktok', name: 'TikTok', icon: '🎵', credits: 2, url: 'https://tiktok.com' },
    { id: 'instagram', name: 'Instagram', icon: '📸', credits: 2, url: 'https://instagram.com' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', credits: 2, url: 'https://youtube.com' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', credits: 2, url: 'https://linkedin.com' },
];

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
    const { credits, freeSwipesToday, claimedSocialRewards, claimSocialReward } = useCreditsStore();

    if (!isOpen) return null;

    const totalAvailable = credits + freeSwipesToday;

    const handleClaimSocial = (platform: typeof socialPlatforms[0]) => {
        // Open the social link
        window.open(platform.url, '_blank');
        // Claim the reward
        claimSocialReward(platform.id);
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-cyan-500 to-cyan-600 px-6 pt-8 pb-12 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Credits Display */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Zap size={32} className="text-amber-300 fill-amber-300" />
                        </div>
                        <div>
                            <p className="text-4xl font-bold">{totalAvailable}</p>
                            <p className="text-cyan-100 text-sm">swipes available</p>
                        </div>
                    </div>

                    <p className="text-center text-cyan-100 text-sm">
                        1 Credit = 1 Job Application
                    </p>
                </div>

                {/* Credits Breakdown */}
                <div className="px-6 -mt-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                            <span className="text-gray-600">Free swipes today</span>
                            <span className="font-bold text-gray-900">{freeSwipesToday}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Purchased credits</span>
                            <span className="font-bold text-gray-900">{credits}</span>
                        </div>
                    </div>
                </div>

                {/* Ready to Apply Section */}
                <div className="px-6 mb-6">
                    <p className="text-sm text-gray-500 mb-2">Ready to apply?</p>
                    <p className="text-gray-600 text-sm">
                        You get <span className="font-semibold text-cyan-600">5 free swipes</span> every day to apply for jobs you like.
                        Need more? Upgrade to unlimited swipes with a subscription or purchase extra swipes.
                    </p>
                </div>

                {/* Get More Credits Button */}
                <div className="px-6 mb-6">
                    <Button className="w-full text-base py-3.5 gradient-primary">
                        Get More Credits
                    </Button>
                </div>

                {/* Divider */}
                <div className="px-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-sm text-gray-400 font-medium">or earn free credits</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>
                </div>

                {/* Free Swipes Section */}
                <div className="px-6 py-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Gift size={20} className="text-amber-500" />
                        <h3 className="font-bold text-gray-900">Get Free Swipes!</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Follow us on social media and invite friends
                    </p>

                    {/* Social Platforms */}
                    <div className="space-y-3 mb-6">
                        {socialPlatforms.map((platform) => {
                            const isClaimed = claimedSocialRewards.includes(platform.id);
                            return (
                                <button
                                    key={platform.id}
                                    onClick={() => !isClaimed && handleClaimSocial(platform)}
                                    disabled={isClaimed}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isClaimed
                                            ? 'bg-gray-50 cursor-not-allowed'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{platform.icon}</span>
                                        <span className="font-medium text-gray-900">+{platform.credits} Credits</span>
                                    </div>
                                    {isClaimed ? (
                                        <span className="text-sm text-green-600 font-semibold">Claimed ✓</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-sm text-cyan-600 font-semibold">
                                            Follow <ExternalLink size={14} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Invite Friend */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <Users size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Invite a Friend</h4>
                                <p className="text-sm text-gray-600">Get <span className="font-semibold text-amber-600">10 swipes</span> if your friend downloads and enters your code!</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 bg-white rounded-xl px-4 py-3 border border-amber-200">
                            <span className="font-mono text-xl font-bold text-gray-900 tracking-wider">3BCF22</span>
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
