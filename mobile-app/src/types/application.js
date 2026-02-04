/**
 * Application status enum
 * @typedef {'draft' | 'submitted' | 'in_progress' | 'interview' | 'offer' | 'rejected' | 'withdrawn'} ApplicationStatus
 */

/**
 * Application event type enum
 * @typedef {'swiped_right' | 'application_started' | 'questions_requested' | 'questions_answered' | 'documents_attached' | 'submitted' | 'viewed_by_employer' | 'interview_scheduled' | 'interview_completed' | 'offer_received' | 'offer_accepted' | 'offer_declined' | 'rejected' | 'withdrawn' | 'follow_up_sent' | 'note_added'} ApplicationEventType
 */

/**
 * @typedef {Object} ApplicationEvent
 * @property {string} id
 * @property {string} application_id
 * @property {ApplicationEventType} event_type
 * @property {string} label
 * @property {string|null} description
 * @property {string} timestamp - ISO date string
 * @property {Object} metadata
 * @property {boolean} is_milestone
 * @property {boolean} is_user_action
 */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} user_id
 * @property {string} opportunity_id
 * @property {ApplicationStatus} status
 * @property {string} applied_at - ISO date string
 * @property {string} updated_at - ISO date string
 * @property {string|null} resume_id
 * @property {string|null} transcript_id
 * @property {string|null} cover_letter_id
 * @property {string|null} portal_url
 * @property {string|null} portal_username
 * @property {string|null} portal_password_encrypted
 * @property {Object[]} answers
 * @property {string|null} notes
 * @property {Object} opportunity - Joined opportunity data
 * @property {ApplicationEvent[]} events
 */

/**
 * @typedef {Object} TimelineGroup
 * @property {string} date - YYYY-MM-DD
 * @property {string} displayDate - "JANUARY 13"
 * @property {ApplicationEvent[]} events
 */

/**
 * Status configuration for display
 */
export const STATUS_CONFIG = {
    draft: {
        label: 'DRAFT',
        dotColor: 'slate-400',
        bgColor: 'slate-100',
        textColor: 'slate-700'
    },
    submitted: {
        label: 'SUBMITTED',
        dotColor: 'green-500',
        bgColor: 'green-100',
        textColor: 'green-700'
    },
    in_progress: {
        label: 'IN PROGRESS',
        dotColor: 'blue-500',
        bgColor: 'blue-100',
        textColor: 'blue-700'
    },
    interview: {
        label: 'INTERVIEW',
        dotColor: 'purple-500',
        bgColor: 'purple-100',
        textColor: 'purple-700'
    },
    offer: {
        label: 'OFFER',
        dotColor: 'emerald-500',
        bgColor: 'emerald-100',
        textColor: 'emerald-700'
    },
    rejected: {
        label: 'REJECTED',
        dotColor: 'red-500',
        bgColor: 'red-100',
        textColor: 'red-700'
    },
    withdrawn: {
        label: 'WITHDRAWN',
        dotColor: 'slate-500',
        bgColor: 'slate-100',
        textColor: 'slate-700'
    },
};

/**
 * Event type configuration for icons and labels
 */
export const EVENT_TYPE_CONFIG = {
    swiped_right: { label: 'You swiped right', color: 'purple' },
    application_started: { label: 'Started application', color: 'blue' },
    questions_requested: { label: 'Questions requested', color: 'amber' },
    questions_answered: { label: 'Answered questions', color: 'green' },
    documents_attached: { label: 'Documents attached', color: 'slate' },
    submitted: { label: 'Application submitted', color: 'purple' },
    viewed_by_employer: { label: 'Viewed by employer', color: 'blue' },
    interview_scheduled: { label: 'Interview scheduled', color: 'purple' },
    interview_completed: { label: 'Interview completed', color: 'green' },
    offer_received: { label: 'Offer received!', color: 'emerald' },
    offer_accepted: { label: 'Offer accepted', color: 'emerald' },
    offer_declined: { label: 'Offer declined', color: 'red' },
    rejected: { label: 'Application rejected', color: 'red' },
    withdrawn: { label: 'Application withdrawn', color: 'slate' },
    follow_up_sent: { label: 'Follow-up sent', color: 'blue' },
    note_added: { label: 'Note added', color: 'slate' },
};
