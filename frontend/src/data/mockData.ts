export type SkillStatus =
  | 'Discovered'
  | 'Learning'
  | 'Practicing'
  | 'Verified'
  | 'Interview Proven'
  | 'Placement Ready';

export const student = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@college.edu',
  avatar: 'AS',
  college: 'VIT, Vellore',
  degree: 'B.Tech Computer Science',
  year: '3rd Year',
  careerGoal: 'Software Engineer',
  dreamCompany: 'Google',
  resumeScore: 72,
  resumeUploaded: true,
  resumeParsedAt: '2026-07-28',
};

export type ResumeSection = {
  label: string;
  score: number;
  status: 'good' | 'warning' | 'error';
  detail: string;
};

export const resumeAnalysis: ResumeSection[] = [
  { label: 'Contact Info', score: 100, status: 'good', detail: 'Email, phone, LinkedIn, GitHub all present.' },
  { label: 'Summary', score: 60, status: 'warning', detail: 'Generic summary. Add a targeted objective mentioning Google and SWE.' },
  { label: 'Experience', score: 75, status: 'warning', detail: '2 internships listed. Quantify impact with metrics.' },
  { label: 'Projects', score: 85, status: 'good', detail: '3 strong projects with live links.' },
  { label: 'Skills Section', score: 90, status: 'good', detail: 'Well-organized, 14 skills detected.' },
  { label: 'Education', score: 100, status: 'good', detail: 'Degree, CGPA 8.4, relevant coursework.' },
  { label: 'Formatting', score: 65, status: 'warning', detail: 'Two-column layout may break ATS parsing. Use single column.' },
  { label: 'Keywords', score: 55, status: 'error', detail: 'Missing: System Design, Distributed Systems, GCP. Add for Google.' },
];

export const extractedSkills = [
  { name: 'Python', category: 'Programming', level: 'Advanced' },
  { name: 'JavaScript', category: 'Programming', level: 'Intermediate' },
  { name: 'React', category: 'Frontend', level: 'Intermediate' },
  { name: 'Node.js', category: 'Backend', level: 'Intermediate' },
  { name: 'SQL', category: 'Database', level: 'Advanced' },
  { name: 'MongoDB', category: 'Database', level: 'Intermediate' },
  { name: 'Git', category: 'Tools', level: 'Advanced' },
  { name: 'Docker', category: 'DevOps', level: 'Beginner' },
  { name: 'REST APIs', category: 'Backend', level: 'Intermediate' },
  { name: 'Data Structures', category: 'CS Fundamentals', level: 'Intermediate' },
  { name: 'Algorithms', category: 'CS Fundamentals', level: 'Intermediate' },
  { name: 'Linux', category: 'Tools', level: 'Intermediate' },
  { name: 'Pandas', category: 'Data', level: 'Intermediate' },
  { name: 'TensorFlow', category: 'ML', level: 'Beginner' },
];

export type GapSkill = {
  name: string;
  category: string;
  hasFromResume: boolean;
  roleImportance: 'Critical' | 'Important' | 'Bonus';
  companyImportance: 'Critical' | 'Important' | 'Bonus';
  proficiency: number;
  roleTarget: number;
  companyTarget: number;
  status: SkillStatus;
};

