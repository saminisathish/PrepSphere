import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, CheckCircle2, Info } from 'lucide-react';
import { PageHeader, Card, Badge, ProgressBar, StatCard } from '@/components/ui';
import { getDepartmentOverview } from '@/services/api';

interface DepartmentData {
  total_students: number;
  average_ats_score: number;
  total_verified_skills: number;
  engagement_percent: number;
  top_skills: { skill: string; count: number }[];
}

export function DepartmentDashboardPage() {
  const [data, setData] = useState<DepartmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    getDepartmentOverview(token)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading department overview...</p>;
  }

  if (error || !data) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-slate-800">{error || 'Something went wrong'}</p>
      </Card>
    );
  }

  const maxSkillCount = data.top_skills.length ? Math.max(...data.top_skills.map((s) => s.count)) : 1;

  return (
    <div>
      <PageHeader
        title="Department Dashboard"
        subtitle="Aggregated student progress — no private data exposed. For department heads and faculty."
      >
        <Badge variant="cyan"><Users className="h-3 w-3" /> All Students</Badge>
      </PageHeader>

      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-500" />
          <p className="text-xs text-slate-500">
            Role-based access control isn&apos;t enforced yet — this view is currently visible to any logged-in
            account. Department/Admin account restrictions are planned for a future update.
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={data.total_students}
          icon={<Users className="h-6 w-6" />}
          accent="violet"
          delay={0.05}
        />
        <StatCard
          label="Engagement"
          value={`${data.engagement_percent}%`}
          sublabel="uploaded a resume"
          icon={<TrendingUp className="h-6 w-6" />}
          accent="cyan"
          delay={0.1}
        />
        <StatCard
          label="Avg ATS Score"
          value={data.average_ats_score}
          icon={<Award className="h-6 w-6" />}
          accent="warning"
          delay={0.15}
        />
        <StatCard
          label="Skills Verified"
          value={data.total_verified_skills}
          sublabel="across all students"
          icon={<CheckCircle2 className="h-6 w-6" />}
          accent="success"
          delay={0.2}
        />
      </div>

      <Card delay={0.2}>
        <div className="mb-4 flex items-center gap-2">
          <Award className="h-4 w-4 text-violet-600" />
          <h3 className="text-sm font-semibold text-slate-800">Most Common Skills Across Department</h3>
        </div>
        {data.top_skills.length === 0 ? (
          <p className="text-sm text-slate-400">No resume data yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {data.top_skills.map((skill, i) => (
              <motion.div
                key={skill.skill}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-ink-600 bg-ink-800 p-4 text-center"
              >
                <p className="text-2xl font-bold text-gradient-violet">{skill.count}</p>
                <p className="mt-1 text-xs text-slate-500">{skill.skill}</p>
                <div className="mt-2">
                  <ProgressBar value={skill.count} max={maxSkillCount} color="violet" size="sm" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}