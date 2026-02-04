import { useState } from 'react';
import { Input } from '../common/Input';
import { Search, SlidersHorizontal } from 'lucide-react';
import { CandidateFilters, CandidateSource } from '../../types/recruiter';

interface FiltersBarProps {
    onFiltersChange: (filters: Partial<CandidateFilters>) => void;
}

/**
 * FiltersBar component for filtering candidates
 */
export function FiltersBar({ onFiltersChange }: FiltersBarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        onFiltersChange({ search: value || undefined });
    };

    const handleFitScoreChange = (value: string) => {
        const score = parseInt(value);
        onFiltersChange({ minFitScore: isNaN(score) ? undefined : score });
    };

    const handleSourceChange = (value: string) => {
        onFiltersChange({ source: value as CandidateSource || undefined });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search by name, email, or skills..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 pr-4 w-full"
                        />
                    </div>
                </div>

                {/* Fit Score Filter */}
                <div className="w-full lg:w-48">
                    <select
                        onChange={(e) => handleFitScoreChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">All Fit Scores</option>
                        <option value="90">90% and above</option>
                        <option value="80">80% and above</option>
                        <option value="70">70% and above</option>
                    </select>
                </div>

                {/* Source Filter */}
                <div className="w-full lg:w-48">
                    <select
                        onChange={(e) => handleSourceChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">All Sources</option>
                        <option value="QualityMatch">QualityMatch</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Direct">Direct Apply</option>
                        <option value="Referral">Referral</option>
                    </select>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <SlidersHorizontal size={16} />
                    Filters
                </button>
            </div>

            {/* Advanced Filters (hidden by default) */}
            {showAdvanced && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Advanced filters coming soon...</p>
                </div>
            )}
        </div>
    );
}
