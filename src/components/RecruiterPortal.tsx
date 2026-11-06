import React, { useState } from 'react';
import { User, Job, Application, StudentProfile, ApplicationStage } from '../types';
import {
  Building2,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Mail,
  Award,
  Video,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Send
} from 'lucide-react';
import { ResumeViewerModal } from './ResumeViewerModal';

interface RecruiterPortalProps {
  currentUser: User;
  jobs: Job[];
  applications: Application[];
  students: StudentProfile[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onPostJob: (newJob: Job) => void;
  onUpdateApplicationStage: (
    applicationId: string,
    newStage: ApplicationStage,
    meta?: {
      interviewSchedule?: Application['interviewSchedule'];
      offerLetter?: Application['offerLetter'];
      recruiterNotes?: string;
    }
  ) => void;
}

export const RecruiterPortal: React.FC<RecruiterPortalProps> = ({
  currentUser,
  jobs,
  applications,
  students,
  activeTab,
  setActiveTab,
  onPostJob,
  onUpdateApplicationStage,
}) => {
  // Current recruiter company jobs
  const companyJobs = jobs.filter(
    (j) => j.companyName.toLowerCase() === (currentUser.organization || 'Google').toLowerCase() || j.recruiterId === currentUser.id
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(
    companyJobs.length > 0 ? companyJobs[0].id : jobs[0]?.id || ''
  );
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewingStudentResume, setViewingStudentResume] = useState<StudentProfile | null>(null);

  // Modals for interview schedule & offer letter
  const [schedulingApp, setSchedulingApp] = useState<Application | null>(null);
  const [scheduleDate, setScheduleDate] = useState('2026-11-20');
  const [scheduleTime, setScheduleTime] = useState('11:00 AM IST');
  const [scheduleMode, setScheduleMode] = useState<'In-Person (Campus Lab 4)' | 'Virtual (Google Meet)' | 'Auditorium'>(
    'Virtual (Google Meet)'
  );
  const [scheduleVenueOrLink, setScheduleVenueOrLink] = useState('meet.google.com/rec-eval-campus');
  const [scheduleInstructions, setScheduleInstructions] = useState('Please ensure strong internet and laptop webcam.');

  // Offer Letter modal
  const [offeringApp, setOfferingApp] = useState<Application | null>(null);
  const [offerCtc, setOfferCtc] = useState(28.5);
  const [offerBase, setOfferBase] = useState(20.0);
  const [offerJoiningDate, setOfferJoiningDate] = useState('2026-07-15');
  const [offerValidTill, setOfferValidTill] = useState('2026-11-30');

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobType, setNewJobType] = useState<'Full-time' | 'Internship + PPO' | 'Summer Internship'>('Full-time');
  const [newJobLocation, setNewJobLocation] = useState('Bengaluru / Hyderabad');
  const [newJobWorkMode, setNewJobWorkMode] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid');
  const [newJobCtc, setNewJobCtc] = useState(24.0);
  const [newJobStipend, setNewJobStipend] = useState(80000);
  const [newJobMinCgpa, setNewJobMinCgpa] = useState(7.5);
  const [newJobMaxBacklogs, setNewJobMaxBacklogs] = useState(0);
  const [newJobDeadline, setNewJobDeadline] = useState('2026-11-30');
  const [newJobDriveDate, setNewJobDriveDate] = useState('2026-12-05');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobSelectedBranches, setNewJobSelectedBranches] = useState<string[]>([
    'Computer Science',
    'Information Technology',
    'Electronics & Comm',
  ]);

  // Selected job applications
  const currentJobApplications = applications.filter(
    (app) => !selectedJobId || app.jobId === selectedJobId
  );

  const filteredApplications = currentJobApplications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      app.studentRollNumber.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      app.studentBranch.toLowerCase().includes(candidateSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (stageFilter !== 'all' && app.currentStage !== stageFilter) return false;

    return true;
  });

  // Calculate metrics
  const totalApplicants = currentJobApplications.length;
  const inInterviewCount = currentJobApplications.filter(
    (a) => a.currentStage === 'Technical Interview' || a.currentStage === 'HR Round'
  ).length;
  const offeredCount = currentJobApplications.filter((a) => a.currentStage === 'Offered').length;

  // Handle export to CSV
  const handleExportCSV = () => {
    const headers = ['Roll Number', 'Student Name', 'Branch', 'CGPA', 'Backlogs', 'Applied Date', 'Current Stage', 'Resume URL'];
    const rows = filteredApplications.map((app) => [
      app.studentRollNumber,
      `"${app.studentName}"`,
      `"${app.studentBranch}"`,
      app.studentCgpa,
      app.studentBacklogs,
      app.appliedDate,
      app.currentStage,
      app.resumeUrl,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CareerBridge_Candidates_${selectedJobId || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit new job post
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) {
      alert('Please enter a role title');
      return;
    }

    const category = newJobCtc >= 20 ? 'Super Dream' : newJobCtc >= 10 ? 'Dream' : 'Standard';

    const createdJob: Job = {
      id: `job_${Date.now()}`,
      recruiterId: currentUser.id,
      companyName: currentUser.organization || 'Google',
      companyLogo: '',
      companyWebsite: 'https://careers.google.com',
      roleTitle: newJobTitle,
      jobType: newJobType,
      location: newJobLocation,
      workMode: newJobWorkMode,
      ctcLpa: newJobCtc,
      stipendPerMonth: newJobStipend,
      category,
      description: newJobDescription || 'Join our campus hire engineering program to build next-generation platforms.',
      responsibilities: [
        'Design, build, and optimize scalable software services.',
        'Collaborate with product and reliability engineering teams.',
      ],
      requirements: [
        'Strong fundamentals in algorithms, data structures, and computer architecture.',
        'Fluency in one modern programming language (Java, C++, Python, or TypeScript).',
      ],
      minCgpa: newJobMinCgpa,
      eligibleBranches: newJobSelectedBranches,
      maxActiveBacklogs: newJobMaxBacklogs,
      maxHistoryBacklogs: newJobMaxBacklogs,
      minTenthPercentage: 70,
      minTwelfthPercentage: 70,
      applicationDeadline: newJobDeadline,
      driveDate: newJobDriveDate,
      selectionRounds: ['Online Assessment', 'Technical Interview 1', 'Technical Interview 2', 'HR Round'],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onPostJob(createdJob);
    alert(`Campus drive for "${newJobTitle}" posted successfully!`);
    setSelectedJobId(createdJob.id);
    setActiveTab('applicants');
  };

  return (
    <div className="space-y-6">
      {/* Recruiter Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
              {(currentUser.organization || 'Google').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {currentUser.organization || 'Corporate Recruiter'} Portal
                </h1>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified Recruiter
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Recruiter: <strong>{currentUser.name}</strong> · {currentUser.email}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Active Drives</span>
              <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {companyJobs.length || jobs.length}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Total Applicants</span>
              <span className="text-base font-bold text-indigo-700 font-mono tabular-nums">
                {totalApplicants}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Offers Issued</span>
              <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
                {offeredCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: CANDIDATE PIPELINE & EVALUATION */}
      {activeTab === 'applicants' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Job Selector */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Recruitment Drive:</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-indigo-500 max-w-sm"
                >
                  <option value="">All Drives ({jobs.length})</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.companyName} - {j.roleTitle} ({j.ctcLpa} LPA)
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Candidates */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name or roll..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Export Shortlist Button */}
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-xs whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Export Shortlist (CSV)
              </button>
            </div>

            {/* Stage filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Stage:
              </span>
              {[
                { id: 'all', label: `All (${currentJobApplications.length})` },
                { id: 'Applied', label: 'Applied' },
                { id: 'Resume Screened', label: 'Screened' },
                { id: 'Online Assessment', label: 'Online Assessment' },
                { id: 'Technical Interview', label: 'Tech Interview' },
                { id: 'HR Round', label: 'HR Round' },
                { id: 'Offered', label: 'Offered' },
                { id: 'Rejected', label: 'Rejected' },
              ].map((stg) => (
                <button
                  key={stg.id}
                  onClick={() => setStageFilter(stg.id)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    stageFilter === stg.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {stg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Student & Roll No.</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 text-center">CGPA</th>
                    <th className="py-3 px-4 text-center">Backlogs</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4">Resume</th>
                    <th className="py-3 px-4 text-right">Recruitment Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredApplications.map((app) => {
                    const studentObj = students.find((s) => s.id === app.studentId);

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Student Name */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{app.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{app.studentRollNumber}</div>
                        </td>

                        {/* Branch */}
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{app.studentBranch}</span>
                          <div className="text-[11px] text-slate-400">Batch 2026</div>
                        </td>

                        {/* CGPA */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-slate-900 font-mono tabular-nums bg-slate-100 px-2 py-0.5 rounded">
                            {app.studentCgpa.toFixed(2)}
                          </span>
                        </td>

                        {/* Backlogs */}
                        <td className="py-3 px-4 text-center font-mono">
                          {app.studentBacklogs === 0 ? (
                            <span className="text-emerald-700 font-semibold">0</span>
                          ) : (
                            <span className="text-amber-700 font-bold">{app.studentBacklogs}</span>
                          )}
                        </td>

                        {/* Current Stage */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              app.currentStage === 'Offered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.currentStage === 'Rejected'
                                ? 'bg-rose-50 text-rose-700'
                                : app.currentStage.includes('Interview')
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {app.currentStage}
                          </span>
                        </td>

                        {/* Resume preview */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              if (studentObj) {
                                setViewingStudentResume(studentObj);
                              } else {
                                const fallbackStudent: StudentProfile = {
                                  id: app.studentId,
                                  userId: `user_${app.studentId}`,
                                  rollNumber: app.studentRollNumber,
                                  name: app.studentName,
                                  email: `${app.studentRollNumber.toLowerCase()}@campus.edu`,
                                  phone: '+91 98765 43210',
                                  branch: app.studentBranch,
                                  batch: '2026',
                                  cgpa: app.studentCgpa,
                                  activeBacklogs: app.studentBacklogs,
                                  historyBacklogs: app.studentBacklogs,
                                  tenthPercentage: 88,
                                  twelfthPercentage: 85,
                                  skills: ['React.js', 'Node.js', 'TypeScript', 'System Design', 'Algorithms'],
                                  certifications: [],
                                  resumeUrl: app.resumeUrl,
                                  resumeFileName: app.resumeFileName,
                                  resumeUpdatedAt: app.appliedDate,
                                  isVerifiedByTpo: true,
                                  placementStatus: app.currentStage === 'Offered' ? 'Placed' : 'Unplaced',
                                };
                                setViewingStudentResume(fallbackStudent);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Preview PDF</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Schedule Interview */}
                            {app.currentStage !== 'Offered' && app.currentStage !== 'Rejected' && (
                              <button
                                onClick={() => setSchedulingApp(app)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors whitespace-nowrap"
                              >
                                Schedule Round
                              </button>
                            )}

                            {/* Issue Offer */}
                            {app.currentStage !== 'Offered' && app.currentStage !== 'Rejected' && (
                              <button
                                onClick={() => {
                                  const job = jobs.find((j) => j.id === app.jobId);
                                  setOfferCtc(job?.ctcLpa || 24.0);
                                  setOfferBase(Math.round((job?.ctcLpa || 24.0) * 0.7));
                                  setOfferingApp(app);
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors whitespace-nowrap"
                              >
                                Extend Offer
                              </button>
                            )}

                            {/* Reject */}
                            {app.currentStage !== 'Rejected' && app.currentStage !== 'Offered' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Confirm reject application for ${app.studentName}?`)) {
                                    onUpdateApplicationStage(app.id, 'Rejected', {
                                      recruiterNotes: 'Application did not meet competitive bar.',
                                    });
                                  }
                                }}
                                className="px-2 py-1 text-[11px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredApplications.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No applicants found matching current filter parameters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MANAGE CAMPUS DRIVES */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manage Campus Recruitment Drives</h2>
              <p className="text-xs text-slate-500">
                Active job requisitions and campus drives registered for {currentUser.organization || 'Google'}.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('post_job')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Post New Campus Drive
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job) => {
              const jobApps = applications.filter((a) => a.jobId === job.id);
              const jobOffers = jobApps.filter((a) => a.currentStage === 'Offered');

              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">{job.companyName}</span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {job.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{job.roleTitle}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location} ({job.workMode})</span>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
                      {job.ctcLpa.toFixed(1)} LPA
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center text-xs border border-slate-100">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Applicants</span>
                      <strong className="text-slate-900 font-mono">{jobApps.length}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Offers</span>
                      <strong className="text-emerald-700 font-mono">{jobOffers.length}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Drive Date</span>
                      <strong className="text-slate-800 font-mono text-[11px]">{job.driveDate}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-800">Eligibility:</span> Min{' '}
                      {job.minCgpa.toFixed(2)} CGPA · Max {job.maxActiveBacklogs} backlogs
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Branches: {job.eligibleBranches.join(', ')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setActiveTab('applicants');
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      View Candidates <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-400">Deadline: {job.applicationDeadline}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: POST NEW CAMPUS DRIVE */}
      {activeTab === 'post_job' && (
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Post New Campus Recruitment Drive</h2>
            <p className="text-xs text-slate-500">
              Define job roles, package details, and strict eligibility thresholds for university candidates.
            </p>
          </div>

          <form onSubmit={handleCreateJob} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Associate Software Engineer"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={newJobType}
                  onChange={(e) => setNewJobType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship + PPO">Internship + PPO</option>
                  <option value="Summer Internship">Summer Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Package (CTC in Lakhs Per Annum)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="100"
                  value={newJobCtc}
                  onChange={(e) => setNewJobCtc(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Category:{' '}
                  <strong className="text-slate-700">
                    {newJobCtc >= 20 ? 'Super Dream (>20 LPA)' : newJobCtc >= 10 ? 'Dream (10-20 LPA)' : 'Standard (<10 LPA)'}
                  </strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Internship Stipend (₹)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={newJobStipend}
                  onChange={(e) => setNewJobStipend(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru / Hyderabad / Remote"
                  value={newJobLocation}
                  onChange={(e) => setNewJobLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
                <select
                  value={newJobWorkMode}
                  onChange={(e) => setNewJobWorkMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            {/* Smart Eligibility Criteria Engine Configuration */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Automated Student Eligibility Criteria
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum Cumulative CGPA Cut-off
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="5.0"
                    max="10.0"
                    value={newJobMinCgpa}
                    onChange={(e) => setNewJobMinCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maximum Permitted Active Backlogs
                  </label>
                  <select
                    value={newJobMaxBacklogs}
                    onChange={(e) => setNewJobMaxBacklogs(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="0">0 (Strictly No Active Backlogs)</option>
                    <option value="1">Up to 1 Active Backlog</option>
                    <option value="2">Up to 2 Active Backlogs</option>
                  </select>
                </div>
              </div>

              {/* Eligible Branches Checkbox Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Eligible Academic Disciplines / Branches
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    'Computer Science',
                    'Information Technology',
                    'Electronics & Comm',
                    'Electrical & Electronics',
                    'Mechanical Engg',
                    'Civil Engg',
                  ].map((branch) => {
                    const isChecked = newJobSelectedBranches.includes(branch);
                    return (
                      <label
                        key={branch}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewJobSelectedBranches([...newJobSelectedBranches, branch]);
                            } else {
                              setNewJobSelectedBranches(newJobSelectedBranches.filter((b) => b !== branch));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{branch}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={newJobDeadline}
                    onChange={(e) => setNewJobDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campus Drive Date
                  </label>
                  <input
                    type="date"
                    value={newJobDriveDate}
                    onChange={(e) => setNewJobDriveDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Overview & Scope
              </label>
              <textarea
                rows={3}
                placeholder="Provide details about team, tech stack, and what the candidate will be doing..."
                value={newJobDescription}
                onChange={(e) => setNewJobDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Publish Campus Drive
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 4: COMPANY PROFILE */}
      {activeTab === 'company_profile' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xl">
              {(currentUser.organization || 'Google').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentUser.organization || 'Google'}</h2>
              <p className="text-xs text-slate-500">Corporate University Relations Partner</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <span className="font-semibold block text-slate-900">Campus Point of Contact:</span>
              <p className="text-slate-600">{currentUser.name} ({currentUser.email})</p>
            </div>
            <div>
              <span className="font-semibold block text-slate-900">Campus Accreditation Tier:</span>
              <p className="text-emerald-700 font-medium">Tier-1 Marquee Recruiter</p>
            </div>
            <div>
              <span className="font-semibold block text-slate-900">Recruitment Guidelines:</span>
              <p className="text-slate-600 leading-relaxed">
                Campus recruitment rounds will be held in coordination with the Dean of Placement (Prof. Dr. K. Ramanathan).
                All shortlisted students will be provided dedicated test slots in Campus Lab 4.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SCHEDULE INTERVIEW ROUND */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Schedule Interview Round</h3>
              <button onClick={() => setSchedulingApp(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Candidate: <strong>{schedulingApp.studentName}</strong> ({schedulingApp.studentRollNumber} · {schedulingApp.studentBranch})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                <input
                  type="text"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  placeholder="e.g. 02:30 PM IST"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Format / Venue</label>
                <select
                  value={scheduleMode}
                  onChange={(e) => setScheduleMode(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="Virtual (Google Meet)">Virtual (Google Meet)</option>
                  <option value="In-Person (Campus Lab 4)">In-Person (Campus Lab 4)</option>
                  <option value="Auditorium">Campus Main Auditorium</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Link or Room</label>
                <input
                  type="text"
                  value={scheduleVenueOrLink}
                  onChange={(e) => setScheduleVenueOrLink(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Instructions</label>
                <textarea
                  rows={2}
                  value={scheduleInstructions}
                  onChange={(e) => setScheduleInstructions(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSchedulingApp(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateApplicationStage(schedulingApp.id, 'Technical Interview', {
                    interviewSchedule: {
                      date: scheduleDate,
                      time: scheduleTime,
                      mode: scheduleMode,
                      linkOrVenue: scheduleVenueOrLink,
                      instructions: scheduleInstructions,
                    },
                  });
                  setSchedulingApp(null);
                  alert(`Interview scheduled and notification sent to ${schedulingApp.studentName}!`);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Confirm & Dispatch Call Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EXTEND CAMPUS OFFER LETTER */}
      {offeringApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Issue Campus Placement Offer
              </div>
              <button onClick={() => setOfferingApp(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Candidate: <strong>{offeringApp.studentName}</strong> ({offeringApp.studentRollNumber})
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={offerCtc}
                    onChange={(e) => setOfferCtc(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Salary (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={offerBase}
                    onChange={(e) => setOfferBase(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tentative Joining Date</label>
                <input
                  type="date"
                  value={offerJoiningDate}
                  onChange={(e) => setOfferJoiningDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Offer Acceptance Deadline</label>
                <input
                  type="date"
                  value={offerValidTill}
                  onChange={(e) => setOfferValidTill(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setOfferingApp(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const job = jobs.find((j) => j.id === offeringApp.jobId);
                  onUpdateApplicationStage(offeringApp.id, 'Offered', {
                    offerLetter: {
                      ctcLpa: offerCtc,
                      role: job?.roleTitle || 'Software Engineer',
                      baseSalaryLpa: offerBase,
                      joiningDate: offerJoiningDate,
                      validTill: offerValidTill,
                      issuedAt: new Date().toISOString().split('T')[0],
                    },
                    recruiterNotes: 'Candidate selected in campus recruitment drive.',
                  });
                  setOfferingApp(null);
                  alert(`Campus Job Offer extended to ${offeringApp.studentName}!`);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Extend Official Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESUME VIEWER IN-BROWSER PDF MODAL */}
      {viewingStudentResume && (
        <ResumeViewerModal
          student={viewingStudentResume}
          isOpen={true}
          onClose={() => setViewingStudentResume(null)}
          viewerRoleTitle="Recruiter Candidate Evaluation"
        />
      )}
    </div>
  );
};
