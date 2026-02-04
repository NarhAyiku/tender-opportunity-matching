import { useState } from 'react';
import { ParseResult, ParsedData } from '../../types/document';
import { Button } from '../common/Button';
import { AlertTriangle, CheckCircle, Edit2 } from 'lucide-react';
import { documentApi } from '../../api/documentsApi';

interface ParsedDataReviewProps {
    parseResult: ParseResult;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ParsedDataReview({ parseResult, onConfirm, onCancel }: ParsedDataReviewProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { parsed_data, confidence_scores, low_confidence_fields } = parseResult;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await documentApi.applyParsedData({
                parse_id: parseResult.parse_id,
                action: 'merge', // Default to merge
            });
            onConfirm();
        } catch (err) {
            setError('Failed to apply profile changes. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getConfidenceLevel = (field: string) => {
        const score = confidence_scores[field] || 0;
        if (score >= 0.8) return { color: 'text-emerald-600', label: 'High Confidence' };
        if (score >= 0.7) return { color: 'text-blue-600', label: 'Good' };
        return { color: 'text-amber-600', label: 'Review Needed' };
    };

    const sections = [
        { key: 'skills', label: 'Skills', count: parsed_data.skills?.length || 0 },
        { key: 'work_experiences', label: 'Work Experience', count: parsed_data.work_experiences?.length || 0 },
        { key: 'education', label: 'Education', count: parsed_data.education?.length || 0 },
        { key: 'projects', label: 'Projects', count: parsed_data.projects?.length || 0 },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-purple-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Profile Auto-Filled!</h2>
                <p className="text-gray-500 text-sm">
                    We extracted the following data from your resume.
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {sections.map((section) => {
                    const conf = getConfidenceLevel(section.key);
                    const isLow = low_confidence_fields.includes(section.key);

                    return (
                        <div key={section.key} className={`p-3 rounded-lg border ${isLow ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-semibold uppercase text-gray-500">{section.label}</span>
                                {isLow && <AlertTriangle size={12} className="text-amber-500" />}
                            </div>
                            <div className="text-lg font-bold text-gray-900">{section.count} <span className="text-xs font-normal text-gray-400">items</span></div>
                            <div className={`text-xs ${conf.color} font-medium mt-1`}>
                                {Math.round((confidence_scores[section.key] || 0) * 100)}% Match
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Preview Section */}
            <div className="mb-6 space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {/* Social Links */}
                {(parsed_data.linkedin_url || parsed_data.github_url || parsed_data.portfolio_url) && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Social Links</h3>
                        <div className="space-y-1 text-sm">
                            {parsed_data.linkedin_url && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">LinkedIn:</span>
                                    <a href={parsed_data.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 truncate max-w-[200px]">{parsed_data.linkedin_url}</a>
                                </div>
                            )}
                            {parsed_data.github_url && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">GitHub:</span>
                                    <a href={parsed_data.github_url} target="_blank" rel="noreferrer" className="text-blue-600 truncate max-w-[200px]">{parsed_data.github_url}</a>
                                </div>
                            )}
                            {parsed_data.portfolio_url && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Portfolio:</span>
                                    <a href={parsed_data.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-600 truncate max-w-[200px]">{parsed_data.portfolio_url}</a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {parsed_data.skills && parsed_data.skills.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Skills Detected</h3>
                        <div className="flex flex-wrap gap-2">
                            {parsed_data.skills.slice(0, 10).map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-700">
                                    {skill}
                                </span>
                            ))}
                            {parsed_data.skills.length > 10 && (
                                <span className="px-2 py-1 bg-white border border-gray-200 text-xs rounded text-gray-500">
                                    +{parsed_data.skills.length - 10} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    Discard
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    className="flex-1"
                    isLoading={isSubmitting}
                >
                    Apply to Profile
                </Button>
            </div>
        </div>
    );
}

