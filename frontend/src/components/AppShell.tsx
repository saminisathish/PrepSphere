import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Home, FileText, GitCompareArrows, GraduationCap,
  BookMarked, ListChecks, Mic, Gauge, Users, ShieldCheck, Menu,
  Sparkles, Settings, Award,
} from 'lucide-react';

export type PageId =
  | 'landing' | 'auth' | 'profile' | 'resume' | 'gap' | 'hub'
  | 'vault' | 'quiz' | 'interview' | 'readiness' | 'passport'
  | 'student-dashboard' | 'department' | 'admin' | 'settings';

const navGroups: { label: string; items: { id: PageId; label: string; icon: typeof Home }[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'readiness', label: 'Placement Readiness', icon: Gauge },
      { id: 'passport', label: 'Skill Passport', icon: Award },
    ],
  },
  {
    label: 'Preparation',
    items: [
      { id: 'resume', label: 'Resume Intelligence', icon: FileText },
      { id: 'gap', label: 'Skill Gap Analysis', icon: GitCompareArrows },
      { id: 'hub', label: 'Placement Hub', icon: GraduationCap },
      { id: 'vault', label: 'Study Vault', icon: BookMarked },
      { id: 'quiz', label: 'Adaptive Quiz', icon: ListChecks },
      { id: 'interview', label: 'AI Mock Interview', icon: Mic },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'department', label: 'Department', icon: Users },
      { id: 'admin', label: 'Admin Console', icon: ShieldCheck },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

function getCurrentStudent() {
  const name = localStorage.getItem('user_name') || 'Student';
  const dreamCompany = localStorage.getItem('dream_company') || 'Not set';
  const careerGoal = localStorage.getItem('career_goal') || 'Not set';
  const avatar = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return { name, dreamCompany, careerGoal, avatar, resumeScore: 0 };
}

export function AppShell({
  page,
  onNavigate,
  children,
}: {
  page: PageId;
  onNavigate: (p: PageId) => void;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const student = getCurrentStudent();
  const userRole = localStorage.getItem('user_role') || 'student';

  const visibleNavGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.id === 'department' || item.id === 'admin') {
        return userRole === 'admin' || userRole === 'department';
      }
      return true;
    }),
  }));

  const isLanding = page === 'landing' || page === 'auth' || page === 'profile';

  if (isLanding) {
    return <div className="min-h-screen bg-ink-950">{children}</div>;
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <button
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-2.5 px-5 py-5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-slate-800">PrepSphere</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Placement Engine</p>
        </div>
      </button>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
        {visibleNavGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                  className={`group relative mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-violet-500"
                    />
                  )}
                  <Icon className={`h-4 w-4 ${active ? 'text-violet-600' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={() => onNavigate('settings')}
          className="flex w-full items-center gap-3 rounded-xl bg-slate-100 p-3 text-left hover:bg-slate-200"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold text-white">
            {student.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">{student.name}</p>
            <p className="truncate text-xs text-slate-400">{student.dreamCompany} · SWE</p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        {sidebar}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Target:</span>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                {student.dreamCompany} — {student.careerGoal}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-2 w-2 rounded-full bg-success-500" />
              <span className="text-xs text-slate-500">7-day streak</span>
            </div>
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-violet-300"
            >
              <span className="font-semibold text-slate-800">{student.resumeScore}</span>
              <span className="text-slate-400">Readiness</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin bg-ink-950 bg-grid">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}