import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Video, FileText, ExternalLink, ListChecks, Search } from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/ui';
import type { PageId } from '@/components/AppShell';
import { getRoadmap, getFoundationTrack, getStudyContent } from '@/services/api';

interface StudyContent {
  skill_name: string;
  notes: string;
  video_links: string[];
  official_docs: string[];
  practice_questions: string[];
}

export function StudyVaultPage({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [content, setContent] = useState<StudyContent | null>(null);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
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
        if (combined.length > 0) {
          setSelectedSkill(combined[0]);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoadingSkills(false));
  }, [onNavigate]);

  useEffect(() => {
    if (!selectedSkill) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoadingContent(true);
    getStudyContent(token, selectedSkill)
      .then(setContent)
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoadingContent(false));
  }, [selectedSkill]);

  if (loadingSkills) {
    return <p className="text-sm text-slate-400">Loading your study vault...</p>;
  }

  if (error && availableSkills.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-slate-800">{error}</p>
        <p className="mt-1 text-xs text-slate-400">
          Complete your resume and skill gap analysis first to populate your study vault.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Study Vault"
        subtitle="Notes, videos, docs, and practice questions — organized by skill from your roadmap and foundation track"
      >
        <button
          onClick={() => onNavigate('quiz')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
        >
          Take a Quiz
        </button>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <Card className="!p-3">
          <div className="mb-2 flex items-center gap-2 px-2">
            <Search className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skills</p>
          </div>
          <div className="max-h-[500px] space-y-1 overflow-y-auto scrollbar-thin">
            {availableSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                  selectedSkill === skill ? 'bg-violet-50 font-medium text-violet-700' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </Card>

        <div>
          {loadingContent && <p className="text-sm text-slate-400">Loading content...</p>}

          {!loadingContent && content && (
            <motion.div
              key={content.skill_name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <Card>
                <div className="mb-3 flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-violet-600" />
                  <h3 className="text-sm font-semibold text-slate-800">{content.skill_name} - Notes</h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{content.notes}</p>
              </Card>

              {content.video_links.length > 0 && (
                <Card>
                  <div className="mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4 text-cyan-600" />
                    <h3 className="text-sm font-semibold text-slate-800">Video Resources</h3>
                  </div>
                  <div className="space-y-2">
                    {content.video_links.map((link) => (
                      <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-violet-600 hover:border-violet-300">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {link}
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {content.official_docs.length > 0 && (
                <Card>
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-success-600" />
                    <h3 className="text-sm font-semibold text-slate-800">Official Documentation</h3>
                  </div>
                  <div className="space-y-2">
                    {content.official_docs.map((link) => (
                      <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-violet-600 hover:border-violet-300">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {link}
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {content.practice_questions.length > 0 && (
                <Card>
                  <div className="mb-3 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-warning-600" />
                    <h3 className="text-sm font-semibold text-slate-800">Practice Questions</h3>
                    <Badge variant="warning">{content.practice_questions.length}</Badge>
                  </div>
                  <ol className="space-y-2">
                    {content.practice_questions.map((q, i) => (
                      <li key={q} className="flex gap-2 text-sm text-slate-600">
                        <span className="font-mono text-xs text-slate-400">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}