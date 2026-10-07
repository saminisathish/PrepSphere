import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import type { PageId } from '@/components/AppShell';
import { registerUser, loginUser } from '@/services/api';

export function AuthPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminFields, setShowAdminFields] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  async function handleSubmit() {
    setError('');

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const data =
        mode === 'register'
          ? await registerUser(name, email, password, showAdminFields ? 'admin' : 'student', adminCode || undefined)
          : await loginUser(email, password);

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_name', data.name);
      localStorage.setItem('user_role', data.role || 'student');

      onNavigate(mode === 'register' ? 'profile' : 'student-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-100 blur-[120px] opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <button
          onClick={() => onNavigate('landing')}
          className="mb-8 flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800">PrepSphere</span>
        </button>

        <div className="glass rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-slate-800">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {mode === 'register'
              ? 'Start your placement readiness journey'
              : 'Log in to continue your journey'}
          </p>

          <div className="mt-6 flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'register' ? 'bg-violet-500 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-violet-500 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Log in
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white"
                  placeholder="Your full name"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white"
                  placeholder="you@college.edu"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdminFields(!showAdminFields)}
                  className="text-xs text-slate-400 hover:text-violet-600"
                >
                  {showAdminFields
                    ? 'Registering as a student instead? Click here'
                    : 'Registering as department/admin? Click here'}
                </button>
                {showAdminFields && (
                  <div className="mt-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Admin/Department Signup Code
                    </label>
                    <input
                      type="text"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading
              ? 'Please wait...'
              : mode === 'register' ? 'Create Account' : 'Log in'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            By continuing, you agree to PrepSphere's Terms & Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}