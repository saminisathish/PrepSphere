import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Target, Building2, GraduationCap, School,
  ArrowRight, ArrowLeft, CheckCircle2,
} from 'lucide-react';
import type { PageId } from '@/components/AppShell';
import { updateMyProfile } from '@/services/api';

const careerGoals = [
  'Software Engineer', 'Full-Stack Developer', 'Data Scientist',
  'Backend Engineer', 'Frontend Engineer', 'DevOps Engineer',
  'ML Engineer', 'Cloud Engineer',
];

const dreamCompanies = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix',
  'Adobe', 'Uber', 'Flipkart', 'Swiggy', 'Zomato', 'Atlassian',
];

const yearToNumber: Record<string, number> = {
  '1st Year': 1,
  '2nd Year': 2,
  '3rd Year': 3,
  '4th Year': 4,
};

export function ProfileSetupPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('Software Engineer');
  const [company, setCompany] = useState('Google');
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [college, setCollege] = useState('VIT, Vellore');
  const [year, setYear] = useState('3rd Year');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Career Goal', 'Dream Company', 'Education'];

  async function handleFinish() {
    setError('');
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }

    setSaving(true);
    try {
      await updateMyProfile(token, {
        career_goal: goal,
        dream_company: company,
        degree,
        college,
        year: yearToNumber[year] ?? null,
      });
      localStorage.setItem('career_goal', goal);
      localStorage.setItem('dream_company', company);
      onNavigate('resume');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong saving your profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-12">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-100 blur-[120px] opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-2xl"
      >
        <button onClick={() => onNavigate('landing')} className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800">PrepSphere</span>
        </button>

        <div className="mb-6 flex items-center gap-3">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step > i + 1 ? 'bg-success-500 text-white' : step === i + 1 ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs ${step >= i + 1 ? 'text-slate-600' : 'text-slate-300'}`}>{s}</span>
              {i < steps.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">What's your career goal?</h2>
                <p className="mt-1 text-sm text-slate-500">This helps us tailor your roadmap and skill analysis.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {careerGoals.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      goal === g
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-violet-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">What's your dream company?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  We compare your skills against this company's specific requirements — not just generic role profiles.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {dreamCompanies.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCompany(c)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      company === c
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-cyan-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-6">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Tell us about your education</h2>
                <p className="mt-1 text-sm text-slate-500">Used for department-level insights and matching.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Degree</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">College / University</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Current Year</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                          year === y
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-violet-300'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </motion.div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Upload Resume'}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}