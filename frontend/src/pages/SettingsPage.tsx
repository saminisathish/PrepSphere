import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';
import type { PageId } from '@/components/AppShell';
import { getMyProfile } from '@/services/api';

interface ProfileData {
  name: string;
  email: string;
  college?: string;
  degree?: string;
  career_goal?: string;
  dream_company?: string;
}

export function SettingsPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }
    getMyProfile(token).then(setProfile).catch(() => {});
  }, [onNavigate]);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  function handleLogout() {
    localStorage.clear();
    onNavigate('landing');
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card delay={0.05}>
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-800">Account</h3>
          </div>
          {profile ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Name</span>
                <span className="font-medium text-slate-700">{profile.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Email</span>
                <span className="font-medium text-slate-700">{profile.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">College</span>
                <span className="font-medium text-slate-700">{profile.college || 'Not set'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Career Goal</span>
                <span className="font-medium text-slate-700">{profile.career_goal || 'Not set'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-400">Dream Company</span>
                <span className="font-medium text-slate-700">{profile.dream_company || 'Not set'}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Loading...</p>
          )}
        </Card>

        <Card delay={0.1}>
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Preferences</h3>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-violet-500" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </p>
                <p className="text-xs text-slate-400">Switch how PrepSphere looks</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-violet-500' : 'bg-slate-300'
              }`}
            >
              <motion.div
                className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm"
                animate={{ left: theme === 'dark' ? 26 : 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </Card>
      </div>
    </div>
  );
}