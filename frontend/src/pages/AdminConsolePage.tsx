import { useEffect, useState } from 'react';
import {
  ShieldCheck, Plus, Database, Building2, ListChecks, X,
} from 'lucide-react';
import { PageHeader, Card, Badge, StatCard } from '@/components/ui';
import { getAdminOverview, getAdminCompanies, addAdminCompany, getAdminSkills, addAdminSkill } from '@/services/api';

interface Overview {
  built_in_companies: number;
  custom_companies_added: number;
  built_in_skills: number;
  custom_skills_added: number;
  quiz_topics: number;
}

interface CompanyEntry {
  company_name: string;
  role: string;
  required_skills: string[];
  source: 'built-in' | 'custom';
}

export function AdminConsolePage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [companies, setCompanies] = useState<CompanyEntry[]>([]);
  const [builtInSkills, setBuiltInSkills] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyRole, setNewCompanyRole] = useState('');
  const [newCompanySkills, setNewCompanySkills] = useState('');

  const [showSkillForm, setShowSkillForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');

  function loadAll() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoading(true);
    Promise.all([getAdminOverview(token), getAdminCompanies(token), getAdminSkills(token)])
      .then(([overviewData, companiesData, skillsData]) => {
        setOverview(overviewData);
        setCompanies(companiesData.companies);
        setBuiltInSkills(skillsData.built_in_skills);
        setCustomSkills(skillsData.custom_skills);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  async function handleAddCompany() {
    const token = localStorage.getItem('access_token');
    if (!token || !newCompanyName.trim() || !newCompanyRole.trim()) return;

    try {
      await addAdminCompany(
        token,
        newCompanyName,
        newCompanyRole,
        newCompanySkills.split(',').map((s) => s.trim()).filter(Boolean)
      );
      setNewCompanyName('');
      setNewCompanyRole('');
      setNewCompanySkills('');
      setShowCompanyForm(false);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add company');
    }
  }

  async function handleAddSkill() {
    const token = localStorage.getItem('access_token');
    if (!token || !newSkillName.trim()) return;

    try {
      await addAdminSkill(token, newSkillName);
      setNewSkillName('');
      setShowSkillForm(false);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading admin console...</p>;
  }

  if (!overview) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-slate-800">{error || 'Something went wrong'}</p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Console"
        subtitle="Manage skill taxonomy, company requirements, and quiz bank"
      >
        <button
          onClick={() => setShowSkillForm(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </PageHeader>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs text-slate-500">
          Skills and companies added here are saved separately for now — they don&apos;t yet affect live
          Resume Intelligence or Skill Gap Analysis until that data source is unified.
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Built-in Skills" value={overview.built_in_skills} icon={<Database className="h-6 w-6" />} accent="violet" delay={0.05} />
        <StatCard label="Custom Skills Added" value={overview.custom_skills_added} icon={<Database className="h-6 w-6" />} accent="cyan" delay={0.1} />
        <StatCard label="Company Profiles" value={overview.built_in_companies + overview.custom_companies_added} icon={<Building2 className="h-6 w-6" />} accent="success" delay={0.15} />
        <StatCard label="Quiz Topics" value={overview.quiz_topics} icon={<ListChecks className="h-6 w-6" />} accent="warning" delay={0.2} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card delay={0.1} className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Skill Taxonomy</h3>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {builtInSkills.map((skill) => (
              <span key={skill} className="rounded-lg bg-ink-800 px-2.5 py-1 text-xs text-slate-500">{skill}</span>
            ))}
          </div>
          {customSkills.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Custom Added</p>
              <div className="flex flex-wrap gap-1.5">
                {customSkills.map((skill) => (
                  <Badge key={skill} variant="success">{skill}</Badge>
                ))}
              </div>
            </>
          )}

          {showSkillForm && (
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">Add a new skill</p>
                <button onClick={() => setShowSkillForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
              </div>
              <input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Rust"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
              <button
                onClick={handleAddSkill}
                className="mt-2 w-full rounded-lg bg-violet-500 py-2 text-sm font-medium text-white hover:bg-violet-600"
              >
                Add Skill
              </button>
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card delay={0.15}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Building2 className="h-4 w-4 text-cyan-600" />
              Company Requirements
            </h3>
            <div className="max-h-64 space-y-2 overflow-y-auto scrollbar-thin">
              {companies.map((company) => (
                <div key={company.company_name} className="flex items-center justify-between rounded-xl bg-ink-800 p-3">
                  <span className="text-sm text-slate-600">{company.company_name}</span>
                  <Badge variant={company.source === 'built-in' ? 'default' : 'success'}>
                    {company.required_skills.length} skills
                  </Badge>
                </div>
              ))}
            </div>

            {showCompanyForm ? (
              <div className="mt-3 space-y-2 rounded-xl border border-violet-200 bg-violet-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">Add company profile</p>
                  <button onClick={() => setShowCompanyForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
                </div>
                <input
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Company name"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                />
                <input
                  value={newCompanyRole}
                  onChange={(e) => setNewCompanyRole(e.target.value)}
                  placeholder="Role (e.g. Software Engineer)"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                />
                <input
                  value={newCompanySkills}
                  onChange={(e) => setNewCompanySkills(e.target.value)}
                  placeholder="Skills, comma separated"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                />
                <button
                  onClick={handleAddCompany}
                  className="w-full rounded-lg bg-violet-500 py-2 text-sm font-medium text-white hover:bg-violet-600"
                >
                  Add Company
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCompanyForm(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-600 py-2.5 text-sm text-slate-500 hover:border-violet-300 hover:text-violet-600"
              >
                <Plus className="h-4 w-4" />
                Add Company Profile
              </button>
            )}
          </Card>

          <Card delay={0.2}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ListChecks className="h-4 w-4 text-violet-600" />
              Quiz Bank Topics
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="violet"><ShieldCheck className="h-3 w-3" /> {overview.quiz_topics} topics with real questions</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}