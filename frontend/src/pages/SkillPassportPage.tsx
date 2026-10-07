import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Circle } from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/ui';
import type { PageId } from '@/components/AppShell';
import { getSkillPassport } from '@/services/api';

interface PassportSkill {
  skill_name: string;
  status: string;
}

const stageOrder = ['discovered', 'learning', 'practicing', 'verified', 'interview_proven', 'placement_ready'];

const stageLabels: Record<string, string> = {
  discovered: 'Discovered',
  learning: 'Learning',
  practicing: 'Practicing',
  verified: 'Verified',
  interview_proven: 'Interview Proven',
  placement_ready: 'Placement Ready',
};

const stageVariant: Record<string, 'default' | 'warning' | 'cyan' | 'success' | 'violet'> = {
  discovered: 'default',
  learning: 'warning',
  practicing: 'cyan',
  verified: 'success',
  interview_proven: 'violet',
  placement_ready: 'success',
};

export function SkillPassportPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [skills, setSkills] = useState<PassportSkill[]>([]);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }
    getSkillPassport(token)
      .then((data) => {
        setSkills(data.skills || []);
        setVerifiedCount(data.verified_count || 0);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, [onNavigate]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading your skill passport...</p>;
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-slate-800">{error}</p>
        <p className="mt-1 text-xs text-slate-400">
          Upload a resume first to start building your skill passport.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Skill Passport"
        subtitle="Every skill's journey: Discovered → Learning → Practicing → Verified → Interview Proven → Placement Ready"
      >
        <Badge variant="violet"><Award className="h-3 w-3" /> {verifiedCount} verified</Badge>
      </PageHeader>

      {/* Stage legend */}
      <Card className="mb-5">
        <div className="flex flex-wrap gap-2">
          {stageOrder.map((stage, i) => (
            <div key={stage} className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-700 text-[10px] font-bold text-slate-400">
                {i + 1}
              </div>
              <span className="text-xs text-slate-500">{stageLabels[stage]}</span>
              {i < stageOrder.length - 1 && <span className="text-slate-400">→</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* Skills grid */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((sp, i) => {
          const stageIdx = stageOrder.indexOf(sp.status);
          return (
            <motion.div
              key={sp.skill_name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-ink-600 bg-ink-800 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{sp.skill_name}</span>
                <Badge variant={stageVariant[sp.status]}>{stageLabels[sp.status]}</Badge>
              </div>
              <div className="mt-2.5 flex items-center gap-1">
                {stageOrder.map((stage, idx) => (
                  <div
                    key={stage}
                    className={`h-1.5 flex-1 rounded-full ${
                      idx <= stageIdx
                        ? stageIdx >= 3
                          ? 'bg-success-500'
                          : 'bg-violet-500'
                        : 'bg-ink-700'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
        {skills.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
            <Circle className="mb-3 h-8 w-8" />
            <p className="text-sm">No skills tracked yet</p>
          </div>
        )}
      </div>
    </div>
  );
}