import { useEffect, useState } from 'react';
import {
  Gauge, FileText, GitCompareArrows, GraduationCap, Mic,
  Target, ArrowRight, CheckCircle2, Info,
} from 'lucide-react';
import { PageHeader, Card, Badge, ProgressBar, RingProgress, StatCard } from '@/components/ui';
import type { PageId } from '@/components/AppShell';
import {
  getReadinessScore, getSkillPassport, getResumeResult, getFoundationTrack, getRoadmap,
} from '@/services/api';

interface DashboardData {
  readinessScore: number;
  breakdown: { label: string; score: number }[];
  verifiedCount: number;
  totalSkillsCount: number;
  atsScore: number;
  foundationModules: { id: string; name: string; progress: number }[];
  currentWeek: { week: number; topic: string; focus: string } | null;
}

export function StudentDashboardPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userName = localStorage.getItem('user_name') || 'Student';

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }

    Promise.all([
      getReadinessScore(token),
      getSkillPassport(token),
      getResumeResult(token),
      getFoundationTrack(token),
      getRoadmap(token),
    ])
      .then(([readiness, passport, resume, foundation, roadmap]) => {
        setData({
          readinessScore: readiness.final_score,
          breakdown: [
            { label: 'Resume Score', score: readiness.breakdown.resume_score },
            { label: 'Verified Skills', score: readiness.breakdown.verified_skills_percent },
            { label: 'Foundation Completion', score: readiness.breakdown.foundation_percent },
          ],
          verifiedCount: passport.verified_count,
          totalSkillsCount: passport.total_count,
          atsScore: resume.ats_score,
          foundationModules: foundation.modules.slice(0, 4),
          currentWeek: roadmap.weekly_plan?.[0] || null,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, [onNavigate]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading your dashboard...</p>;
  }

  if (error || !data) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-slate-800">{error || 'Something went wrong'}</p>
        <p className="mt-1 text-xs text-slate-400">
          Upload a resume and complete your profile to populate your dashboard.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${userName.split(' ')[0]}`}
        subtitle="Here's where your placement preparation stands right now"
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Readiness Score"
          value={data.readinessScore}
          sublabel="out of 100"
          icon={<Gauge className="h-6 w-6" />}
          accent="violet"
          delay={0.05}
        />
        <StatCard
          label="Verified Skills"
          value={`${data.verifiedCount}/${data.totalSkillsCount}`}
          sublabel="quiz score ≥ 80%"
          icon={<CheckCircle2 className="h-6 w-6" />}
          accent="success"
          delay={0.1}
        />
        <StatCard
          label="ATS Resume Score"
          value={data.atsScore}
          sublabel={data.atsScore >= 70 ? 'looking good' : 'needs improvement'}
          icon={<FileText className="h-6 w-6" />}
          accent="warning"
          delay={0.15}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card delay={0.1} className="flex flex-col items-center justify-center">
          <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">Placement Readiness</p>
          <RingProgress value={data.readinessScore} size={140} stroke={12} color="#7c3aed" label={`${data.readinessScore}`} sublabel="/ 100" />
          <div className="mt-4 w-full space-y-2">
            {data.breakdown.map((c) => (
              <div key={c.label}>
                <div className="mb-0.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{c.label}</span>
                  <span className="font-mono text-slate-500">{c.score}</span>
                </div>
                <ProgressBar value={c.score} color={c.score >= 70 ? 'success' : 'warning'} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        <Card delay={0.15} className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-semibold text-slate-800">Current Focus</h3>
            </div>
            <button onClick={() => onNavigate('hub')} className="text-xs text-violet-600 hover:text-violet-400">
              View full roadmap →
            </button>
          </div>

          {data.currentWeek ? (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <Badge variant="cyan">Week {data.currentWeek.week}</Badge>
              <h4 className="mt-2 text-base font-semibold text-slate-800">{data.currentWeek.topic}</h4>
              <p className="mt-1 text-sm text-slate-500">{data.currentWeek.focus}</p>
              <button
                onClick={() => onNavigate('vault')}
                className="mt-3 flex items-center gap-1.5 rounded-lg bg-cyan-100 px-3 py-1.5 text-xs font-medium text-cyan-700 hover:bg-cyan-200"
              >
                Continue <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No active roadmap yet — visit Placement Hub to generate one.</p>
          )}

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Foundation Track</p>
            <div className="grid grid-cols-2 gap-2">
              {data.foundationModules.map((m) => (
                <div key={m.id} className="rounded-lg bg-ink-800 p-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-xs text-slate-600">{m.name}</span>
                    <span className="text-xs font-mono text-slate-400">{m.progress}%</span>
                  </div>
                  <ProgressBar value={m.progress} color={m.progress >= 70 ? 'success' : 'cyan'} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card delay={0.2}>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Run Skill Gap Analysis', page: 'gap' as PageId, icon: GitCompareArrows },
              { label: 'Take Adaptive Quiz', page: 'quiz' as PageId, icon: CheckCircle2 },
              { label: 'Start Mock Interview', page: 'interview' as PageId, icon: Mic },
              { label: 'Browse Study Vault', page: 'vault' as PageId, icon: GraduationCap },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.page)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-ink-600 bg-ink-800 p-3 text-left transition-all hover:border-violet-300"
                >
                  <Icon className="h-4 w-4 text-violet-600" />
                  <span className="flex-1 text-sm text-slate-600">{action.label}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-violet-600" />
                </button>
              );
            })}
          </div>
        </Card>

        <Card delay={0.25} className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">Activity Tracking</h3>
          </div>
          <p className="text-sm text-slate-500">
            Weekly activity charts and study streaks aren&apos;t tracked yet — this is planned for a future
            update once we add session/login history tracking.
          </p>
        </Card>
      </div>
    </div>
  );
}