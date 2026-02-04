import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SectionCard - Collapsible card container with title
 * @param {Object} props
 * @param {string} props.title
 * @param {import('lucide-react').LucideIcon} [props.icon]
 * @param {string} [props.iconBg='bg-purple-100']
 * @param {string} [props.iconColor='text-purple-600']
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.collapsible=false]
 * @param {boolean} [props.defaultOpen=true]
 * @param {string} [props.className]
 */
export default function SectionCard({
    title,
    icon: Icon,
    iconBg = 'bg-purple-100',
    iconColor = 'text-purple-600',
    children,
    collapsible = false,
    defaultOpen = true,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
            {/* Header */}
            <button
                onClick={() => collapsible && setIsOpen(!isOpen)}
                disabled={!collapsible}
                className={`
          w-full flex items-center gap-3 p-4
          ${collapsible ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}
          transition-colors
        `}
            >
                {Icon && (
                    <div className={`p-2 rounded-xl ${iconBg}`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                )}
                <h3 className="flex-1 text-left text-base font-bold text-slate-900">
                    {title}
                </h3>
                {collapsible && (
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    </motion.div>
                )}
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-4 pb-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
