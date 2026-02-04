import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText,
    Key,
    Calendar,
    Building,
    Share2,
    Archive,
    User,
    Paperclip,
    Sparkles,
    MessageCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import ScreenHeader from '../components/ui/ScreenHeader';
import CompanyLogo from '../components/ui/CompanyLogo';
import ActionRow from '../components/ui/ActionRow';
import SectionCard from '../components/ui/SectionCard';
import { Timeline } from '../components/timeline';
import JobDescriptionModal from '../components/modals/JobDescriptionModal';
import PortalCredentialsModal from '../components/modals/PortalCredentialsModal';
import QualificationCheck from '../components/QualificationCheck';
import Toast from '../components/ui/Toast';

// New application components
import {
    ApplicationSummary,
    PendingOutcomeIndicator,
    OrganizationSignals,
    ApplicationChecklist
} from '../components/applications';

// Data
import { getMockApplication } from '../data/mockApplications';
import { useAuth } from '../context/AuthContext';

/**
 * ApplicationTracking - Full application details with enhanced feedback
 */
export default function ApplicationTracking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    // Modal states
    const [showJobDescription, setShowJobDescription] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);

    // Collapsible sections
    const [expandedSections, setExpandedSections] = useState({
        timeline: true,
        checklist: true,
        signals: false,
        qualification: false,
        info: false,
        documents: false
    });

    useEffect(() => {
        loadApplication();
    }, [id]);

    const loadApplication = async () => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Replace with real Supabase query when backend is ready
            const app = getMockApplication(id);

            if (!app) {
                setError('Application not found');
                return;
            }

            setApplication(app);
        } catch (err) {
            console.error('Error loading application:', err);
            setError(err.message || 'Failed to load application');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleShare = async () => {
        if (!application) return;

        try {
            await navigator.share({
                title: `Application: ${application.opportunity.title}`,
                text: `My application for ${application.opportunity.title} at ${application.opportunity.company_name}`,
                url: window.location.href
            });
        } catch (err) {
            navigator.clipboard.writeText(window.location.href);
            setToast('Link copied to clipboard');
        }
    };

    const handleArchive = () => {
        setToast('Application archived');
        // TODO: Implement archive functionality
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatAppliedDate = (isoDate) => {
        const d = new Date(isoDate);
        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                    <p className="text-sm text-slate-500">Loading application...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !application) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-3xl">😕</span>
                </div>
                <p className="text-red-600 font-medium mb-2">{error || 'Application not found'}</p>
                <p className="text-slate-500 text-sm mb-4">We couldn't load this application.</p>
                <button
                    onClick={handleBack}
                    className="text-purple-600 font-bold hover:underline"
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    const { opportunity, events } = application;
    const hasCredentials = application.portal_url || application.portal_username;

    return (
        <div className="min-h-screen bg-[var(--color-bg)] pb-24">
            {/* Header */}
            <ScreenHeader
                title="Application Details"
                onBack={handleBack}
                menuItems={[
                    { label: 'Share', icon: Share2, onClick: handleShare },
                    { label: 'Archive', icon: Archive, onClick: handleArchive },
                ]}
            />

            <div className="px-4 py-4 space-y-4">
                {/* ===== NEW: Application Summary ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <ApplicationSummary application={application} />
                </motion.div>

                {/* Job Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
                >
                    {/* Job Title & Company */}
                    <div className="flex items-start gap-3">
                        <CompanyLogo
                            logoUrl={opportunity.company_logo}
                            companyName={opportunity.company_name}
                            size="xl"
                        />
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                                {opportunity.title}
                            </h2>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Building className="w-4 h-4" />
                                <span className="font-medium">{opportunity.company_name}</span>
                            </div>
                            {opportunity.location && (
                                <p className="text-sm text-slate-500 mt-1">{opportunity.location}</p>
                            )}
                        </div>
                    </div>

                    {/* Applied date */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                            Applied on <strong>{formatAppliedDate(application.applied_at)}</strong>
                        </span>
                    </div>
                </motion.div>

                {/* ===== NEW: Progress Indicator ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <PendingOutcomeIndicator application={application} variant="full" />
                </motion.div>

                {/* ===== NEW: Organization Signals ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <OrganizationSignals application={application} />
                </motion.div>

                {/* ===== NEW: Application Checklist ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <ApplicationChecklist
                        application={application}
                        userProfile={profile}
                    />
                </motion.div>

                {/* Action Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="grid grid-cols-2 gap-2"
                >
                    <ActionRow
                        icon={FileText}
                        label="Job Description"
                        onClick={() => setShowJobDescription(true)}
                    />
                    {hasCredentials && (
                        <ActionRow
                            icon={Key}
                            label="View Credentials"
                            onClick={() => setShowCredentials(true)}
                        />
                    )}
                </motion.div>

                {/* Timeline Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <SectionCard
                        title="Application Timeline"
                        icon={Calendar}
                        iconBg="bg-purple-100"
                        iconColor="text-purple-600"
                    >
                        <Timeline events={events} groupByDate={true} />
                    </SectionCard>
                </motion.div>

                {/* Qualification Check */}
                {profile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <SectionCard
                            title="Your Qualification Match"
                            icon={Sparkles}
                            iconBg="bg-indigo-100"
                            iconColor="text-indigo-600"
                            collapsible={true}
                            defaultOpen={false}
                        >
                            <QualificationCheck
                                opportunity={opportunity}
                                userProfile={profile}
                                variant="detailed"
                            />
                        </SectionCard>
                    </motion.div>
                )}

                {/* My Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <SectionCard
                        title="My Information"
                        icon={User}
                        iconBg="bg-blue-100"
                        iconColor="text-blue-600"
                        collapsible={true}
                        defaultOpen={false}
                    >
                        <div className="space-y-3">
                            {application.answers && application.answers.length > 0 ? (
                                application.answers.map((qa, index) => (
                                    <div key={index} className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            {qa.question}
                                        </p>
                                        <p className="text-sm text-slate-800">{qa.answer}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No additional information submitted
                                </p>
                            )}
                        </div>
                    </SectionCard>
                </motion.div>

                {/* Documents Attached */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                >
                    <SectionCard
                        title="Documents Attached"
                        icon={Paperclip}
                        iconBg="bg-emerald-100"
                        iconColor="text-emerald-600"
                        collapsible={true}
                        defaultOpen={false}
                    >
                        <div className="space-y-2">
                            {application.resume_id && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <FileText className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800">Resume</p>
                                        <p className="text-xs text-slate-500">PDF • Attached</p>
                                    </div>
                                </div>
                            )}
                            {application.transcript_id && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800">Transcript</p>
                                        <p className="text-xs text-slate-500">PDF • Attached</p>
                                    </div>
                                </div>
                            )}
                            {application.cover_letter_id && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <FileText className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800">Cover Letter</p>
                                        <p className="text-xs text-slate-500">PDF • Attached</p>
                                    </div>
                                </div>
                            )}
                            {!application.resume_id && !application.transcript_id && !application.cover_letter_id && (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No documents attached
                                </p>
                            )}
                        </div>
                    </SectionCard>
                </motion.div>

                {/* Notes */}
                {application.notes && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <SectionCard
                            title="My Notes"
                            icon={MessageCircle}
                            iconBg="bg-amber-100"
                            iconColor="text-amber-600"
                            collapsible={true}
                            defaultOpen={false}
                        >
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {application.notes}
                            </p>
                        </SectionCard>
                    </motion.div>
                )}

                {/* Next steps hint */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-purple-900 text-sm">What happens next?</p>
                            <p className="text-sm text-purple-700 mt-1 leading-relaxed">
                                {application.status === 'submitted'
                                    ? "Most employers respond within 1-3 weeks. We'll notify you of any updates."
                                    : application.status === 'interview'
                                        ? "Prepare for your interview! Review the job description and practice common questions."
                                        : application.status === 'offer'
                                            ? "Congratulations! Review the offer details carefully before responding."
                                            : application.status === 'rejected'
                                                ? "Don't be discouraged! Keep applying to find the right opportunity for you."
                                                : "We'll keep you updated on any changes to your application status."
                                }
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Modals */}
            <JobDescriptionModal
                opportunity={opportunity}
                isOpen={showJobDescription}
                onClose={() => setShowJobDescription(false)}
            />

            <PortalCredentialsModal
                application={application}
                isOpen={showCredentials}
                onClose={() => setShowCredentials(false)}
            />

            <Toast message={toast} onClose={() => setToast(null)} />
        </div>
    );
}
