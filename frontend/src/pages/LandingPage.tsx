import { motion } from 'framer-motion';
import {
  Sparkles, FileText, GitCompareArrows, GraduationCap, ListChecks,
  Mic, Gauge, ArrowRight, CheckCircle2, Shield, Zap, Target,
} from 'lucide-react';
import type { PageId } from '@/components/AppShell';

const flowSteps = [
  { icon: FileText, label: 'Resume Intelligence', desc: 'PDF parsed, skills extracted, ATS score calculated' },
  { icon: GitCompareArrows, label: 'Skill Gap Analysis', desc: 'Compare against role AND your dream company' },
  { icon: GraduationCap, label: 'Placement Hub', desc: 'AI roadmap + mandatory foundation track' },
  { icon: ListChecks, label: 'Adaptive Quiz', desc: 'Rule-based difficulty, verify your skills' },
  { icon: Mic, label: 'AI Mock Interview', desc: 'Voice-based, turn-by-turn, real feedback' },
  { icon: Gauge, label: 'Readiness Engine', desc: 'One transparent score, no black-box AI' },
];

const principles = [
  { icon: Shield, title: 'Deterministic & Trustworthy', desc: 'Scoring, gap analysis, and quiz logic run on plain code — not unpredictable AI. You always know why your score is what it is.' },
  { icon: Zap, title: 'Fast & Free', desc: 'Built on open-source tools and free tiers. Self-hosted MongoDB + Qdrant, Groq for AI, Vercel/Oracle for hosting.' },
  { icon: Target, title: 'Company-Specific', desc: 'Not generic role matching. Your skills are compared against your dream company\'s actual requirements.' },
];

export function LandingPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <div className="min-h-screen bg-ink-950">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">PrepSphere</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#flow" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">How it works</a>
            <a href="#principles" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Principles</a>
            <a href="#stats" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Results</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('auth')} className="text-sm text-slate-600 hover:text-slate-800">
              Log in
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-glow transition-transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-100 blur-[120px] opacity-60" />

        <div className="relative mx-auto max-w-5xl px-4 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm text-violet-700"
          >
            <span className="flex h-2 w-2 rounded-full bg-success-500" />
            Placement Readiness Engine for Students
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold leading-tight text-slate-800 sm:text-5xl lg:text-6xl"
          >
            From resume to <span className="text-gradient">placement-ready</span>,
            <br />one transparent engine.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-500"
          >
            Upload your resume. We parse it, find the gap between your skills and your
            dream company's requirements, build you a personalized roadmap, and verify
            every skill — all the way to interview-proven.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => onNavigate('auth')}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-transform hover:scale-105"
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-medium text-slate-600 hover:border-violet-300 hover:text-slate-800"
            >
              View Demo Dashboard
            </button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            id="stats"
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              { value: '13', label: 'Core Modules' },
              { value: '100%', label: 'Free & Open Source' },
              { value: '80%', label: 'Verification Threshold' },
              { value: '1', label: 'Transparent Readiness Score' },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4">
                <p className="text-3xl font-bold text-gradient">{s.value}</p>
                <p className="mt-1 text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-800 lg:text-4xl">The complete flow</h2>
            <p className="mt-3 text-slate-500">Six engines, one journey — from upload to placement-ready.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {flowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-violet-300 hover:shadow-card"
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-50 transition-all group-hover:bg-violet-100" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 text-violet-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-1.5 text-lg font-semibold text-slate-800">{step.label}</h3>
                    <p className="text-sm text-slate-500">{step.desc}</p>
                  </div>
                  <div className="absolute right-4 top-4 text-5xl font-bold text-slate-100">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section id="principles" className="relative py-20 lg:py-28">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-800 lg:text-4xl">Built on engineering principles</h2>
            <p className="mt-3 text-slate-500">Not a black box. Not a chatbot wrapper. A real engine.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {principles.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-800">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-10 text-center lg:p-16">
            <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-violet-200 blur-[100px] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-slate-800 lg:text-4xl">Ready to become placement-ready?</h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-500">
                Create your account, upload your resume, and get your personalized
                roadmap in minutes. No credit card, no fluff.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => onNavigate('auth')}
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-glow transition-transform hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-success-600" />
                  Free forever
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-400 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            PrepSphere — Placement Readiness Engine
          </div>
          <p>100% free & open-source</p>
        </div>
      </footer>
    </div>
  );
}