export const gapAnalysis: GapSkill[] = [
  { name: 'Data Structures', category: 'CS Fundamentals', hasFromResume: true, roleImportance: 'Critical', companyImportance: 'Critical', proficiency: 65, roleTarget: 85, companyTarget: 90, status: 'Practicing' },
  { name: 'Algorithms', category: 'CS Fundamentals', hasFromResume: true, roleImportance: 'Critical', companyImportance: 'Critical', proficiency: 60, roleTarget: 85, companyTarget: 90, status: 'Learning' },
  { name: 'System Design', category: 'Architecture', hasFromResume: false, roleImportance: 'Important', companyImportance: 'Critical', proficiency: 0, roleTarget: 70, companyTarget: 85, status: 'Discovered' },
  { name: 'Distributed Systems', category: 'Architecture', hasFromResume: false, roleImportance: 'Bonus', companyImportance: 'Critical', proficiency: 0, roleTarget: 50, companyTarget: 80, status: 'Discovered' },
  { name: 'Python', category: 'Programming', hasFromResume: true, roleImportance: 'Critical', companyImportance: 'Critical', proficiency: 80, roleTarget: 80, companyTarget: 85, status: 'Practicing' },
  { name: 'GCP', category: 'Cloud', hasFromResume: false, roleImportance: 'Bonus', companyImportance: 'Critical', proficiency: 0, roleTarget: 40, companyTarget: 80, status: 'Discovered' },
  { name: 'SQL', category: 'Database', hasFromResume: true, roleImportance: 'Important', companyImportance: 'Important', proficiency: 75, roleTarget: 75, companyTarget: 80, status: 'Practicing' },
  { name: 'DBMS', category: 'Database', hasFromResume: true, roleImportance: 'Important', companyImportance: 'Important', proficiency: 70, roleTarget: 80, companyTarget: 80, status: 'Learning' },
  { name: 'Operating Systems', category: 'CS Fundamentals', hasFromResume: false, roleImportance: 'Important', companyImportance: 'Important', proficiency: 20, roleTarget: 75, companyTarget: 80, status: 'Learning' },
  { name: 'Computer Networks', category: 'CS Fundamentals', hasFromResume: false, roleImportance: 'Important', companyImportance: 'Important', proficiency: 15, roleTarget: 70, companyTarget: 75, status: 'Discovered' },
  { name: 'Object-Oriented Programming', category: 'CS Fundamentals', hasFromResume: true, roleImportance: 'Critical', companyImportance: 'Critical', proficiency: 70, roleTarget: 85, companyTarget: 85, status: 'Practicing' },
  { name: 'Dynamic Programming', category: 'Algorithms', hasFromResume: false, roleImportance: 'Important', companyImportance: 'Critical', proficiency: 25, roleTarget: 80, companyTarget: 85, status: 'Learning' },
  { name: 'Graph Algorithms', category: 'Algorithms', hasFromResume: false, roleImportance: 'Important', companyImportance: 'Critical', proficiency: 20, roleTarget: 75, companyTarget: 85, status: 'Discovered' },
  { name: 'React', category: 'Frontend', hasFromResume: true, roleImportance: 'Bonus', companyImportance: 'Bonus', proficiency: 70, roleTarget: 60, companyTarget: 60, status: 'Practicing' },
  { name: 'Docker', category: 'DevOps', hasFromResume: true, roleImportance: 'Bonus', companyImportance: 'Important', proficiency: 30, roleTarget: 50, companyTarget: 70, status: 'Learning' },
  { name: 'Aptitude', category: 'Foundation', hasFromResume: false, roleImportance: 'Important', companyImportance: 'Important', proficiency: 55, roleTarget: 80, companyTarget: 80, status: 'Practicing' },
];

export type RoadmapStep = {
  week: number;
  title: string;
  skills: string[];
  status: 'done' | 'active' | 'locked';
  resources: number;
};

export const technicalRoadmap: RoadmapStep[] = [
  { week: 1, title: 'Advanced Data Structures', skills: ['Tries', 'Segment Trees', 'Fenwick Trees'], status: 'done', resources: 8 },
  { week: 2, title: 'Dynamic Programming Mastery', skills: ['1D DP', '2D DP', 'DP on Trees'], status: 'done', resources: 12 },
  { week: 3, title: 'Graph Algorithms Deep Dive', skills: ['BFS/DFS', 'Dijkstra', 'Bellman-Ford', 'Union-Find'], status: 'active', resources: 10 },
  { week: 4, title: 'System Design Fundamentals', skills: ['Load Balancing', 'Caching', 'Sharding', 'CAP Theorem'], status: 'locked', resources: 14 },
  { week: 5, title: 'Distributed Systems', skills: ['Consensus', 'Replication', 'Partitioning', 'MapReduce'], status: 'locked', resources: 11 },
  { week: 6, title: 'GCP Cloud Practitioner', skills: ['Compute Engine', 'Cloud Storage', 'BigQuery', 'Pub/Sub'], status: 'locked', resources: 9 },
  { week: 7, title: 'Mock Interviews & Refinement', skills: ['Whiteboarding', 'Behavioral', 'System Design Interview'], status: 'locked', resources: 6 },
];

