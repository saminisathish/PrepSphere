import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

export function Card({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`glass rounded-2xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  accent = 'violet',
  delay = 0,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  accent?: 'violet' | 'cyan' | 'success' | 'warning' | 'error';
  delay?: number;
}) {
  const accentMap = {
    violet: 'text-violet-600',
    cyan: 'text-cyan-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-500',
  };
  return (
    <Card delay={delay} className="flex items-center gap-4">
      {icon && (
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 ${accentMap[accent]}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
        {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
      </div>
    </Card>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = 'violet',
  size = 'md',
}: {
  value: number;
  max?: number;
  color?: 'violet' | 'cyan' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colorMap = {
    violet: 'from-violet-500 to-violet-400',
    cyan: 'from-cyan-500 to-cyan-400',
    success: 'from-success-600 to-success-400',
    warning: 'from-warning-500 to-warning-400',
    error: 'from-error-500 to-error-400',
  };
  const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };
  return (
    <div className={`w-full rounded-full bg-slate-200 ${sizeMap[size]}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]}`}
      />
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'violet' | 'cyan' | 'success' | 'warning' | 'error';
}) {
  const variantMap = {
    default: 'bg-slate-100 text-slate-600 border-slate-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    success: 'bg-green-50 text-success-600 border-green-200',
    warning: 'bg-amber-50 text-warning-600 border-amber-200',
    error: 'bg-red-50 text-error-500 border-red-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantMap[variant]}`}>
      {children}
    </span>
  );
}

export function RingProgress({
  value,
  size = 120,
  stroke = 10,
  color = '#7c3aed',
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        {label && <span className="text-2xl font-bold text-slate-800">{label}</span>}
        {sublabel && <span className="text-xs text-slate-400">{sublabel}</span>}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </motion.div>
  );
}

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } } as any,
};
