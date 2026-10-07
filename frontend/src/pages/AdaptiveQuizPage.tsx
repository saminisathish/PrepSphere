import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListChecks, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  TrendingUp, Brain,
} from 'lucide-react';
import { PageHeader, Card, Badge, ProgressBar, RingProgress } from '@/components/ui';
import type { PageId } from '@/components/AppShell';
import { getRoadmap, getFoundationTrack, getQuiz, submitQuiz } from '@/services/api';

interface QuizQuestionData {
  question: string;
  options: string[];
}

interface QuizResult {
  score_percent: number;
  correct_count: number;
  total_questions: number;
  verified: boolean;
  next_difficulty: string;
}

const difficultyColor: Record<string, 'success' | 'warning' | 'error'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
};

export function AdaptiveQuizPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [difficulty, setDifficulty] = useState('easy');
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
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
        const roadmapSkills: string[] = (roadmapData.weekly_plan || []).map((w: { topic: string }) => w.topic);
        const foundationSkills: string[] = (foundationData.modules || []).map((m: { name: string }) => m.name);
        const combined = Array.from(new Set([...roadmapSkills, ...foundationSkills]));
        setAvailableSkills(combined);
        if (combined.length > 0) setSelectedSkill(combined[0]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, [onNavigate]);

  async function handleStart() {
    const token = localStorage.getItem('access_token');
    if (!token || !selectedSkill) return;

    setError('');
    try {
      const data = await getQuiz(token, selectedSkill, difficulty);
      setQuestions(data.questions);
      setDifficulty(data.difficulty);
      setAnswers([]);
      setCurrent(0);
      setSelected(null);
      setResult(null);
      setStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    }
  }

  function handleSelect(idx: number) {
    setSelected(idx);
  }

  async function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      return;
    }

    // Last question — submit
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const data = await submitQuiz(token, selectedSkill, difficulty, newAnswers);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    }
  }

  function handleReset() {
    setStarted(false);
    setResult(null);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading available skills...</p>;
  }

  // Setup screen
  if (!started) {
    return (
      <div>
        <PageHeader
          title="Adaptive Quiz"
          subtitle="Rule-based difficulty adjustment — no AI needed. Score 80% or higher to verify a skill."
        />
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <div className="grid gap-5 lg:grid-cols-3">
          <Card delay={0.05} className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Choose a skill to quiz on</h3>
                <p className="text-sm text-slate-500">From your roadmap and foundation track</p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {availableSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                    selectedSkill === skill
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-ink-600 bg-ink-800 text-slate-500 hover:border-violet-300'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-ink-800 p-3">
                <span className="text-sm text-slate-600">Starting difficulty</span>
                <Badge variant="success">Easy</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ink-800 p-3">
                <span className="text-sm text-slate-600">Adapts based on</span>
                <span className="text-sm text-slate-500">Score ≥80% → harder next time · &lt;50% → easier</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ink-800 p-3">
                <span className="text-sm text-slate-600">Verification threshold</span>
                <Badge variant="success">≥ 80%</Badge>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!selectedSkill}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              Start Quiz <ArrowRight className="h-4 w-4" />
            </button>
          </Card>

          <Card delay={0.1}>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">How adaptive difficulty works</h3>
            <div className="space-y-3 text-sm text-slate-500">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                <span>Score 80%+ → your next quiz on this skill starts harder</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-500" />
                <span>Score below 50% → your next quiz starts easier</span>
              </div>
              <div className="flex items-start gap-2">
                <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                <span>Score 80%+ verifies the skill in your Skill Passport</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Results screen
  if (result) {
    return (
      <div>
        <PageHeader title="Quiz Results" subtitle={`${selectedSkill} · ${difficulty} difficulty`} />
        <div className="grid gap-5 lg:grid-cols-3">
          <Card delay={0.05} className="flex flex-col items-center justify-center">
            <RingProgress
              value={result.score_percent}
              size={140}
              stroke={12}
              color={result.verified ? '#4ade80' : '#f59e0b'}
              label={`${result.score_percent}%`}
              sublabel={`${result.correct_count}/${result.total_questions} correct`}
            />
            <div className="mt-4">
              {result.verified ? (
                <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Skill Verified</Badge>
              ) : (
                <Badge variant="warning"><XCircle className="h-3 w-3" /> Not yet verified</Badge>
              )}
            </div>
          </Card>

          <Card delay={0.1} className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-ink-800 p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                  <span className="text-sm text-slate-600">Next attempt difficulty</span>
                </div>
                <Badge variant={difficultyColor[result.next_difficulty]}>{result.next_difficulty}</Badge>
              </div>
              {!result.verified && (
                <p className="text-sm text-slate-500">
                  You need 80% or higher to verify this skill. Review the Study Vault and try again.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-5 py-2.5 text-sm text-slate-600 hover:border-violet-300"
          >
            <RotateCcw className="h-4 w-4" />
            Take Another Quiz
          </button>
          <button
            onClick={() => onNavigate('readiness')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
          >
            View Readiness Score <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Active quiz screen
  const question = questions[current];
  const isLast = current === questions.length - 1;

  return (
    <div>
      <PageHeader title="Adaptive Quiz" subtitle={`${selectedSkill} · ${difficulty} difficulty`} />

      <div className="mb-5 flex items-center gap-4">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">Question {current + 1} of {questions.length}</span>
          </div>
          <ProgressBar value={current + 1} max={questions.length} color="violet" />
        </div>
        <Badge variant={difficultyColor[difficulty]}>{difficulty}</Badge>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-violet-600" />
              <span className="text-xs text-slate-500">{selectedSkill}</span>
            </div>
            <h3 className="mb-5 text-lg font-semibold text-slate-800">{question.question}</h3>

            <div className="space-y-2.5">
              {question.options.map((option, idx) => (
                <button
                  key={option}
                  onClick={() => handleSelect(idx)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    selected === idx
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-ink-600 bg-ink-800 hover:border-violet-300'
                  }`}
                >
                  <span className="text-slate-700">{option}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={selected === null}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {isLast ? 'Submit Quiz' : 'Next Question'} <ArrowRight className="h-4 w-4" />
            </button>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}