export type FoundationModule = {
  id: string;
  title: string;
  category: string;
  progress: number;
  lessons: number;
  completed: number;
  icon: string;
};

export const foundationTrack: FoundationModule[] = [
  { id: 'dsa', title: 'Data Structures & Algorithms', category: 'Technical', progress: 68, lessons: 40, completed: 27, icon: 'Binary' },
  { id: 'dbms', title: 'Database Management Systems', category: 'Technical', progress: 45, lessons: 24, completed: 11, icon: 'Database' },
  { id: 'oop', title: 'Object-Oriented Programming', category: 'Technical', progress: 80, lessons: 18, completed: 14, icon: 'Boxes' },
  { id: 'os', title: 'Operating Systems', category: 'Technical', progress: 30, lessons: 22, completed: 7, icon: 'MonitorSmartphone' },
  { id: 'cn', title: 'Computer Networks', category: 'Technical', progress: 15, lessons: 20, completed: 3, icon: 'Network' },
  { id: 'apt', title: 'Aptitude', category: 'Aptitude', progress: 55, lessons: 30, completed: 17, icon: 'Calculator' },
  { id: 'reasoning', title: 'Logical Reasoning', category: 'Aptitude', progress: 40, lessons: 25, completed: 10, icon: 'Puzzle' },
  { id: 'verbal', title: 'Verbal Ability', category: 'Aptitude', progress: 60, lessons: 20, completed: 12, icon: 'BookOpen' },
  { id: 'communication', title: 'Communication Skills', category: 'Soft Skills', progress: 35, lessons: 15, completed: 5, icon: 'MessageCircle' },
  { id: 'hr', title: 'HR Interview Prep', category: 'Soft Skills', progress: 20, lessons: 12, completed: 2, icon: 'Users' },
];

export type VaultResource = {
  id: string;
  title: string;
  type: 'Notes' | 'Video' | 'Doc' | 'Course';
  source: string;
  duration: string;
  skill: string;
  bookmarked: boolean;
};

export const studyVault: VaultResource[] = [
  { id: 'v1', title: 'Graph Algorithms — Complete Visual Guide', type: 'Notes', source: 'PrepSphere Curated', duration: '45 min read', skill: 'Graph Algorithms', bookmarked: true },
  { id: 'v2', title: 'Dynamic Programming Patterns (Top 20)', type: 'Video', source: 'YouTube', duration: '2h 14m', skill: 'Dynamic Programming', bookmarked: true },
  { id: 'v3', title: 'System Design Primer — Interactive', type: 'Doc', source: 'GitHub', duration: '3h read', skill: 'System Design', bookmarked: false },
  { id: 'v4', title: 'Distributed Systems: Consensus & Raft', type: 'Video', source: 'MIT 6.824', duration: '1h 02m', skill: 'Distributed Systems', bookmarked: false },
  { id: 'v5', title: 'GCP Cloud Engineer — Core Services', type: 'Course', source: 'Google Cloud', duration: '8h', skill: 'GCP', bookmarked: true },
  { id: 'v6', title: 'Operating Systems: Three Easy Pieces', type: 'Doc', source: 'OSTEP', duration: '12h read', skill: 'Operating Systems', bookmarked: false },
  { id: 'v7', title: 'DBMS Normalization — 1NF to BCNF', type: 'Notes', source: 'PrepSphere Curated', duration: '30 min read', skill: 'DBMS', bookmarked: false },
  { id: 'v8', title: 'Computer Networks: TCP/IP Deep Dive', type: 'Video', source: 'YouTube', duration: '1h 45m', skill: 'Computer Networks', bookmarked: false },
  { id: 'v9', title: 'OOP Design Patterns Cheat Sheet', type: 'Notes', source: 'PrepSphere Curated', duration: '20 min read', skill: 'OOP', bookmarked: true },
  { id: 'v10', title: 'Aptitude: Time, Speed & Distance Mastery', type: 'Video', source: 'YouTube', duration: '55m', skill: 'Aptitude', bookmarked: false },
];

