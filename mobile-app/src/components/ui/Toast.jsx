import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ message, type = 'success', onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg ${
            type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-amber-500 text-white'
          }`}
          onClick={onClose}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
