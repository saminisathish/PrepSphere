import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitCompareArrows, Building2, Briefcase, CheckCircle2, XCircle,
  AlertCircle, ArrowRight,
} from 'lucide-react';
import { PageHeader, Card, Badge, RingProgress } from '@/components/ui';
import type { PageId } from '@/components/AppShell';
import { getSkillGap } from '@/services/api';

interface SkillGapResult {
  generic: {
    role: string;
    required_skills: string[];
    matched_skills: string[];
    missing_skills: string[];
  };
  company_specific: {
    company: string;
    role: string | null;
    found: boolean;
    required_skills: string[];
    matched_skills: string[];
    missing_skills: string[];
  };
}

export function SkillGapAnalysisPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [data, setData] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }
    getSkillGap(token)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, [onNavigate]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading skill gap analysis...</p>;
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="mb-3 h-8 w-8 text-warning-400" />
        <p className="text-sm font-medium text-slate-800">{error}</p>
        <p className="mt-1 text-xs text-slate-400">
          Make sure you&apos;ve uploaded a resume and completed your profile first.
        </p>
      </Card>
    );
  }

  if (!data) return null;

  const companyMatchPct = data.company_specific.required_skills.length
    ? Math.round(
        (data.company_specific.matched_skills.length / data.company_specific.required_skills.length) * 100
      )
    : 0;

  return (
    <div>
      <PageHeader
        title="Skill Gap Analysis"
        subtitle={`Dual comparison: your skills vs. generic ${data.generic.role} profile AND ${data.company_specific.company}'s specific requirements`}
      >
        <button
          onClick={() => onNavigate('hub')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
        >
          Build Roadmap
          <ArrowRight className="h-4 w-4" />
        </button>
      </PageHeader>

      {!data.company_specific.found && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning-500" />
          <div className="text-sm text-slate-600">
            We don&apos;t have specific requirement data for{' '}
            <span className="font-semibold text-slate-800">{data.company_specific.company}</span> yet
            — showing the generic role comparison only. Company-specific data will be added soon.
          </div>
        </motion.div>
      )}

      {/* Summary cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.company_specific.found && (
          <Card delay={0.05} className="flex items-center gap-4">
            <RingProgress value={companyMatchPct} size={80} stroke={8} color="#22d3ee" label={`${companyMatchPct}%`} />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Company Match</p>
              <p className="text-sm text-slate-600">Skills meeting {data.company_specific.company}&apos;s bar</p>
            </div>
          </Card>
        )}
        <Card delay={0.1} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <XCircle className="h-6 w-6 text-error-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{data.company_specific.missing_skills.length}</p>
            <p className="text-xs text-slate-500">Missing for {data.company_specific.company}</p>
          </div>
        </Card>
        <Card delay={0.15} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
            <CheckCircle2 className="h-6 w-6 text-success-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{data.company_specific.matched_skills.length}</p>
            <p className="text-xs text-slate-500">Matched for {data.company_specific.company}</p>
          </div>
        </Card>
        <Card delay={0.2} className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
            <Briefcase className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{data.generic.missing_skills.length}</p>
            <p className="text-xs text-slate-500">Missing for generic {data.generic.role}</p>
          </div>
        </Card>
      </div>

      {/* Two comparison panels */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card delay={0.1}>
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-cyan-500" />
            <h3 className="text-sm font-semibold text-slate-800">Generic Role — {data.generic.role}</h3>
          </div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Matched</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {data.generic.matched_skills.length === 0 && (
              <p className="text-xs text-slate-400">None yet</p>
            )}
            {data.generic.matched_skills.map((s) => (
              <Badge key={s} variant="success"><CheckCircle2 className="h-3 w-3" /> {s}</Badge>
            ))}
          </div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Missing</p>
          <div className="flex flex-wrap gap-2">
            {data.generic.missing_skills.length === 0 && (
              <p className="text-xs text-slate-400">Nothing missing — great coverage!</p>
            )}
            {data.generic.missing_skills.map((s) => (
              <Badge key={s} variant="warning"><XCircle className="h-3 w-3" /> {s}</Badge>
            ))}
          </div>
        </Card>

        <Card delay={0.15}>
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Dream Company — {data.company_specific.company}
            </h3>
          </div>
          {data.company_specific.found ? (
            <>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Matched</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {data.company_specific.matched_skills.length === 0 && (
                  <p className="text-xs text-slate-400">None yet</p>
                )}
                {data.company_specific.matched_skills.map((s) => (
                  <Badge key={s} variant="success"><CheckCircle2 className="h-3 w-3" /> {s}</Badge>
                ))}
              </div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Missing</p>
              <div className="flex flex-wrap gap-2">
                {data.company_specific.missing_skills.length === 0 && (
                  <p className="text-xs text-slate-400">Nothing missing — great coverage!</p>
                )}
                {data.company_specific.missing_skills.map((s) => (
                  <Badge key={s} variant="error"><XCircle className="h-3 w-3" /> {s}</Badge>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">No company-specific data available yet.</p>
          )}
        </Card>
      </div>

      {/* Insight banner */}
      {data.company_specific.found && data.company_specific.missing_skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-5 flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4"
        >
          <GitCompareArrows className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-violet-700">Key insight:</span>{' '}
            {data.company_specific.company} specifically requires{' '}
            <span className="text-slate-800">{data.company_specific.missing_skills.join(', ')}</span>{' '}
            which you don&apos;t yet have — this is exactly what your roadmap will target.
          </div>
        </motion.div>
      )}
    </div>
  );
}