export type QuizQuestion = {
  id: string;
  skill: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    skill: 'Graph Algorithms',
    difficulty: 'Medium',
    question: 'What is the time complexity of Dijkstra\'s algorithm using a binary heap?',
    options: ['O(V)', 'O((V + E) log V)', 'O(V²)', 'O(E log V)'],
    correctIndex: 1,
    explanation: 'With a binary heap, Dijkstra runs in O((V + E) log V) — each extract-min is O(log V) and there are V of them, plus E decrease-key operations at O(log V) each.',
  },
  {
    id: 'q2',
    skill: 'Graph Algorithms',
    difficulty: 'Medium',
    question: 'Which data structure does Kruskal\'s algorithm use to detect cycles?',
    options: ['Priority Queue', 'Stack', 'Disjoint Set (Union-Find)', 'Hash Map'],
    correctIndex: 2,
    explanation: 'Kruskal\'s uses Union-Find to efficiently check whether adding an edge creates a cycle, with near-O(1) amortized operations via path compression.',
  },
  {
    id: 'q3',
    skill: 'Graph Algorithms',
    difficulty: 'Hard',
    question: 'In a weighted graph with negative edges (no negative cycles), which algorithm finds shortest paths from a single source?',
    options: ['Dijkstra', 'BFS', 'Bellman-Ford', 'DFS'],
    correctIndex: 2,
    explanation: 'Bellman-Ford handles negative edge weights by relaxing all edges V-1 times. Dijkstra fails with negative edges.',
  },
  {
    id: 'q4',
    skill: 'Graph Algorithms',
    difficulty: 'Easy',
    question: 'BFS uses which data structure internally?',
    options: ['Stack', 'Queue', 'Heap', 'Tree'],
    correctIndex: 1,
    explanation: 'BFS uses a FIFO queue to explore nodes level by level, ensuring shortest path in unweighted graphs.',
  },
  {
    id: 'q5',
    skill: 'Graph Algorithms',
    difficulty: 'Hard',
    question: 'What is the amortized time complexity of Union-Find with path compression and union by rank?',
    options: ['O(log V)', 'O(V)', 'O(α(V)) — inverse Ackermann', 'O(1)'],
    correctIndex: 2,
    explanation: 'With both optimizations, operations run in O(α(V)) where α is the inverse Ackermann function — effectively constant for any practical input.',
  },
];

export type InterviewTurn = {
  role: 'ai' | 'student';
  text: string;
  timestamp: string;
};

export const interviewTranscript: InterviewTurn[] = [
  { role: 'ai', text: 'Welcome Aarav. Let\'s start with a coding question. Given an array of integers, find the length of the longest subarray with a sum of zero. Can you walk me through your approach?', timestamp: '00:00' },
  { role: 'student', text: 'Sure. I\'d use a hash map to store prefix sums. As I iterate, if the current prefix sum was seen before, the subarray between those indices sums to zero. I track the max length.', timestamp: '00:45' },
  { role: 'ai', text: 'Good. What\'s the time and space complexity of your approach?', timestamp: '01:20' },
  { role: 'student', text: 'Time complexity is O(n) since we do a single pass. Space is O(n) for the hash map in the worst case.', timestamp: '01:35' },
  { role: 'ai', text: 'Correct. Now let\'s move to system design. How would you design a URL shortener like bit.ly that handles 100 million URLs?', timestamp: '02:10' },
];

