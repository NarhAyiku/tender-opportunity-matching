import { ChevronLeft, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

/**
 * ScreenHeader - App bar with back button, title, and overflow menu
 * @param {Object} props
 * @param {string} props.title
 * @param {() => void} props.onBack
 * @param {{ label: string, onClick: () => void, icon?: import('lucide-react').LucideIcon }[]} [props.menuItems]
 * @param {React.ReactNode} [props.rightElement]
 * @param {string} [props.className]
 */
export default function ScreenHeader({
    title,
    onBack,
    menuItems,
    rightElement,
    className = ''
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    return (
        <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 ${className}`}>
            <div className="flex items-center justify-between h-14 px-4">
                {/* Left - Back button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Back</span>
                </button>

                {/* Center - Title */}
                <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-slate-900 truncate max-w-[60%]">
                    {title}
                </h1>

                {/* Right - Menu or custom element */}
                <div className="relative" ref={menuRef}>
                    {rightElement ? (
                        rightElement
                    ) : menuItems && menuItems.length > 0 ? (
                        <>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {/* Dropdown menu */}
                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                                    {menuItems.map((item, index) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    item.onClick();
                                                    setMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                {ItemIcon && <ItemIcon className="w-4 h-4 text-slate-500" />}
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-10" /> // Spacer for centering title
                    )}
                </div>
            </div>
        </header>
    );
}
