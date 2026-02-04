import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    GraduationCap,
    Building,
    CheckCircle,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    Share2,
    Heart,
    Send,
    Globe,
    Award,
    Target,
    Sparkles,
    Star,
    Shield,
    Calendar,
    Users,
    ArrowLeft,
    Zap,
    AlertCircle,
    Flag,
} from 'lucide-react';
import Toast from '../components/ui/Toast';
import QualificationCheck from '../components/QualificationCheck';

// Sample data generators for missing fields (in production, these would come from API)
const SAMPLE_RESPONSIBILITIES = [
    'Collaborate with cross-functional teams to design and implement solutions',
    'Participate in code reviews and contribute to engineering best practices',
    'Research and evaluate new technologies and tools to improve workflows',
    'Document technical specifications and maintain project documentation',
    'Mentor junior team members and contribute to team growth',
];

const SAMPLE_DESIRED_QUALIFICATIONS = [
    'Strong problem-solving and analytical skills',
    'Passionate about emerging technologies and innovation',
    'Excellent communication and teamwork abilities',
    'Self-motivated with ability to work independently',
    'Curious mindset with eagerness to learn new skills',
];

const SAMPLE_WORK_AUTHORIZATION = [
    'Must be authorized to work in the location specified',
];

export default function OpportunityDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, profile, isAuthenticated } = useAuth();

    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [existingSwipe, setExistingSwipe] = useState(null);

    useEffect(() => {
        loadOpportunity();
    }, [id, user]);

    const loadOpportunity = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch opportunity
            const { data: opp, error: oppError } = await supabase
                .from('opportunities')
                .select('*')
                .eq('id', id)
                .single();

            if (oppError) throw oppError;
            setOpportunity(opp);

            // Check for existing interaction if logged in
            if (user) {
                const { data: swipe, error: swipeError } = await supabase
                    .from('swipes')
                    .select('action')
                    .eq('user_id', user.id)
                    .eq('opportunity_id', id)
                    .single();

                // It's okay if no swipe exists
                if (!swipeError && swipe) {
                    setExistingSwipe(swipe.action);
                }
            }
        } catch (err) {
            console.error('Error loading opportunity:', err);
            setError(err.message || 'Failed to load opportunity');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionType) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setActionLoading(true);

            const { error: swipeError } = await supabase
                .from('swipes')
                .upsert({
                    user_id: user.id,
                    opportunity_id: id,
                    action: actionType,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,opportunity_id' });

            if (swipeError) throw swipeError;

            setExistingSwipe(actionType);

            if (actionType === 'save') {
                setToast('Opportunity saved!');
            } else if (actionType === 'interested') {
                setToast('Application started!');
            }

        } catch (err) {
            console.error('Action failed:', err);
            setToast('Failed to perform action');
        } finally {
            setActionLoading(false);
        }
    };

    const handleShare = async () => {
        if (!opportunity) return;
        try {
            await navigator.share({
                title: opportunity.title,
                text: `Check out this ${opportunity.opportunity_type} at ${opportunity.company_name}: ${opportunity.title}`,
                url: window.location.href
            });
        } catch (err) {
            navigator.clipboard.writeText(window.location.href);
            setToast('Link copied to clipboard');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !opportunity) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-4">
                <p className="text-red-500 mb-4">{error || 'Opportunity not found'}</p>
                <button onClick={() => navigate(-1)} className="text-purple-600 font-bold hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    const isRemote = opportunity.is_remote;
    const isSaved = existingSwipe === 'save';
    const isApplied = existingSwipe === 'applied' || existingSwipe === 'interested';

    // Get required skills with match status (compare with user profile skills)
    const userSkills = profile?.skills || [];
    const requiredSkills = opportunity.required_skills || opportunity.skills || [];
    const matchedSkills = requiredSkills.filter(skill =>
        userSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(us.toLowerCase()))
    );

    // Use opportunity data or fallback to samples for comprehensive display
    const responsibilities = opportunity.responsibilities || SAMPLE_RESPONSIBILITIES;
    const desiredQualifications = opportunity.desired_qualifications || opportunity.preferred_skills || SAMPLE_DESIRED_QUALIFICATIONS;
    const workAuthorization = opportunity.work_authorization || SAMPLE_WORK_AUTHORIZATION;

    // Format graduation years
    const graduationYearMin = opportunity.graduation_year_min || 2025;
    const graduationYearMax = opportunity.graduation_year_max || 2027;

    // Format availability dates
    const formatDateRange = () => {
        if (!opportunity.start_date && !opportunity.end_date) {
            return null; // Will show default
        }
        const options = { month: 'short', year: 'numeric' };
        const start = opportunity.start_date
            ? new Date(opportunity.start_date).toLocaleDateString('en-US', options)
            : 'ASAP';
        const end = opportunity.end_date
            ? new Date(opportunity.end_date).toLocaleDateString('en-US', options)
            : 'Ongoing';
        return `${start} - ${end}`;
    };

    const dateRange = formatDateRange();

    // Section component for consistency
    const Section = ({ icon: Icon, title, iconBg, iconColor, children }) => (
        <div className="mb-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                <div className={`p-2 rounded-xl ${iconBg}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                {title}
            </h3>
            {children}
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--color-bg)] pb-48">
            {/* Header Image/Gradient */}
            <div className="relative h-56 bg-gradient-to-br from-slate-900 to-slate-800">
                {opportunity.company_logo ? (
                    <img
                        src={opportunity.company_logo}
                        alt={opportunity.company_name}
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />

                {/* Back button - Top Left */}
                <button
                    onClick={handleBack}
                    className="absolute top-6 left-4 p-3 bg-white/15 backdrop-blur-md rounded-xl text-white hover:bg-white/25 transition-all z-20 flex items-center gap-2 border border-white/10"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold hidden sm:inline">Back</span>
                </button>

                {/* Share button */}
                <button
                    onClick={handleShare}
                    className="absolute top-6 right-4 p-3 bg-white/15 backdrop-blur-md rounded-xl text-white hover:bg-white/25 transition-all z-20 border border-white/10"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            <div className="px-4 -mt-24 relative z-10">
                {/* Main Info Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                                {opportunity.title}
                            </h1>
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Building className="w-4 h-4" />
                                {opportunity.company_name}
                            </div>
                        </div>
                        {opportunity.company_logo && (
                            <img
                                src={opportunity.company_logo}
                                alt="Logo"
                                className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm"
                            />
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-100">
                            {opportunity.opportunity_type}
                        </span>
                        {isRemote && (
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1 border border-blue-100">
                                <Globe className="w-3 h-3" />
                                Remote
                            </span>
                        )}
                        {(opportunity.salary_min || opportunity.salary_max) && (
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-1 border border-emerald-100">
                                <DollarSign className="w-3 h-3" />
                                {opportunity.salary_min ? `${opportunity.salary_min / 1000}k` : ''}
                                {opportunity.salary_max ? ` - ${opportunity.salary_max / 1000}k` : ''}
                            </span>
                        )}
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="truncate">{opportunity.location || 'Location varies'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{opportunity.work_arrangement || 'Full-time'}</span>
                        </div>
                        {opportunity.experience_level && (
                            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                                <Award className="w-4 h-4 text-slate-400" />
                                <span className="capitalize">{opportunity.experience_level} Level</span>
                            </div>
                        )}
                        {opportunity.industry && (
                            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                <span className="truncate">{opportunity.industry}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* About the Role */}
                <Section icon={Briefcase} title="About the Role" iconBg="bg-purple-100" iconColor="text-purple-600">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                            {opportunity.description || 'This is an exciting opportunity to join a dynamic team and work on innovative projects. You will collaborate with talented professionals and make a meaningful impact.'}
                        </p>
                    </div>
                </Section>

                {/* Key Responsibilities */}
                <Section icon={Target} title="Key Responsibilities" iconBg="bg-blue-100" iconColor="text-blue-600">
                    <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-2xl p-5 border border-blue-100/50">
                        <ul className="space-y-3">
                            {responsibilities.slice(0, 5).map((item, index) => (
                                <li key={index} className="flex items-start gap-3 text-slate-700 text-sm">
                                    <div className="min-w-[8px] h-[8px] rounded-full bg-blue-500 mt-1.5 shadow-[0_0_6px_rgba(59,130,246,0.4)]" />
                                    <span className="leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Section>

                {/* Required Qualifications */}
                {requiredSkills.length > 0 && (
                    <Section icon={CheckCircle2} title="Required Qualifications" iconBg="bg-emerald-100" iconColor="text-emerald-600">
                        <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl p-5 border border-emerald-100/50">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {requiredSkills.map((skill, index) => {
                                    const isMatched = matchedSkills.includes(skill);
                                    return (
                                        <span
                                            key={index}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 border ${isMatched
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-white text-slate-700 border-slate-200'
                                                }`}
                                        >
                                            {isMatched ? (
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : (
                                                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                            {skill}
                                        </span>
                                    );
                                })}
                            </div>
                            {matchedSkills.length > 0 && (
                                <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-lg">
                                    <Sparkles className="w-4 h-4" />
                                    You match {matchedSkills.length} of {requiredSkills.length} required skills!
                                </p>
                            )}
                            {opportunity.education_requirement && (
                                <div className="mt-4 pt-4 border-t border-emerald-100/50 flex items-center gap-2 text-slate-700 text-sm">
                                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                                    <span className="font-medium">{opportunity.education_requirement}</span>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* Desired Qualifications */}
                <Section icon={Star} title="Desired Qualifications" iconBg="bg-amber-100" iconColor="text-amber-600">
                    <div className="bg-gradient-to-br from-amber-50/50 to-white rounded-2xl p-5 border border-amber-100/50">
                        <ul className="space-y-3">
                            {desiredQualifications.slice(0, 5).map((qual, index) => (
                                <li key={index} className="flex items-start gap-3 text-slate-700 text-sm">
                                    <Sparkles className="w-4 h-4 text-amber-500 min-w-[16px] mt-0.5" />
                                    <span className="leading-relaxed">{qual}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Section>

                {/* Work Authorization & Eligibility */}
                <Section icon={Shield} title="Work Authorization & Eligibility" iconBg="bg-red-100" iconColor="text-red-600">
                    <div className="bg-gradient-to-br from-red-50/30 to-white rounded-2xl p-5 border border-red-100/50">
                        <div className="space-y-3">
                            {workAuthorization.map((auth, index) => (
                                <div key={index} className="flex items-start gap-3 text-slate-700 text-sm">
                                    <Flag className="w-4 h-4 text-red-500 min-w-[16px] mt-0.5" />
                                    <span>{auth}</span>
                                </div>
                            ))}
                            {opportunity.open_to_international && (
                                <div className="flex items-start gap-3 text-slate-700 text-sm">
                                    <Globe className="w-4 h-4 text-blue-500 min-w-[16px] mt-0.5" />
                                    <span>Open to international candidates (visa sponsorship available)</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Section>

                {/* Availability & Timeline */}
                <Section icon={Calendar} title="Availability & Timeline" iconBg="bg-purple-100" iconColor="text-purple-600">
                    <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-2xl p-5 border border-purple-100/50">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">Work Period</p>
                                <p className="text-slate-900 font-semibold flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-purple-500" />
                                    {dateRange || 'Flexible'}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">Graduation Year</p>
                                <p className="text-slate-900 font-semibold flex items-center gap-2 text-sm">
                                    <GraduationCap className="w-4 h-4 text-purple-500" />
                                    {graduationYearMin} - {graduationYearMax}
                                </p>
                            </div>
                        </div>
                        {opportunity.application_deadline && (
                            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-amber-600 font-bold tracking-wider">Application Deadline</p>
                                    <p className="text-amber-900 font-semibold text-sm">
                                        {new Date(opportunity.application_deadline).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Benefits (if available) */}
                {opportunity.benefits && opportunity.benefits.length > 0 && (
                    <Section icon={Heart} title="Benefits & Perks" iconBg="bg-pink-100" iconColor="text-pink-600">
                        <div className="bg-gradient-to-br from-pink-50/50 to-white rounded-2xl p-5 border border-pink-100/50">
                            <div className="flex flex-wrap gap-2">
                                {opportunity.benefits.map((benefit, index) => (
                                    <span
                                        key={index}
                                        className="bg-white text-slate-700 px-3 py-1.5 rounded-lg text-sm border border-slate-200 font-medium flex items-center gap-1.5"
                                    >
                                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                                        {benefit}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Section>
                )}

                {/* Your Match Score */}
                {matchedSkills.length > 0 && (
                    <Section icon={Zap} title="Why You're a Great Match" iconBg="bg-gradient-to-br from-purple-100 to-emerald-100" iconColor="text-purple-600">
                        <div className="bg-gradient-to-br from-purple-50 to-emerald-50/50 rounded-2xl p-5 border border-purple-100/50 relative overflow-hidden">
                            <ul className="space-y-3 relative z-10">
                                {matchedSkills.slice(0, 4).map((skill, index) => (
                                    <li key={index} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                                        <div className="min-w-[8px] h-[8px] rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                        <span>Your <strong>{skill}</strong> skills match this role</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl" />
                        </div>
                    </Section>
                )}

                {/* Qualification Check - Detailed eligibility analysis */}
                {profile && (
                    <Section icon={Shield} title="Your Eligibility Check" iconBg="bg-indigo-100" iconColor="text-indigo-600">
                        <div className="bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl p-5 border border-indigo-100/50">
                            <QualificationCheck
                                opportunity={opportunity}
                                userProfile={profile}
                                variant="detailed"
                            />
                        </div>
                    </Section>
                )}

            </div>

            {/* Floating Action Bar - positioned above bottom nav */}
            <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="p-3.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Save Button */}
                    <button
                        onClick={() => handleAction('save')}
                        disabled={actionLoading}
                        className={`p-3.5 rounded-xl font-bold transition-all border ${isSaved
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-purple-200'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-slate-400' : ''}`} />
                    </button>

                    {/* Apply Button */}
                    <button
                        onClick={() => handleAction('interested')}
                        disabled={actionLoading || isApplied}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg ${isApplied
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] shadow-purple-200'
                            }`}
                    >
                        {isApplied ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Applied
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Apply Now
                            </>
                        )}
                    </button>
                </div>
            </div>

            <Toast message={toast} onClose={() => setToast(null)} />
        </div>
    );
}
