import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Sparkles, CheckCircle2, ArrowRight, Circle,
} from 'lucide-react';
import { PageHeader, Card, Badge, ProgressBar } from '@/components/ui';
import type { PageId } from '@/components/AppShell';
import { getRoadmap, getFoundationTrack } from '@/services/api';

interface RoadmapWeek {
  week: number;
  topic: string;
  focus: string;
}

interface FoundationModule {
  id: string;
  name: string;
  category: string;
  progress: number;
  verified: boolean;
}

export function PlacementHubPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [track, setTrack] = useState<'roadmap' | 'foundation'>('roadmap');
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([]);
  const [roadmapNote, setRoadmapNote] = useState('');
  const [foundationModules, setFoundationModules] = useState<FoundationModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }

    Promise.all([getRoadmap(token), getFoundationTrack(token)])
      .then(([roadmapData, foundationData]) => {
        setRoadmap(roadmapData.weekly_plan || []);
        setRoadmapNote(roadmapData.note || '');
        setFoundationModules(foundationData.modules || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, [onNavigate]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading your placement hub...</p>;
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-slate-800">{error}</p>
        <p className="mt-1 text-xs text-slate-400">
          Make sure you&apos;ve uploaded a resume and completed your profile first.
        </p>
      </Card>
    );
  }

  const foundationProgress = foundationModules.length
    ? Math.round(foundationModules.reduce((sum, m) => sum + m.progress, 0) / foundationModules.length)
    : 0;

  const technicalCategory = foundationModules.filter((m) => m.category === 'Core Technical');
  const aptitudeCategory = foundationModules.filter((m) => m.category === 'Aptitude & Communication');

  return (
    <div>
      <PageHeader
        title="Placement Hub"
        subtitle="Two parallel tracks: a personalized AI roadmap for your company-specific gap, and a mandatory foundation track for everyone"
      />

      {/* Track selector */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setTrack('roadmap')}
          className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
            track === 'roadmap'
              ? 'border-violet-300 bg-violet-50 shadow-glow'
              : 'border-ink-600 bg-ink-800 hover:border-violet-300'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Personalized Technical Roadmap</p>
            <p className="text-xs text-slate-500">AI-generated (Groq) · Targeted at your skill gap</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gradient-violet">{roadmap.length}</p>
            <p className="text-[10px] text-slate-400">weeks planned</p>
          </div>
        </button>

        <button
          onClick={() => setTrack('foundation')}
          className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
            track === 'foundation'
              ? 'border-cyan-300 bg-cyan-50 shadow-glow-cyan'
              : 'border-ink-600 bg-ink-800 hover:border-cyan-300'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Foundation Track</p>
            <p className="text-xs text-slate-500">Mandatory for everyone · DSA, DBMS, OOP, OS, CN + Aptitude</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-cyan-600">{foundationProgress}%</p>
            <p className="text-[10px] text-slate-400">avg across modules</p>
          </div>
        </button>
      </div>

      {/* Roadmap track */}
      {track === 'roadmap' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">AI Roadmap</span> — generated by Groq based on your
                skill gap analysis
              </p>
            </div>
          </Card>

          {roadmap.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="mb-3 h-8 w-8 text-success-500" />
              <p className="text-sm font-medium text-slate-800">
                {roadmapNote || 'No roadmap generated yet.'}
              </p>
            </Card>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 h-full w-0.5 bg-ink-700" />
              <div className="space-y-3">
                {roadmap.map((step, i) => (
                  <motion.div
                    key={step.week}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative flex items-start gap-4"
                  >
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink-600 bg-ink-800">
                      <Circle className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="flex-1 rounded-2xl border border-ink-600 bg-ink-800 p-4">
                      <span className="text-xs font-mono text-slate-400">Week {step.week}</span>
                      <h3 className="mt-1 text-sm font-semibold text-slate-800">{step.topic}</h3>
                      <p className="mt-1 text-xs text-slate-500">{step.focus}</p>
                      <button
                        onClick={() => onNavigate('vault')}
                        className="mt-3 flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-100"
                      >
                        Study this topic <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Foundation track */}
      {track === 'foundation' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="mb-5">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-cyan-600" />
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Foundation Track</span> — mandatory for every student.
                Covers core CS subjects and soft skills that every company tests.
              </p>
            </div>
          </Card>

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Core Technical</p>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technicalCategory.map((m) => (
              <Card key={m.id} className="!p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">{m.name}</h3>
                  {m.verified && <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>}
                </div>
                <div className="mt-3">
                  <ProgressBar value={m.progress} color={m.verified ? 'success' : 'violet'} size="sm" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">{m.progress}%</span>
                  <button
                    onClick={() => onNavigate('vault')}
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700"
                  >
                    Study <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Aptitude & Communication</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aptitudeCategory.map((m) => (
              <Card key={m.id} className="!p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">{m.name}</h3>
                  {m.verified && <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>}
                </div>
                <div className="mt-3">
                  <ProgressBar value={m.progress} color={m.verified ? 'success' : 'cyan'} size="sm" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">{m.progress}%</span>
                  <button
                    onClick={() => onNavigate('vault')}
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700"
                  >
                    Study <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <Card delay={0.2} className="mt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Foundation Track Progress</p>
                <p className="text-xs text-slate-400">All modules must reach 100% for placement readiness</p>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={foundationProgress} color="cyan" size="lg" />
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}