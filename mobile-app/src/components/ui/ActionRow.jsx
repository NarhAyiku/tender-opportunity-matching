import { ChevronRight } from 'lucide-react';

/**
 * ActionRow - Tappable row with icon, label, and chevron
 * @param {Object} props
 * @param {import('lucide-react').LucideIcon} [props.icon]
 * @param {string} props.label
 * @param {string} [props.sublabel]
 * @param {() => void} props.onClick
 * @param {boolean} [props.showChevron=true]
 * @param {string} [props.className]
 */
export default function ActionRow({
    icon: Icon,
    label,
    sublabel,
    onClick,
    showChevron = true,
    className = ''
}) {
    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center gap-3 p-3 bg-white rounded-xl
        border border-slate-100 shadow-sm
        hover:bg-slate-50 active:scale-[0.99] transition-all
        text-left ${className}
      `}
        >
            {Icon && (
                <div className="p-2 bg-slate-100 rounded-lg">
                    <Icon className="w-4 h-4 text-slate-600" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
                {sublabel && (
                    <p className="text-xs text-slate-500 truncate">{sublabel}</p>
                )}
            </div>
            {showChevron && (
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
        </button>
    );
}
