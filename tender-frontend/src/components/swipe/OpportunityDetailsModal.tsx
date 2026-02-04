import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { OpportunityMatch } from '../../types';
import {
    X,
    Building2,
    MapPin,
    DollarSign,
    Share2,
    Briefcase,
    GraduationCap,
    Zap,
    CheckCircle2,
    Star,
    Globe,
    Shield,
    Calendar,
    Users,
    Heart,
    ArrowLeft,
    Clock,
    Award,
    Sparkles,
    Target,
    FileText,
    Flag,
} from 'lucide-react';
import { Button } from '../common';

interface OpportunityDetailsModalProps {
    opportunity: OpportunityMatch | null;
    isOpen: boolean;
    onClose: () => void;
    onShare?: () => void;
}

export function OpportunityDetailsModal({
    opportunity,
    isOpen,
    onClose,
    onShare,
}: OpportunityDetailsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !opportunity) return null;

    const formatSalary = () => {
        if (!opportunity.is_salary_visible || (!opportunity.salary_min && !opportunity.salary_max)) return null;
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: opportunity.salary_currency || 'USD',
            maximumFractionDigits: 0,
        });
        if (opportunity.salary_min && opportunity.salary_max) {
            return `${formatter.format(opportunity.salary_min)} - ${formatter.format(opportunity.salary_max)}`;
        }
        if (opportunity.salary_min) return `From ${formatter.format(opportunity.salary_min)}`;
        if (opportunity.salary_max) return `Up to ${formatter.format(opportunity.salary_max)}`;
        return null;
    };

    const formatDateRange = () => {
        if (!opportunity.availability_start && !opportunity.availability_end) return null;
        const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
        const start = opportunity.availability_start
            ? new Date(opportunity.availability_start).toLocaleDateString('en-US', options)
            : 'ASAP';
        const end = opportunity.availability_end
            ? new Date(opportunity.availability_end).toLocaleDateString('en-US', options)
            : 'Ongoing';
        return `${start} - ${end}`;
    };

    const formatGraduationYears = () => {
        if (!opportunity.graduation_year_min && !opportunity.graduation_year_max) return null;
        if (opportunity.graduation_year_min && opportunity.graduation_year_max) {
            return `${opportunity.graduation_year_min} - ${opportunity.graduation_year_max}`;
        }
        if (opportunity.graduation_year_min) return `${opportunity.graduation_year_min} or later`;
        if (opportunity.graduation_year_max) return `${opportunity.graduation_year_max} or earlier`;
        return null;
    };

    const salaryText = formatSalary();
    const dateRange = formatDateRange();
    const graduationYears = formatGraduationYears();

    // Sample data for demonstration (in production, these would come from the API)
    const sampleDesiredQualifications = opportunity.desired_qualifications || [
        'Strong problem-solving and analytical skills',
        'Passionate about emerging technologies',
        'Interest in security and automation systems',
        'Excellent communication and teamwork abilities',
        'Self-motivated with ability to work independently',
    ];

    const sampleWorkAuthorization = opportunity.work_authorization || [
        'Must be authorized to work in the United States',
    ];

    const sampleResponsibilities = opportunity.responsibilities || [
        'Collaborate with cross-functional teams to design and implement solutions',
        'Participate in code reviews and contribute to best practices',
        'Research and evaluate new technologies and tools',
        'Document technical specifications and project progress',
    ];

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="bg-white w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95 flex flex-col"
                role="dialog"
                aria-modal="true"
            >
                {/* Sticky Header with Back Button */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100">
                    <div className="flex items-center justify-between p-4">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium transition-colors group"
                            aria-label="Go back"
                        >
                            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-primary-50 transition-colors">
                                <ArrowLeft size={18} className="group-hover:text-primary-600" />
                            </div>
                            <span className="hidden sm:inline">Back to Feed</span>
                        </button>
                        <div className="flex items-center gap-2">
                            {onShare && (
                                <button
                                    onClick={onShare}
                                    className="p-2.5 bg-gray-100 rounded-full hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors"
                                    aria-label="Share opportunity"
                                >
                                    <Share2 size={18} />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2.5 bg-gray-100 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors sm:hidden"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-5 sm:p-6 space-y-6">
                        {/* Hero Section */}
                        <div className="space-y-4">
                            {/* Type Badge & Match Score */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${opportunity.opportunity_type === 'internship' ? 'bg-primary-50 text-primary-700 border border-primary-100' :
                                        opportunity.opportunity_type === 'job' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            opportunity.opportunity_type === 'scholarship' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                'bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}>
                                    {opportunity.opportunity_type}
                                </span>
                                <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary-50 to-emerald-50 px-4 py-1.5 rounded-full border border-primary-100">
                                    <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                                    <span className="font-bold text-primary-700">
                                        {Math.round(opportunity.match_score * 100)}% Match
                                    </span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 leading-tight">
                                {opportunity.title}
                            </h1>

                            {/* Company & Location */}
                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-2 font-medium">
                                    <Building2 size={18} className="text-primary-500" />
                                    {opportunity.company_name}
                                </div>
                                {(opportunity.city || opportunity.country) && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin size={16} />
                                        {opportunity.city}{opportunity.city && opportunity.country ? ', ' : ''}{opportunity.country}
                                    </div>
                                )}
                                {opportunity.is_remote && (
                                    <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-100">
                                        <Globe size={14} />
                                        Remote
                                    </span>
                                )}
                            </div>

                            {/* Quick Info Pills */}
                            <div className="flex flex-wrap gap-2">
                                {salaryText && (
                                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-100">
                                        <DollarSign size={14} />
                                        {salaryText}
                                    </div>
                                )}
                                {dateRange && (
                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                                        <Calendar size={14} />
                                        {dateRange}
                                    </div>
                                )}
                                {opportunity.experience_level && (
                                    <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                                        <Award size={14} />
                                        {opportunity.experience_level.charAt(0).toUpperCase() + opportunity.experience_level.slice(1)} Level
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* About the Role / Description */}
                        <section className="space-y-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <div className="p-2 bg-primary-50 rounded-lg">
                                    <Briefcase size={18} className="text-primary-600" />
                                </div>
                                About the Role
                            </h2>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {opportunity.description || 'This is an exciting opportunity to join a dynamic team and work on cutting-edge projects. You will have the chance to grow your skills, collaborate with talented professionals, and make a meaningful impact.'}
                                </p>
                            </div>
                        </section>

                        {/* Key Responsibilities */}
                        <section className="space-y-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Target size={18} className="text-blue-600" />
                                </div>
                                Key Responsibilities
                            </h2>
                            <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-2xl p-4 border border-blue-100/50">
                                <ul className="space-y-3">
                                    {sampleResponsibilities.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700">
                                            <div className="min-w-[8px] h-[8px] rounded-full bg-blue-500 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Required Qualifications */}
                        {opportunity.required_skills && opportunity.required_skills.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <div className="p-2 bg-emerald-50 rounded-lg">
                                        <CheckCircle2 size={18} className="text-emerald-600" />
                                    </div>
                                    Required Qualifications
                                </h2>
                                <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-2xl p-4 border border-emerald-100/50">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {opportunity.required_skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm border border-gray-200 font-medium shadow-sm flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    {opportunity.education_requirement && (
                                        <div className="flex items-center gap-2 text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-100">
                                            <GraduationCap size={16} className="text-primary-500" />
                                            <span className="font-medium">{opportunity.education_requirement}</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Desired Qualifications */}
                        <section className="space-y-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Star size={18} className="text-amber-600" />
                                </div>
                                Desired Qualifications
                            </h2>
                            <div className="bg-gradient-to-br from-amber-50/50 to-white rounded-2xl p-4 border border-amber-100/50">
                                <ul className="space-y-3">
                                    {sampleDesiredQualifications.map((qual, index) => (
                                        <li key={index} className="flex items-start gap-3 text-gray-700">
                                            <Sparkles size={16} className="text-amber-500 min-w-[16px] mt-0.5" />
                                            <span>{qual}</span>
                                        </li>
                                    ))}
                                </ul>
                                {opportunity.preferred_skills && opportunity.preferred_skills.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-amber-100">
                                        <p className="text-xs uppercase text-amber-600 font-bold tracking-wider mb-2">Preferred Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {opportunity.preferred_skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-200 font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Work Authorization & Restrictions */}
                        <section className="space-y-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Shield size={18} className="text-red-600" />
                                </div>
                                Work Authorization & Eligibility
                            </h2>
                            <div className="bg-gradient-to-br from-red-50/30 to-white rounded-2xl p-4 border border-red-100/50">
                                <div className="space-y-3">
                                    {sampleWorkAuthorization.map((auth, index) => (
                                        <div key={index} className="flex items-start gap-3 text-gray-700">
                                            <Flag size={16} className="text-red-500 min-w-[16px] mt-0.5" />
                                            <span>{auth}</span>
                                        </div>
                                    ))}
                                    {opportunity.open_to_international && (
                                        <div className="flex items-start gap-3 text-gray-700">
                                            <Globe size={16} className="text-blue-500 min-w-[16px] mt-0.5" />
                                            <span>Open to international candidates (visa sponsorship available)</span>
                                        </div>
                                    )}
                                    {opportunity.country_restrictions && opportunity.country_restrictions.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-red-100/50">
                                            <p className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Eligible Countries</p>
                                            <div className="flex flex-wrap gap-2">
                                                {opportunity.country_restrictions.map((country) => (
                                                    <span key={country} className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200">
                                                        {country}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Availability & Timeline */}
                        <section className="space-y-3">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Clock size={18} className="text-purple-600" />
                                </div>
                                Availability & Timeline
                            </h2>
                            <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-2xl p-4 border border-purple-100/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {dateRange && (
                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">Work Period</p>
                                            <p className="text-gray-900 font-semibold flex items-center gap-2">
                                                <Calendar size={16} className="text-purple-500" />
                                                {dateRange}
                                            </p>
                                        </div>
                                    )}
                                    {graduationYears && (
                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">Graduation Year</p>
                                            <p className="text-gray-900 font-semibold flex items-center gap-2">
                                                <GraduationCap size={16} className="text-purple-500" />
                                                {graduationYears}
                                            </p>
                                        </div>
                                    )}
                                    {!dateRange && !graduationYears && (
                                        <>
                                            <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">Work Period</p>
                                                <p className="text-gray-900 font-semibold flex items-center gap-2">
                                                    <Calendar size={16} className="text-purple-500" />
                                                    May 2025 - Aug 2025
                                                </p>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-gray-100">
                                                <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">Target Graduation</p>
                                                <p className="text-gray-900 font-semibold flex items-center gap-2">
                                                    <GraduationCap size={16} className="text-purple-500" />
                                                    2025 - 2027
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {opportunity.application_deadline && (
                                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <Clock size={16} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-amber-600 font-bold tracking-wider">Application Deadline</p>
                                            <p className="text-amber-900 font-semibold">
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
                        </section>

                        {/* Benefits (if available) */}
                        {opportunity.benefits && opportunity.benefits.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <div className="p-2 bg-pink-50 rounded-lg">
                                        <Heart size={18} className="text-pink-600" />
                                    </div>
                                    Benefits & Perks
                                </h2>
                                <div className="bg-gradient-to-br from-pink-50/50 to-white rounded-2xl p-4 border border-pink-100/50">
                                    <div className="flex flex-wrap gap-2">
                                        {opportunity.benefits.map((benefit) => (
                                            <span
                                                key={benefit}
                                                className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-200 font-medium flex items-center gap-1.5"
                                            >
                                                <Heart size={12} className="text-pink-500" />
                                                {benefit}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Why You Match */}
                        {opportunity.matched_skills && opportunity.matched_skills.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <div className="p-2 bg-primary-50 rounded-lg">
                                        <Sparkles size={18} className="text-primary-600" />
                                    </div>
                                    Why You're a Great Match
                                </h2>
                                <div className="bg-gradient-to-br from-primary-50 to-emerald-50/50 rounded-2xl p-4 border border-primary-100/50 relative overflow-hidden">
                                    <ul className="space-y-3 relative z-10">
                                        {opportunity.matched_skills.map((skill) => (
                                            <li key={skill} className="flex items-start gap-3 text-gray-700 font-medium">
                                                <div className="min-w-[8px] h-[8px] rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                <span>Your <strong>{skill}</strong> experience matches this role</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl" />
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Sticky Footer with Back Button */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4">
                    <Button
                        variant="primary"
                        className="w-full gap-2 text-base py-3"
                        onClick={onClose}
                    >
                        <ArrowLeft size={18} />
                        Back to Opportunities
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
