import clsx from 'clsx';

export default function Card({ className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-[var(--color-border)]',
        className
      )}
      {...props}
    />
  );
}