export const interviewFeedback = {
  overall: 78,
  categories: [
    { name: 'Problem Solving', score: 85, note: 'Strong analytical approach. Correctly identified the hash map pattern immediately.' },
    { name: 'Coding Fluency', score: 80, note: 'Clean explanation of the algorithm. Could be more precise with edge cases.' },
    { name: 'System Design', score: 70, note: 'Good start on URL shortener. Need to address sharding strategy and read replicas.' },
    { name: 'Communication', score: 75, note: 'Clear and concise. Could elaborate more on trade-offs.' },
    { name: 'Confidence', score: 72, note: 'Slight hesitation on system design. More practice needed.' },
  ],
  strengths: ['Quick pattern recognition', 'Accurate complexity analysis', 'Clean verbal articulation'],
  improvements: ['Practice more system design problems', 'Discuss trade-offs explicitly', 'Handle edge cases proactively'],
};

export type ReadinessComponent = {
  label: string;
  weight: number;
  score: number;
  description: string;
};

export const readinessBreakdown: ReadinessComponent[] = [
  { label: 'Resume Score', weight: 20, score: 72, description: 'ATS-optimized resume quality' },
  { label: 'Verified Skills', weight: 30, score: 45, description: 'Skills verified via quiz ≥80%' },
  { label: 'Foundation Completion', weight: 20, score: 48, description: 'DSA, DBMS, OOP, OS, CN + Aptitude track' },
  { label: 'Interview Performance', weight: 20, score: 78, description: 'Average mock interview score' },
  { label: 'Consistency', weight: 10, score: 82, description: 'Daily streak and activity score' },
];

export const skillPassport: { skill: string; status: SkillStatus; date: string }[] = [
  { skill: 'Python', status: 'Verified', date: '2026-07-25' },
  { skill: 'SQL', status: 'Verified', date: '2026-07-20' },
  { skill: 'Data Structures', status: 'Practicing', date: '—' },
  { skill: 'Algorithms', status: 'Learning', date: '—' },
  { skill: 'System Design', status: 'Discovered', date: '—' },
  { skill: 'React', status: 'Practicing', date: '—' },
  { skill: 'OOP', status: 'Practicing', date: '—' },
  { skill: 'DBMS', status: 'Learning', date: '—' },
  { skill: 'Operating Systems', status: 'Learning', date: '—' },
  { skill: 'Computer Networks', status: 'Discovered', date: '—' },
  { skill: 'Docker', status: 'Learning', date: '—' },
  { skill: 'Aptitude', status: 'Practicing', date: '—' },
];

export const weeklyActivity = [
  { day: 'Mon', hours: 3.5, quizzes: 2 },
  { day: 'Tue', hours: 4.2, quizzes: 3 },
  { day: 'Wed', hours: 2.8, quizzes: 1 },
  { day: 'Thu', hours: 5.1, quizzes: 4 },
  { day: 'Fri', hours: 3.9, quizzes: 2 },
  { day: 'Sat', hours: 6.2, quizzes: 5 },
  { day: 'Sun', hours: 4.5, quizzes: 3 },
];

export const departmentStats = {
  totalStudents: 248,
  activeThisWeek: 186,
  averageReadiness: 61,
  placementReady: 34,
  topSkills: [
    { skill: 'Python', verified: 198 },
    { skill: 'SQL', verified: 175 },
    { skill: 'DSA', verified: 156 },
    { skill: 'OOP', verified: 142 },
    { skill: 'System Design', verified: 67 },
  ],
  companyDistribution: [
    { company: 'Google', count: 42 },
    { company: 'Microsoft', count: 38 },
    { company: 'Amazon', count: 35 },
    { company: 'Meta', count: 28 },
    { company: 'Others', count: 105 },
  ],
  weeklyTrend: [55, 58, 60, 59, 62, 61, 64],
};

export const adminSkillTaxonomy = [
  { skill: 'System Design', category: 'Architecture', companies: 12, questions: 45, status: 'active' },
  { skill: 'Dynamic Programming', category: 'Algorithms', companies: 18, questions: 120, status: 'active' },
  { skill: 'Kubernetes', category: 'DevOps', companies: 6, questions: 22, status: 'draft' },
  { skill: 'GraphQL', category: 'API', companies: 4, questions: 0, status: 'draft' },
];
