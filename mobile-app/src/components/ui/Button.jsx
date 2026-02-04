import { motion } from 'framer-motion';
import clsx from 'clsx';

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-strong)]',
  secondary:
    'bg-white text-[var(--color-primary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]',
  ghost: 'bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-50)]'
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  ...props
}) {
  const { disabled, ...rest } = props;
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-150 focus:outline-none',
        variants[variant],
        className,
        (loading || disabled) && 'opacity-70 cursor-not-allowed'
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
