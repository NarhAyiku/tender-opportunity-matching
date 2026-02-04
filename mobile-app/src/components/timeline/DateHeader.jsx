/**
 * DateHeader - Date group separator for timeline
 * @param {Object} props
 * @param {string} props.date - ISO date string
 * @param {string} [props.className]
 */
export default function DateHeader({ date, className = '' }) {
    const formatDate = (isoDate) => {
        const d = new Date(isoDate);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        const isYesterday = d.toDateString() === new Date(now - 86400000).toDateString();

        if (isToday) return 'TODAY';
        if (isYesterday) return 'YESTERDAY';

        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric'
        }).toUpperCase();
    };

    return (
        <div className={`flex items-center gap-3 py-3 ${className}`}>
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 tracking-wider">
                {formatDate(date)}
            </span>
            <div className="h-px flex-1 bg-slate-200" />
        </div>
    );
}
