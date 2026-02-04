import clsx from 'clsx';

export default function Chip({ label, color = 'slate', className = '' }) {
  const palette = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-800'
  };
  return (
    <span
      className={clsx(
        'px-2 py-1 rounded-md text-xs font-semibold',
        palette[color] || palette.slate,
        className
      )}
    >
      {label}
    </span>
  );
}
