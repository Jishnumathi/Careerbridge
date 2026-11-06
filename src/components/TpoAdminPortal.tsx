import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  Job,
  Application,
  PlacementNotice,
  User
} from '../types';
import {
  TrendingUp,
  Users,
  Award,
  Building,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Download,
  Search,
  Filter,
  Plus,
  Trash2,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Eye,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Percent,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { adminApi } from '../api/client';
import { ResumeViewerModal } from './ResumeViewerModal';

interface TpoAdminPortalProps {
  currentUser: User;
  students: StudentProfile[];
  jobs: Job[];
  applications: Application[];
  notices: PlacementNotice[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onVerifyStudent: (studentId: string, verified: boolean) => void;
  onAddNotice: (notice: PlacementNotice) => void;
  onDeleteNotice: (noticeId: string) => void;
}

// Custom Tooltip component for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color: string;
    unit?: string;
    dataKey?: string;
  }>;
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 font-sans min-w-[190px]">
        {label && <p className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 mb-1">{label}</p>}
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="truncate">{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-white shrink-0">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {entry.unit ? ` ${entry.unit}` : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const TpoAdminPortal: React.FC<TpoAdminPortalProps> = ({
  currentUser,
  students,
  jobs,
  applications,
  notices,
  activeTab,
  setActiveTab,
  onVerifyStudent,
  onAddNotice,
  onDeleteNotice,
}) => {
  const [studentSearch, setStudentSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [viewingResumeStudent, setViewingResumeStudent] = useState<StudentProfile | null>(null);

  // Recharts interactive controls state
  const [analyticsSubView, setAnalyticsSubView] = useState<'all' | 'trends' | 'branches' | 'salaries' | 'funnel'>('all');
  const [seasonPhase, setSeasonPhase] = useState<'full' | 'phase1' | 'phase2'>('full');
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);
  const [backendAnalytics, setBackendAnalytics] = useState<any>(null);

  // New Notice state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<PlacementNotice['category']>('Drive Announcement');
  const [noticePriority, setNoticePriority] = useState<'High' | 'Normal'>('Normal');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeTargetBranch, setNoticeTargetBranch] = useState('All Branches');

  // Fetch backend dashboard analytics
  const fetchDashboardData = async () => {
    try {
      setIsRefreshingAnalytics(true);
      const res = await adminApi.getDashboard();
      if (res.success && res.analytics) {
        setBackendAnalytics(res.analytics);
      }
    } catch (err) {
      console.warn('Dashboard live sync note:', err);
    } finally {
      setIsRefreshingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute university-wide placement statistics
  const totalStudentsCount = 580; // Total eligible batch 2026 students
  const placedOffersCount = applications.filter((a) => a.currentStage === 'Offered').length;
  const totalPlacedEstimated = 442 + placedOffersCount;
  const placementRatePct = ((totalPlacedEstimated / totalStudentsCount) * 100).toFixed(1);

  // Calculate highest & average packages from posted jobs & offers
  const highestPackageLpa = Math.max(...jobs.map((j) => j.ctcLpa), 32.0);
  const averagePackageLpa = (
    jobs.reduce((acc, j) => acc + j.ctcLpa, 0) / (jobs.length || 1)
  ).toFixed(2);

  const dreamOffersCount = jobs.filter((j) => j.category === 'Dream').length;
  const superDreamOffersCount = jobs.filter((j) => j.category === 'Super Dream').length;

  // Baseline Branch statistics
  const baseBranchBreakdown = [
    { branch: 'Computer Science', code: 'CSE', total: 180, placed: 165, unplaced: 15, avgLpa: 17.2, highestLpa: 32.0, rate: 91.6 },
    { branch: 'Information Technology', code: 'IT', total: 120, placed: 108, unplaced: 12, avgLpa: 15.4, highestLpa: 28.5, rate: 90.0 },
    { branch: 'Electronics & Comm', code: 'ECE', total: 140, placed: 112, unplaced: 28, avgLpa: 12.1, highestLpa: 22.0, rate: 80.0 },
    { branch: 'Electrical & Electronics', code: 'EEE', total: 60, placed: 44, unplaced: 16, avgLpa: 9.8, highestLpa: 16.0, rate: 73.3 },
    { branch: 'Mechanical Engg', code: 'MECH', total: 80, placed: 58, unplaced: 22, avgLpa: 8.5, highestLpa: 14.5, rate: 72.5 },
  ];

  const branchBreakdown = backendAnalytics?.branchStats || baseBranchBreakdown;

  // Monthly Application Trends across placement cycle
  const baseApplicationTrends = [
    { month: 'Aug 2025', applications: 260, screenings: 220, interviews: 95, offers: 36, phase: 'phase1' },
    { month: 'Sep 2025', applications: 540, screenings: 440, interviews: 210, offers: 92, phase: 'phase1' },
    { month: 'Oct 2025', applications: 780, screenings: 630, interviews: 340, offers: 154, phase: 'phase1' },
    { month: 'Nov 2025', applications: 610, screenings: 490, interviews: 275, offers: 118, phase: 'phase1' },
    { month: 'Dec 2025', applications: 340, screenings: 280, interviews: 150, offers: 64, phase: 'phase2' },
    { month: 'Jan 2026', applications: 450, screenings: 370, interviews: 195, offers: 52, phase: 'phase2' },
    { month: 'Feb 2026', applications: 320, screenings: 260, interviews: 130, offers: 38, phase: 'phase2' },
  ];

  const allApplicationTrends = backendAnalytics?.applicationTrends || baseApplicationTrends;
  const filteredApplicationTrends = seasonPhase === 'full'
    ? allApplicationTrends
    : allApplicationTrends.filter((item: any) => {
        if (seasonPhase === 'phase1') {
          return ['Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025'].includes(item.month);
        }
        return ['Dec 2025', 'Jan 2026', 'Feb 2026'].includes(item.month);
      });

  // Salary tier breakdown
  const salaryTierData = backendAnalytics?.salaryTierDistribution || [
    { name: 'Super Dream (> 20 LPA)', count: 48, percentage: 10.8, color: '#e11d48' },
    { name: 'Dream (10 - 20 LPA)', count: 184, percentage: 41.6, color: '#4f46e5' },
    { name: 'Core Prime (6 - 10 LPA)', count: 152, percentage: 34.4, color: '#059669' },
    { name: 'Standard (3.5 - 6 LPA)', count: 58, percentage: 13.2, color: '#d97706' },
  ];

  // Recruitment funnel stage progression
  const pipelineFunnelData = backendAnalytics?.pipelineFunnel || [
    { stage: '1. Applications', count: 3300, fill: '#6366f1' },
    { stage: '2. Screened', count: 2690, fill: '#3b82f6' },
    { stage: '3. Assessment', count: 1940, fill: '#0ea5e9' },
    { stage: '4. Technical', count: 1080, fill: '#14b8a6' },
    { stage: '5. HR Round', count: 590, fill: '#10b981' },
    { stage: '6. Final Offers', count: totalPlacedEstimated, fill: '#059669' },
  ];

  // Filter students
  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      stu.rollNumber.toLowerCase().includes(studentSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (branchFilter !== 'All' && stu.branch !== branchFilter) return false;
    if (verificationFilter === 'verified' && !stu.isVerifiedByTpo) return false;
    if (verificationFilter === 'pending' && stu.isVerifiedByTpo) return false;
    return true;
  });

  // Handle export placement report (CSV)
  const handleExportPlacementReport = () => {
    const headers = ['Roll Number', 'Student Name', 'Branch', 'CGPA', 'Active Backlogs', 'TPO Verified', 'Placement Status', 'Placed Company', 'Package (LPA)'];
    const rows = students.map((s) => [
      s.rollNumber,
      `"${s.name}"`,
      `"${s.branch}"`,
      s.cgpa.toFixed(2),
      s.activeBacklogs,
      s.isVerifiedByTpo ? 'Yes' : 'No',
      s.placementStatus,
      `"${s.placedDetails?.company || 'N/A'}"`,
      s.placedDetails?.ctcLpa || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CareerBridge_Official_Placement_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle publish notice
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      alert('Please fill out notice title and description.');
      return;
    }

    const newNotice: PlacementNotice = {
      id: `not_${Date.now()}`,
      title: noticeTitle.trim(),
      category: noticeCategory,
      priority: noticePriority,
      publishedDate: new Date().toISOString().split('T')[0],
      author: 'Prof. Dr. K. Ramanathan (TPO Dean)',
      content: noticeContent.trim(),
      targetBranches: [noticeTargetBranch],
    };

    onAddNotice(newNotice);
    setNoticeTitle('');
    setNoticeContent('');
    alert('Notice published and broadcasted to students!');
  };

  return (
    <div className="space-y-6">
      {/* TPO Dean Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-700 text-white font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
              TPO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Training & Placement Office (TPO)</h1>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  Administrative Console
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placement Officer: <strong>{currentUser.name}</strong> · Dean of Corporate Relations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPlacementReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export Placement Summary (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: PLACEMENT ANALYTICS DASHBOARD WITH RECHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-slate-500 block text-[11px] font-medium">Batch 2026 Size</span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {totalStudentsCount}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Graduating Seniors</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-slate-500 block text-[11px] font-medium">Placement Rate</span>
              <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">
                {placementRatePct}%
              </span>
              <span className="text-[11px] text-emerald-700 block mt-0.5 font-medium">
                {totalPlacedEstimated} students placed
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-slate-500 block text-[11px] font-medium">Highest Package</span>
              <span className="text-2xl font-extrabold text-indigo-700 font-mono tabular-nums">
                {highestPackageLpa.toFixed(1)} LPA
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Google Cloud SWE</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-slate-500 block text-[11px] font-medium">Average Package</span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {averagePackageLpa} LPA
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Campus Mean CTC</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-slate-500 block text-[11px] font-medium">Active Drives</span>
              <span className="text-2xl font-extrabold text-purple-700 font-mono tabular-nums">
                {jobs.length}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Corporate Recruiters</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-slate-500 block text-[11px] font-medium">Super Dream Offers</span>
              <span className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums">
                {superDreamOffersCount}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">&gt; 20 Lakhs / Annum</span>
            </div>
          </div>

          {/* Interactive Recharts Analytics Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Chart Views:
              </span>
              {[
                { id: 'all', label: 'All Visualizations' },
                { id: 'trends', label: 'Application Trends' },
                { id: 'branches', label: 'Branch Rates' },
                { id: 'salaries', label: 'Salary Offers' },
                { id: 'funnel', label: 'Pipeline Funnel' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAnalyticsSubView(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    analyticsSubView === tab.id
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
                <span className="text-slate-400 px-1 text-[11px] font-medium">Cycle:</span>
                <select
                  value={seasonPhase}
                  onChange={(e) => setSeasonPhase(e.target.value as any)}
                  className="bg-transparent text-slate-800 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="full">Full Season 2025-26</option>
                  <option value="phase1">Phase 1 (Tech & FinTech)</option>
                  <option value="phase2">Phase 2 (Core & Startups)</option>
                </select>
              </div>

              <button
                onClick={fetchDashboardData}
                disabled={isRefreshingAnalytics}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                title="Refresh Analytics from Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAnalytics ? 'animate-spin text-purple-700' : ''}`} />
                <span className="hidden sm:inline">Sync Data</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: APPLICATION TRENDS & PIPELINE FUNNEL */}
          {(analyticsSubView === 'all' || analyticsSubView === 'trends') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 1: Application & Offer Velocity Trends */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Job Application & Offer Trajectory</h3>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        Volume Velocity
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Monthly progression of student applications submitted versus screening clearances and final job offers.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Batch 2026</span>
                </div>

                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart
                      data={filteredApplicationTrends}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorScreenings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="applications"
                        name="Applications Received"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorApplications)"
                        activeDot={{ r: 6, fill: '#4f46e5' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="screenings"
                        name="Shortlisted Candidates"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorScreenings)"
                      />
                      <Area
                        type="monotone"
                        dataKey="offers"
                        name="Offers Extended"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorOffers)"
                        activeDot={{ r: 6, fill: '#10b981' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">Peak Application Window</span>
                    <strong className="text-xs text-slate-900 font-mono">October 2025 (780 Apps)</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">Average Screening Rate</span>
                    <strong className="text-xs text-sky-700 font-mono">81.4% Clearance</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">Offer Conversion Rate</span>
                    <strong className="text-xs text-emerald-700 font-mono">13.4% of Total Apps</strong>
                  </div>
                </div>
              </div>

              {/* Chart 5: Placement Recruitment Pipeline Funnel */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Recruitment Funnel</h3>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                      Stage Drop-off
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Conversion through rounds from initial application to final offer.
                  </p>
                </div>

                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      layout="vertical"
                      data={pipelineFunnelData}
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="stage"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                        width={90}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar
                        dataKey="count"
                        name="Candidates"
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                      >
                        {pipelineFunnelData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                  <strong>Funnel Insight:</strong> The Technical Interview stage is the primary filter, yielding a 44.3% selectivity rate before HR clearance.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PLACEMENT RATES BY BRANCH */}
          {(analyticsSubView === 'all' || analyticsSubView === 'branches') && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Placement Rates & Placed Headcount by Department</h3>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                      Institutional Audit 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Comparative analysis of eligible students, students with confirmed offers, and overall departmental placement percentage.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Overall Placement Rate</span>
                    <span className="text-lg font-extrabold text-emerald-600 font-mono">{placementRatePct}%</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-84">
                <ResponsiveContainer width="100%" height={340}>
                  <ComposedChart
                    data={branchBreakdown}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="branch"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      label={{ value: 'Students Count', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[50, 100]}
                      stroke="#4f46e5"
                      fontSize={11}
                      unit="%"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      label={{ value: 'Placement Rate (%)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#4f46e5' }}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: '11px', paddingBottom: '14px' }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="placed"
                      name="Placed Students"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={26}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="unplaced"
                      name="In-Process / Unplaced"
                      fill="#e2e8f0"
                      radius={[4, 4, 0, 0]}
                      barSize={26}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="rate"
                      name="Placement Rate (%)"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 7, fill: '#4f46e5' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Department breakdown summary chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
                {branchBreakdown.map((b: any) => (
                  <div key={b.branch} className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="truncate">{b.branch}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {b.placed} <span className="text-xs font-normal text-slate-400">/ {b.total}</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {b.rate}%
                      </span>
                    </div>
                    <div className="text-[11px] text-indigo-700 font-medium">
                      Avg CTC: <strong className="font-mono">{b.avgLpa} LPA</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: SALARY OFFERS & PACKAGE DISTRIBUTION */}
          {(analyticsSubView === 'all' || analyticsSubView === 'salaries') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 3: Average & Highest Salary Offers by Branch */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Salary Offers & CTC Packages by Branch</h3>
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        LPA CTC (Lakhs / Annum)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mean and maximum annual remuneration secured by graduating students across departments.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    Mean: {averagePackageLpa} LPA
                  </span>
                </div>

                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={branchBreakdown}
                      margin={{ top: 15, right: 25, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="code"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        unit=" LPA"
                        domain={[0, 35]}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                      />
                      <ReferenceLine
                        y={Number(averagePackageLpa)}
                        stroke="#f43f5e"
                        strokeDasharray="4 4"
                        label={{
                          value: `Campus Mean: ${averagePackageLpa} LPA`,
                          fill: '#e11d48',
                          fontSize: 10,
                          position: 'top',
                        }}
                      />
                      <Bar
                        dataKey="avgLpa"
                        name="Average Package (LPA)"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                        barSize={22}
                      />
                      <Bar
                        dataKey="highestLpa"
                        name="Highest Package (LPA)"
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                        barSize={22}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Top Branch Average:</span>
                    <strong className="text-indigo-700 font-mono font-bold">CSE (17.2 LPA)</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Institute Record CTC:</span>
                    <strong className="text-emerald-700 font-mono font-bold">Google (32.0 LPA)</strong>
                  </div>
                </div>
              </div>

              {/* Chart 4: Salary Tier Breakdown (Donut PieChart) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">CTC Tier Distribution</h3>
                    <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      Offer Brackets
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Proportion of placement offers grouped into standardized compensation categories.
                  </p>
                </div>

                <div className="w-full h-56 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Tooltip content={<CustomChartTooltip />} />
                      <Pie
                        data={salaryTierData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {salaryTierData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Donut Center Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-extrabold text-slate-900 font-mono">{totalPlacedEstimated}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Offers</span>
                  </div>
                </div>

                {/* Salary Tier List */}
                <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                  {salaryTierData.map((tier: any) => (
                    <div key={tier.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                        <span className="text-slate-700 font-medium">{tier.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900">{tier.count}</span>
                        <span className="text-slate-400 text-[11px]">({tier.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Marquee Companies & Package Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Marquee Corporate Recruiters</h3>
              <div className="space-y-2 text-xs">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{job.companyName}</span>
                      <span className="text-slate-500 ml-2">({job.roleTitle})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">{job.ctcLpa} LPA</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                        {job.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Placement Policy Guidelines (NBA Accreditation)</h3>
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  1. <strong>Single Offer Policy:</strong> Students securing a Dream offer (&gt;10 LPA) are eligible only for Super Dream (&gt;20 LPA) opportunities.
                </p>
                <p>
                  2. <strong>Academic Verification Mandate:</strong> All candidate CGPAs and backlog records must be verified by TPO prior to company roster finalization.
                </p>
                <p>
                  3. <strong>Attendance Policy:</strong> Shortlisted candidates must report 15 minutes before the scheduled drive start time with printed credentials and college ID cards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDENT REGISTRY & ACADEMIC VERIFICATION */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student or roll..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              {/* Branch Filter */}
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="All">All Branches</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
                <option value="Mechanical Engg">Mechanical Engg</option>
              </select>

              {/* Verification status */}
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              >
                <option value="all">All Verification Statuses</option>
                <option value="verified">Verified Only</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Showing <strong className="font-mono text-slate-900">{filteredStudents.length}</strong> students
            </div>
          </div>

          {/* Student Verification Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 text-center">CGPA</th>
                    <th className="py-3 px-4 text-center">Backlogs</th>
                    <th className="py-3 px-4">Placement Status</th>
                    <th className="py-3 px-4">Resume</th>
                    <th className="py-3 px-4 text-right">TPO Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{stu.rollNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{stu.name}</div>
                        <div className="text-[11px] text-slate-400">{stu.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-800">{stu.branch}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {stu.cgpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {stu.activeBacklogs === 0 ? (
                          <span className="text-emerald-700">0</span>
                        ) : (
                          <span className="text-amber-700 font-bold">{stu.activeBacklogs}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {stu.placementStatus === 'Placed' && stu.placedDetails ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            Placed · {stu.placedDetails.company} ({stu.placedDetails.ctcLpa} LPA)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">Unplaced</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setViewingResumeStudent(stu)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Preview PDF</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {stu.isVerifiedByTpo ? (
                          <button
                            onClick={() => onVerifyStudent(stu.id, false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-rose-50 hover:text-rose-700 rounded-md border border-emerald-200 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified
                          </button>
                        ) : (
                          <button
                            onClick={() => onVerifyStudent(stu.id, true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-xs"
                          >
                            Verify Records
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DRIVE APPROVALS & SCHEDULE */}
      {activeTab === 'drives' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Campus Recruitment Drive Schedule & Approvals</h2>
            <p className="text-xs text-slate-500">
              Coordinate placement lab infrastructure and approve incoming company campus drive slots.
            </p>
          </div>

          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{job.companyName}</h3>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono font-bold text-slate-900">{job.ctcLpa} LPA</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {job.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{job.roleTitle}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>
                      Drive Date: <strong className="text-slate-800 font-mono">{job.driveDate}</strong>
                    </span>
                    <span>·</span>
                    <span>Deadline: <strong className="text-rose-700 font-mono">{job.applicationDeadline}</strong></span>
                    <span>·</span>
                    <span>Eligible: {job.eligibleBranches.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved by TPO
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: ANNOUNCEMENTS & NOTICE BOARD MANAGER */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post New Notice Form */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Broadcast Campus Notice</h3>
            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  placeholder="e.g. Google Coding Round Venue Instructions"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Drive Announcement">Drive Announcement</option>
                  <option value="Shortlist Result">Shortlist Result</option>
                  <option value="TPO Guideline">TPO Guideline</option>
                  <option value="Preparation">Preparation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={noticePriority}
                  onChange={(e) => setNoticePriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Department</label>
                <select
                  value={noticeTargetBranch}
                  onChange={(e) => setNoticeTargetBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="All Branches">All Branches</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Comm">Electronics & Comm</option>
                  <option value="Mechanical Engg">Mechanical Engg</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Circular Content</label>
                <textarea
                  rows={4}
                  placeholder="Write official notice text..."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-xs"
              >
                Publish Notice
              </button>
            </form>
          </div>

          {/* Published Notices List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Active Campus Notices ({notices.length})</h3>
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        n.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {n.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  </div>
                  <button
                    onClick={() => onDeleteNotice(n.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{n.content}</p>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>Author: {n.author}</span>
                  <span className="font-mono">{n.publishedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: ACCREDITATION PLACEMENT REPORT GENERATOR */}
      {activeTab === 'reports' && (
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Official Campus Placement Audit Report 2025-2026
              </h2>
              <p className="text-xs text-slate-500">
                Accreditation Document for National Board of Accreditation (NBA) & NAAC Criterion V.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Report
              </button>
              <button
                onClick={handleExportPlacementReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Audit Metrics Table */}
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              1. Executive Placement Summary
            </h3>
            <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-700 w-1/2">
                    Total Eligible Graduating Students (Batch 2026)
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{totalStudentsCount}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">Total Unique Students Placed</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">
                    {totalPlacedEstimated} ({placementRatePct}%)
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-700">Highest Salary Package Secured</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">
                    {highestPackageLpa.toFixed(1)} LPA (Google Cloud Systems)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">Average Salary Package (Campus Mean)</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{averagePackageLpa} LPA</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-700">
                    Total Recruiting Organizations Hosted
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">45 Companies</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Certification Signature Stamp */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              <div className="font-bold text-slate-900">Prof. Dr. K. Ramanathan, Ph.D.</div>
              <div>Dean of Corporate Relations & Placement Officer</div>
              <div>Apex Institute of Technology</div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Digitally Certified by TPO Office
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Timestamp: {new Date().toISOString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-Browser PDF Resume Viewer Modal */}
      {viewingResumeStudent && (
        <ResumeViewerModal
          student={viewingResumeStudent}
          isOpen={true}
          onClose={() => setViewingResumeStudent(null)}
          viewerRoleTitle="TPO Academic Verification"
        />
      )}
    </div>
  );
};
