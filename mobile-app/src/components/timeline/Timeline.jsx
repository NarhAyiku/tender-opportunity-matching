import { useMemo } from 'react';
import DateHeader from './DateHeader';
import TimelineItem from './TimelineItem';

/**
 * Group events by date
 * @param {Array} events
 * @returns {Array<{date: string, events: Array}>}
 */
const groupEventsByDate = (events) => {
    const groups = {};

    events.forEach(event => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(event);
    });

    // Sort dates descending (most recent first)
    return Object.entries(groups)
        .sort(([a], [b]) => new Date(b) - new Date(a))
        .map(([date, events]) => ({
            date,
            // Sort events within each day descending (most recent first)
            events: events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        }));
};

/**
 * Timeline - Date-grouped event timeline
 * @param {Object} props
 * @param {Array} props.events - Application events
 * @param {boolean} [props.groupByDate=true] - Group events by date
 * @param {string} [props.className]
 */
export default function Timeline({ events = [], groupByDate = true, className = '' }) {
    const groupedEvents = useMemo(() => {
        if (!groupByDate) {
            return [{ date: null, events: events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) }];
        }
        return groupEventsByDate(events);
    }, [events, groupByDate]);

    if (events.length === 0) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-sm text-slate-500">No events yet</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {groupedEvents.map((group, groupIndex) => (
                <div key={group.date || groupIndex}>
                    {/* Date header */}
                    {groupByDate && group.date && (
                        <DateHeader date={group.date} />
                    )}

                    {/* Events in this group */}
                    <div className="pl-1">
                        {group.events.map((event, eventIndex) => (
                            <TimelineItem
                                key={event.id}
                                event={event}
                                isFirst={eventIndex === 0}
                                isLast={eventIndex === group.events.length - 1 && groupIndex === groupedEvents.length - 1}
                                showConnector={true}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
