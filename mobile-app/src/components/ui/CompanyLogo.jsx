import { useState } from 'react';
import { Building2 } from 'lucide-react';

/**
 * Generates a consistent gradient based on company name
 * @param {string} name - Company name
 * @returns {string} CSS gradient string
 */
const generateGradient = (name) => {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple-Violet
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Rose
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue-Cyan
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Teal
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Teal-Pink
        'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', // Cyan-Purple
        'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', // Rose-Cream
        'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', // Cyan-Blue
        'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)', // Yellow-Cyan
    ];

    // Generate consistent index from company name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
};

/**
 * Gets initials from company name (max 2 characters)
 * @param {string} name - Company name
 * @returns {string} Initials
 */
const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
};

/**
 * CompanyLogo - Displays company logo with smart fallback
 * @param {Object} props
 * @param {string} [props.logoUrl] - URL to company logo
 * @param {string} props.companyName - Company name (required for fallback)
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Size variant
 * @param {string} [props.className] - Additional CSS classes
 */
export default function CompanyLogo({
    logoUrl,
    companyName,
    size = 'md',
    className = ''
}) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-14 h-14 text-lg',
    };

    const shouldShowImage = logoUrl && !imageError;
    const initials = getInitials(companyName);
    const gradient = generateGradient(companyName || 'Company');

    return (
        <div
            className={`
                relative rounded-xl overflow-hidden flex items-center justify-center
                flex-shrink-0 border border-slate-200/50
                ${sizeClasses[size]}
                ${className}
            `}
            style={!shouldShowImage || !imageLoaded ? { background: gradient } : undefined}
        >
            {shouldShowImage && (
                <img
                    src={logoUrl}
                    alt={`${companyName} logo`}
                    className={`
                        w-full h-full object-cover
                        ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                        transition-opacity duration-200
                    `}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            )}

            {/* Fallback: Gradient with initials */}
            {(!shouldShowImage || !imageLoaded) && (
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: gradient }}
                >
                    <span className="font-bold text-white drop-shadow-sm">
                        {initials}
                    </span>
                </div>
            )}
        </div>
    );
}
