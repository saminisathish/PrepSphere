import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Info, ArrowRight, FileText, CheckCircle2, BookOpen, Mic, Flame,
} from 'lucide-react';
import { PageHeader, Card, Badge, ProgressBar, RingProgress } from '@/components/ui';
import type { PageId } from '@/components/AppShell';
import { getReadinessScore } from '@/services/api';

interface ReadinessData {
  final_score: number;
  breakdown: {
    resume_score: number;
    verified_skills_percent: number;
    foundation_percent: number;
    interview_percent: number;
    consistency_percent: number;
  };
}

const components = [
  { key: 'resume_score', label: 'Resume Score', weight: 25, icon: FileText },
  { key: 'verified_skills_percent', label: 'Verified Skills', weight: 25, icon: CheckCircle2 },
  { key: 'foundation_percent', label: 'Foundation Completion', weight: 20, icon: BookOpen },
  { key: 'interview_percent', label: 'Interview Performance', weight: 15, icon: Mic },
  { key: 'consistency_percent', label: 'Consistency', weight: 15, icon: Flame },
] as const;

export function ReadinessEnginePage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }
    getReadinessScore(token)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, [onNavigate]);

  if (loading) {
    return <p className="text-sm text-slate-400">Calculating your readiness score...</p>;
  }

  if (error || !data) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-slate-800">{error || 'Something went wrong'}</p>
        <p className="mt-1 text-xs text-slate-400">
          Upload a resume first to calculate your readiness score.
        </p>
      </Card>
    );
  }

  const totalScore = data.final_score;

  return (
    <div>
      <PageHeader
        title="Placement Readiness Engine"
        subtitle="One transparent, weighted score — deterministic formula, no AI. You always know why your score is what it is."
      >
        <Badge variant="violet"><Shield className="h-3 w-3" /> Deterministic</Badge>
      </PageHeader>

      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        <Card delay={0.05} className="flex flex-col items-center justify-center">
          <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">Placement Readiness Score</p>
          <RingProgress value={totalScore} size={160} stroke={14} color="#7c3aed" label={`${totalScore}`} sublabel="out of 100" />
          <div className="mt-4">
            <Badge variant={totalScore >= 80 ? 'success' : totalScore >= 60 ? 'warning' : 'error'}>
              {totalScore >= 80 ? 'Placement Ready' : totalScore >= 60 ? 'On Track' : 'Needs Work'}
            </Badge>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Weighted formula · Recalculated live every time you visit this page
          </p>
        </Card>

        <Card delay={0.1} className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Score Breakdown</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="h-3.5 w-3.5" />
              Each component contributes its weight × score
            </div>
          </div>
          <div className="space-y-4">
            {components.map((comp, i) => {
              const Icon = comp.icon;
              const score = data.breakdown[comp.key];
              const contribution = Math.round((score * comp.weight) / 100);
              return (
                <motion.div
                  key={comp.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-violet-600" />
                      <span className="text-sm text-slate-600">{comp.label}</span>
                      <Badge variant="default">{comp.weight}% weight</Badge>
                    </div>
                    <span className="font-mono text-sm text-slate-800">{score}/100</span>
                  </div>
                  <ProgressBar
                    value={score}
                    color={score >= 80 ? 'success' : score >= 60 ? 'cyan' : score >= 40 ? 'warning' : 'error'}
                  />
                  <div className="mt-1 flex items-center justify-end">
                    <span className="text-xs text-slate-400">
                      Contributes <span className="font-mono text-violet-600">{contribution} pts</span> to total
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-ink-600 bg-ink-850 p-3">
            <p className="font-mono text-xs text-slate-500">
              <span className="text-violet-600">Total</span> ={' '}
              {components.map((c) => `${data.breakdown[c.key]}×${c.weight}%`).join(' + ')} ={' '}
              <span className="text-slate-800">{totalScore}</span>
            </p>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-500" />
            <p className="text-xs text-slate-500">
              Interview Performance and Consistency are placeholder values for now — they&apos;ll reflect real
              data once the Mock Interview module and activity tracking are built.
            </p>
          </div>
        </Card>
      </div>

      <Card delay={0.2}>
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Recommended Next Steps</h3>
        <div className="space-y-2.5">
          {[
            { label: 'Take a quiz to verify more skills', page: 'quiz' as PageId },
            { label: 'Study weak topics in the Study Vault', page: 'vault' as PageId },
            { label: 'Review your skill gap for your dream company', page: 'gap' as PageId },
            { label: 'Update your resume with missing keywords', page: 'resume' as PageId },
          ].map((step) => (
            <button
              key={step.label}
              onClick={() => onNavigate(step.page)}
              className="group flex w-full items-center justify-between rounded-xl border border-ink-600 bg-ink-800 p-3 text-left transition-all hover:border-violet-300"
            >
              <span className="text-sm text-slate-600">{step.label}</span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-violet-600" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}