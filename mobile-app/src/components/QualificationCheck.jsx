import { useMemo } from 'react';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    GraduationCap,
    MapPin,
    Calendar,
    Shield,
    Briefcase,
    Sparkles,
    Globe,
} from 'lucide-react';

/**
 * QualificationCheck component - Shows how well a user matches job requirements
 * Can be used as a compact badge on cards or expanded view on detail pages
 */
export default function QualificationCheck({
    opportunity,
    userProfile,
    variant = 'compact', // 'compact' | 'detailed' | 'badge'
    className = '',
}) {
    const checks = useMemo(() => {
        if (!opportunity || !userProfile) return [];

        const results = [];

        // 1. Skills Match
        const requiredSkills = opportunity.required_skills || opportunity.skills || [];
        const userSkills = userProfile.skills || [];
        if (requiredSkills.length > 0) {
            const matchedSkills = requiredSkills.filter(skill =>
                userSkills.some(us =>
                    us.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(us.toLowerCase())
                )
            );
            const percentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);
            results.push({
                id: 'skills',
                label: 'Skills Match',
                description: `${matchedSkills.length} of ${requiredSkills.length} required skills`,
                icon: Sparkles,
                status: percentage >= 70 ? 'pass' : percentage >= 40 ? 'partial' : 'fail',
                percentage,
            });
        }

        // 2. Location Match
        if (opportunity.location && userProfile.location) {
            const jobLocation = opportunity.location.toLowerCase();
            const userLocation = userProfile.location.toLowerCase();
            const isRemote = opportunity.is_remote;
            const locationMatch =
                isRemote ||
                jobLocation.includes(userLocation) ||
                userLocation.includes(jobLocation) ||
                jobLocation.includes('anywhere') ||
                jobLocation.includes('remote');

            results.push({
                id: 'location',
                label: 'Location',
                description: isRemote ? 'Remote friendly' : opportunity.location,
                icon: MapPin,
                status: locationMatch ? 'pass' : 'partial',
            });
        }

        // 3. Graduation Year
        const gradYearMin = opportunity.graduation_year_min || 2024;
        const gradYearMax = opportunity.graduation_year_max || 2028;
        const userGradYear = userProfile.graduation_year || userProfile.expected_graduation_year;

        if (userGradYear) {
            const yearMatch = userGradYear >= gradYearMin && userGradYear <= gradYearMax;
            results.push({
                id: 'graduation',
                label: 'Graduation Year',
                description: `${gradYearMin} - ${gradYearMax}`,
                icon: GraduationCap,
                status: yearMatch ? 'pass' : 'fail',
                userValue: userGradYear,
            });
        } else {
            results.push({
                id: 'graduation',
                label: 'Graduation Year',
                description: `${gradYearMin} - ${gradYearMax}`,
                icon: GraduationCap,
                status: 'unknown',
            });
        }

        // 4. Work Authorization
        if (opportunity.work_authorization && opportunity.work_authorization.length > 0) {
            const userAuthorized = userProfile.work_authorization || false;
            results.push({
                id: 'authorization',
                label: 'Work Authorization',
                description: opportunity.open_to_international ? 'Open to all' : 'Authorization required',
                icon: Shield,
                status: opportunity.open_to_international || userAuthorized ? 'pass' : 'unknown',
            });
        }

        // 5. Experience Level
        if (opportunity.experience_level && userProfile.work_experiences) {
            const hasExperience = userProfile.work_experiences.length > 0;
            const expLevel = opportunity.experience_level.toLowerCase();
            const isEntryLevel = expLevel.includes('entry') || expLevel.includes('intern') || expLevel.includes('junior');

            results.push({
                id: 'experience',
                label: 'Experience Level',
                description: opportunity.experience_level,
                icon: Briefcase,
                status: isEntryLevel || hasExperience ? 'pass' : 'partial',
            });
        }

        // 6. Resume Uploaded
        if (userProfile.cv_filename || userProfile.resume_url) {
            results.push({
                id: 'resume',
                label: 'Resume',
                description: 'Ready to submit',
                icon: CheckCircle,
                status: 'pass',
            });
        } else {
            results.push({
                id: 'resume',
                label: 'Resume',
                description: 'Upload required',
                icon: AlertTriangle,
                status: 'fail',
            });
        }

        return results;
    }, [opportunity, userProfile]);

    // Calculate overall match score
    const overallScore = useMemo(() => {
        if (checks.length === 0) return 0;
        const scores = checks.map(c => {
            if (c.status === 'pass') return 100;
            if (c.status === 'partial') return 60;
            if (c.status === 'unknown') return 50;
            return 0;
        });
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }, [checks]);

    const getScoreColor = (score) => {
        if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pass':
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'partial':
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'fail':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pass':
                return 'bg-emerald-50 border-emerald-200';
            case 'partial':
                return 'bg-amber-50 border-amber-200';
            case 'fail':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-slate-50 border-slate-200';
        }
    };

    // Badge variant - compact score badge for cards
    if (variant === 'badge') {
        return (
            <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(overallScore)} ${className}`}
            >
                <Sparkles className="w-3 h-3" />
                {overallScore}% Match
            </div>
        );
    }

    // Compact variant - small row of indicators
    if (variant === 'compact') {
        const passCount = checks.filter(c => c.status === 'pass').length;
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(overallScore)}`}>
                    {overallScore}%
                </div>
                <span className="text-xs text-slate-500">
                    {passCount}/{checks.length} requirements met
                </span>
                <div className="flex gap-0.5">
                    {checks.slice(0, 5).map((check) => (
                        <div
                            key={check.id}
                            className={`w-1.5 h-4 rounded-full ${check.status === 'pass'
                                    ? 'bg-emerald-400'
                                    : check.status === 'partial'
                                        ? 'bg-amber-400'
                                        : check.status === 'fail'
                                            ? 'bg-red-400'
                                            : 'bg-slate-300'
                                }`}
                            title={check.label}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Detailed variant - full check list
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header with overall score */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    Qualification Check
                </h4>
                <div
                    className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(overallScore)}`}
                >
                    {overallScore}% Match
                </div>
            </div>

            {/* Check list */}
            <div className="space-y-2">
                {checks.map((check) => {
                    const Icon = check.icon;
                    return (
                        <div
                            key={check.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${getStatusColor(check.status)}`}
                        >
                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                <Icon className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">{check.label}</p>
                                <p className="text-xs text-slate-500 truncate">{check.description}</p>
                            </div>
                            {getStatusIcon(check.status)}
                        </div>
                    );
                })}
            </div>

            {/* Action hint */}
            {overallScore < 70 && (
                <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                        Complete your profile to improve your match score. Add missing skills, upload your resume, and update your graduation year.
                    </span>
                </p>
            )}
        </div>
    );
}

/**
 * Hook to easily get qualification info
 */
export function useQualificationCheck(opportunity, userProfile) {
    return useMemo(() => {
        if (!opportunity || !userProfile) {
            return { score: 0, checks: [], isQualified: false };
        }

        const requiredSkills = opportunity.required_skills || opportunity.skills || [];
        const userSkills = userProfile.skills || [];
        const matchedSkills = requiredSkills.filter(skill =>
            userSkills.some(us =>
                us.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(us.toLowerCase())
            )
        );

        const skillScore = requiredSkills.length > 0
            ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
            : 100;

        const hasResume = !!(userProfile.cv_filename || userProfile.resume_url);

        // Simple qualification calculation
        const score = Math.round((skillScore + (hasResume ? 100 : 0)) / 2);

        return {
            score,
            skillsMatched: matchedSkills.length,
            skillsTotal: requiredSkills.length,
            hasResume,
            isQualified: score >= 50,
        };
    }, [opportunity, userProfile]);
}
