import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Briefcase, DollarSign, GraduationCap, Building } from 'lucide-react';

/**
 * JobDescriptionModal - Full job description display
 * @param {Object} props
 * @param {Object} props.opportunity - Opportunity data
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 */
export default function JobDescriptionModal({ opportunity, isOpen, onClose }) {
    if (!opportunity) return null;

    const formatSalary = () => {
        if (!opportunity.salary_min && !opportunity.salary_max) return null;
        const currency = { USD: '$', EUR: '€', GBP: '£', GHS: 'GH₵' }[opportunity.salary_currency] || '$';
        const period = opportunity.salary_period === 'monthly' ? '/mo' : '/yr';

        if (opportunity.salary_min && opportunity.salary_max) {
            return `${currency}${(opportunity.salary_min / 1000).toFixed(0)}k - ${currency}${(opportunity.salary_max / 1000).toFixed(0)}k${period}`;
        }
        return `${currency}${((opportunity.salary_min || opportunity.salary_max) / 1000).toFixed(0)}k${period}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-h-[90vh] rounded-t-3xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Job Description</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Job Title & Company */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {opportunity.title}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Building className="w-4 h-4" />
                                    <span className="font-medium">{opportunity.company_name}</span>
                                </div>
                            </div>

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {opportunity.location && (
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700">{opportunity.location}</span>
                                    </div>
                                )}
                                {opportunity.work_arrangement && (
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700 capitalize">{opportunity.work_arrangement}</span>
                                    </div>
                                )}
                                {opportunity.experience_level && (
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                        <Briefcase className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-700 capitalize">{opportunity.experience_level} Level</span>
                                    </div>
                                )}
                                {formatSalary() && (
                                    <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-emerald-700 font-medium">{formatSalary()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="font-bold text-slate-900 mb-2">About the Role</h4>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {opportunity.description || 'No description available.'}
                                </p>
                            </div>

                            {/* Required Skills */}
                            {opportunity.required_skills && opportunity.required_skills.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-2">Required Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {opportunity.required_skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {opportunity.education_requirement && (
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-2">Education</h4>
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                                        <GraduationCap className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-blue-700">{opportunity.education_requirement}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4">
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
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
