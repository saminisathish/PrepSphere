import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Upload, Sparkles,
} from 'lucide-react';
import { PageHeader, Card, RingProgress, Badge } from '@/components/ui';
import type { PageId } from '@/components/AppShell';
import { uploadResume, getMyResume } from '@/services/api';

interface ResumeResult {
  ats_score: number;
  extracted_skills: string[];
  missing_sections: string[];
}

export function ResumeIntelligencePage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }
    getMyResume(token).then((data) => {
      if (data) setResult(data);
    });
  }, [onNavigate]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await uploadResume(token, file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <PageHeader
        title="Resume Intelligence"
        subtitle="PDF parsed with PyMuPDF + spaCy · Skills extracted · ATS score calculated — all deterministic"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelected}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-200 px-4 py-2 text-sm text-violet-700 hover:bg-violet-100 disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {loading ? 'Analyzing...' : result ? 'Re-upload' : 'Upload Resume'}
        </button>
      </PageHeader>

      {error && (
        <p className="mb-4 text-sm text-red-500">{error}</p>
      )}

      {!result && !loading && (
        <Card delay={0.05} className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <FileText className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium text-slate-800">No resume uploaded yet</p>
          <p className="mt-1 text-xs text-slate-400">Upload a PDF to get your ATS score and extracted skills</p>
        </Card>
      )}

      {result && (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <Card delay={0.05} className="flex flex-col items-center justify-center">
              <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">ATS Score</p>
              <RingProgress
                value={result.ats_score}
                size={140}
                stroke={12}
                color="#7c3aed"
                label={`${result.ats_score}`}
                sublabel="out of 100"
              />
              <div className="mt-4 flex items-center gap-2">
                <Badge variant={result.ats_score >= 70 ? 'success' : 'warning'}>
                  {result.ats_score >= 70 ? 'Looking Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </Card>

            <Card delay={0.1} className="lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">Missing Sections</h3>
              {result.missing_sections.length === 0 ? (
                <p className="text-sm text-slate-400">All key sections detected — nothing missing.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.missing_sections.map((section) => (
                    <Badge key={section} variant="warning">{section}</Badge>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card delay={0.15} className="mt-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Extracted Skills</h3>
                <p className="mt-0.5 text-xs text-slate-400">Detected from your resume text</p>
              </div>
              <Badge variant="violet"><Sparkles className="h-3 w-3" /> {result.extracted_skills.length} skills</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.extracted_skills.map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.03 }}
                  className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-3 py-2"
                >
                  <span className="text-sm font-medium text-slate-800">{skill}</span>
                </motion.div>
              ))}
            </div>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-5 flex items-center justify-between rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-100 to-cyan-100 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <FileText className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Resume parsed successfully</p>
                <p className="text-xs text-slate-500">Next: compare your skills against your dream company's requirements</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('gap')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
            >
              Run Skill Gap Analysis
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}