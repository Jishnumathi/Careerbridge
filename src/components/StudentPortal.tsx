import React, { useState } from 'react';
import {
  StudentProfile,
  Job,
  Application,
  PlacementNotice,
  EligibilityResult
} from '../types';
import { checkEligibility } from '../utils/eligibility';
import { studentApi } from '../api/client';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Building,
  MapPin,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Sparkles,
  BookOpen,
  Award,
  Upload,
  Eye,
  Check,
  ChevronRight,
  Video,
  FileCheck,
  HelpCircle,
  Plus,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ResumeViewerModal } from './ResumeViewerModal';

interface StudentPortalProps {
  student: StudentProfile;
  jobs: Job[];
  applications: Application[];
  notices: PlacementNotice[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onApplyJob: (jobId: string) => void;
  onUpdateProfile: (updated: StudentProfile) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  jobs,
  applications,
  notices,
  activeTab,
  setActiveTab,
  onApplyJob,
  onUpdateProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'eligible' | 'applied' | 'super_dream' | 'dream' | 'standard'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState<StudentProfile>(student);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('2026');
  const [isUploadSimulating, setIsUploadSimulating] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Sync internal form when prop updates
  React.useEffect(() => {
    setProfileFormData(student);
  }, [student]);

  // Applications map for quick lookup
  const studentApplications = applications.filter((app) => app.studentId === student.id);
  const appliedJobIds = new Set(studentApplications.map((app) => app.jobId));

  // Trigger celebratory confetti for placed student
  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isApplied = appliedJobIds.has(job.id);
    const eligibility = checkEligibility(student, job);

    if (categoryFilter === 'eligible') {
      return eligibility.isEligible;
    }
    if (categoryFilter === 'applied') {
      return isApplied;
    }
    if (categoryFilter === 'super_dream') {
      return job.category === 'Super Dream';
    }
    if (categoryFilter === 'dream') {
      return job.category === 'Dream';
    }
    if (categoryFilter === 'standard') {
      return job.category === 'Standard';
    }

    return true;
  });

  // Calculate quick stats
  const eligibleJobsCount = jobs.filter((j) => checkEligibility(student, j).isEligible).length;
  const activeOffersCount = studentApplications.filter((a) => a.currentStage === 'Offered').length;

  // Handle real profile save to backend MongoDB
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await studentApi.updateProfile({
        cgpa: profileFormData.cgpa,
        activeBacklogs: profileFormData.activeBacklogs,
        historyBacklogs: profileFormData.historyBacklogs,
        tenthPercentage: profileFormData.tenthPercentage,
        twelfthPercentage: profileFormData.twelfthPercentage,
        department: profileFormData.branch,
        skills: profileFormData.skills,
        certifications: profileFormData.certifications,
        phone: profileFormData.phone,
        linkedinUrl: profileFormData.linkedinUrl,
        githubUrl: profileFormData.githubUrl,
        portfolioUrl: profileFormData.portfolioUrl,
      });

      if (res.success && res.student) {
        onUpdateProfile({
          ...profileFormData,
          cgpa: res.student.cgpa,
          activeBacklogs: res.student.activeBacklogs,
          historyBacklogs: res.student.historyBacklogs,
          skills: res.student.skills,
          certifications: res.student.certifications,
        });
        alert('Academic Profile & Credentials updated and saved to MongoDB!');
      }
    } catch (err: any) {
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle actual resume file upload to backend Multer & Cloudinary
  const handleRealResumeUpload = async (file: File) => {
    setIsUploadSimulating(true);
    try {
      const res = await studentApi.uploadResume(file);
      if (res.success) {
        const updated: StudentProfile = {
          ...student,
          resumeFileName: res.resumeFileName || file.name,
          resumeUpdatedAt: new Date().toISOString().split('T')[0],
          resumeUrl: res.resumeUrl,
        };
        onUpdateProfile(updated);
        setUploadSuccessMessage(`Resume "${file.name}" uploaded to server and saved to MongoDB!`);
        setTimeout(() => setUploadSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      alert(`Resume upload failed: ${err.message}`);
    } finally {
      setIsUploadSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{student.name}</h1>
                <span className="text-xs text-slate-500 font-mono">({student.rollNumber})</span>
                {student.isVerifiedByTpo ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5" /> TPO Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                    <Clock className="w-3.5 h-3.5" /> Verification Pending
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span>{student.branch} (Batch {student.batch})</span>
                <span>·</span>
                <span>
                  CGPA: <strong className="text-slate-900 font-mono tabular-nums">{student.cgpa.toFixed(2)}</strong> / 10.0
                </span>
                <span>·</span>
                <span>
                  Active Backlogs: <strong className="text-slate-900 font-mono">{student.activeBacklogs}</strong>
                </span>
                <span>·</span>
                <span>{student.email}</span>
              </div>
            </div>
          </div>

          {/* Placement Status Card */}
          <div className="flex items-center gap-3 shrink-0">
            {student.placementStatus === 'Placed' && student.placedDetails ? (
              <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                    Placement Secured
                  </div>
                  <div className="text-sm font-bold text-emerald-950">
                    {student.placedDetails.company} · {student.placedDetails.ctcLpa} LPA
                  </div>
                  <div className="text-[11px] text-emerald-700">{student.placedDetails.role}</div>
                </div>
                <button
                  onClick={triggerCelebration}
                  className="px-2.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors shadow-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Celebrate
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-right">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Season Status</div>
                <div className="text-sm font-semibold text-slate-800">Actively Participating</div>
                <div className="text-[11px] text-indigo-600 font-medium">
                  {studentApplications.length} drives applied
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: OPPORTUNITIES & CAMPUS DRIVES */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by company, role title, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Quick Stat Indicators */}
              <div className="flex items-center gap-4 text-xs text-slate-600 w-full md:w-auto justify-end">
                <span>
                  Total Drives: <strong className="font-mono text-slate-900">{jobs.length}</strong>
                </span>
                <span>·</span>
                <span>
                  Eligible For You: <strong className="font-mono text-emerald-700 font-semibold">{eligibleJobsCount}</strong>
                </span>
                <span>·</span>
                <span>
                  Applied: <strong className="font-mono text-indigo-700">{studentApplications.length}</strong>
                </span>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'all', label: `All Drives (${jobs.length})` },
                { id: 'eligible', label: `Eligible For Me (${eligibleJobsCount})` },
                { id: 'applied', label: `Applied (${studentApplications.length})` },
                { id: 'super_dream', label: 'Super Dream (>20 LPA)' },
                { id: 'dream', label: 'Dream (10-20 LPA)' },
                { id: 'standard', label: 'Standard (<10 LPA)' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setCategoryFilter(btn.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                    categoryFilter === btn.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => {
              const eligibility = checkEligibility(student, job);
              const isApplied = appliedJobIds.has(job.id);
              const application = studentApplications.find((a) => a.jobId === job.id);

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-xs transition-all hover:shadow-md cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Top row: Company and Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm overflow-hidden">
                          {job.companyName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {job.companyName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span>{job.location}</span>
                            <span>·</span>
                            <span>{job.workMode}</span>
                          </div>
                        </div>
                      </div>

                      {/* Category tag */}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          job.category === 'Super Dream'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : job.category === 'Dream'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {job.category}
                      </span>
                    </div>

                    {/* Role Title & CTC */}
                    <div className="mt-4">
                      <h4 className="text-base font-semibold text-slate-900 line-clamp-1">{job.roleTitle}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                          {job.ctcLpa.toFixed(1)} LPA
                        </span>
                        {job.stipendPerMonth && (
                          <span className="text-xs text-slate-500">
                            (Stipend: ₹{(job.stipendPerMonth / 1000).toFixed(0)}k/mo)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Criteria Snippet */}
                    <div className="mt-3 py-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Min CGPA:</span>
                        <strong className="font-mono text-slate-900">{job.minCgpa.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Allowed Backlogs:</span>
                        <span className="text-slate-800">Max {job.maxActiveBacklogs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Drive Date:</span>
                        <span className="text-slate-800 font-mono">{job.driveDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Status Banner */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {isApplied ? (
                      <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                        </span>
                        <span className="text-[11px] font-normal text-indigo-600">{application?.currentStage}</span>
                      </div>
                    ) : eligibility.isEligible ? (
                      <div className="flex items-center justify-between text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/50">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Eligible to Apply
                        </span>
                        <span className="text-xs font-semibold flex items-center text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                          Apply <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200/50">
                        <div className="flex items-center gap-1 font-semibold text-amber-900">
                          <XCircle className="w-3.5 h-3.5 text-amber-600" /> Criteria Unmet
                        </div>
                        <div className="text-[11px] text-amber-700 truncate mt-0.5">
                          {eligibility.reasons[0]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredJobs.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No campus drives found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your search query or relaxing your filter parameters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="mt-4 px-4 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY APPLICATIONS & INTERVIEW TRACKER */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Placement Applications</h2>
              <p className="text-xs text-slate-500">
                Track your real-time recruitment pipeline, interview invites, and campus offer letters.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('jobs')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Explore More Drives <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {studentApplications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No applications submitted yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Browse open recruitment drives for your branch and apply with your verified profile.
              </p>
              <button
                onClick={() => setActiveTab('jobs')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Browse Campus Drives
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {studentApplications.map((app) => {
                const job = jobs.find((j) => j.id === app.jobId);
                const isOffered = app.currentStage === 'Offered';
                const isRejected = app.currentStage === 'Rejected';

                const stagesList = [
                  'Applied',
                  'Resume Screened',
                  'Online Assessment',
                  'Technical Interview',
                  'HR Round',
                  'Offered',
                ];

                const currentStageIndex = stagesList.indexOf(app.currentStage);

                return (
                  <div
                    key={app.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:border-slate-300 transition-all space-y-5"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-base">
                          {job?.companyName.substring(0, 2).toUpperCase() || 'CP'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{job?.companyName}</h3>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs font-mono font-bold text-slate-900">
                              {job?.ctcLpa} LPA
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{job?.roleTitle}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Applied on {app.appliedDate} · Resume: {app.resumeFileName}
                          </p>
                        </div>
                      </div>

                      {/* Stage status indicator */}
                      <div>
                        {isOffered ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Offer Extended!
                          </div>
                        ) : isRejected ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-lg font-medium text-xs">
                            <XCircle className="w-3.5 h-3.5" />
                            Not Shortlisted
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-semibold text-xs border border-indigo-200/60">
                            <Clock className="w-3.5 h-3.5" />
                            {app.currentStage}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Visual Stage Progress Stepper */}
                    {!isRejected && (
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Recruitment Process Pipeline
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                          {stagesList.map((stg, idx) => {
                            const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && isOffered);
                            const isCurrent = idx === currentStageIndex && !isOffered;
                            return (
                              <div
                                key={stg}
                                className={`p-2 rounded-lg text-center border text-xs transition-colors ${
                                  isCompleted
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                                    : isCurrent
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                              >
                                <div className="text-[10px] uppercase font-mono">
                                  {isCompleted ? '✓ Cleared' : isCurrent ? '● Active' : `Step ${idx + 1}`}
                                </div>
                                <div className="text-xs truncate mt-0.5">{stg}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Interview Call Letter Callout */}
                    {app.interviewSchedule && !isOffered && !isRejected && (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <Calendar className="w-4 h-4 text-amber-700" />
                            Official Interview Call Letter Scheduled
                          </div>
                          <div className="text-xs text-amber-800">
                            <strong>Date & Time:</strong> {app.interviewSchedule.date} at{' '}
                            {app.interviewSchedule.time}
                          </div>
                          <div className="text-xs text-amber-800">
                            <strong>Mode & Venue:</strong> {app.interviewSchedule.mode} —{' '}
                            <span className="font-mono">{app.interviewSchedule.linkOrVenue}</span>
                          </div>
                          {app.interviewSchedule.instructions && (
                            <p className="text-[11px] text-amber-700 italic">
                              "{app.interviewSchedule.instructions}"
                            </p>
                          )}
                        </div>

                        <div className="flex sm:flex-col gap-2 shrink-0">
                          <button
                            onClick={() => {
                              alert(`Interview instructions confirmed for ${job?.companyName}! Please be present 15 mins prior.`);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors shadow-xs"
                          >
                            Acknowledge Invite
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Official Offer Letter Card */}
                    {isOffered && app.offerLetter && (
                      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                            <Sparkles className="w-5 h-5 text-emerald-600" />
                            Official Campus Placement Offer Letter
                          </div>
                          <span className="text-xs font-mono text-emerald-700">
                            Issued: {app.offerLetter.issuedAt}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-emerald-200 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[11px]">Total CTC</span>
                            <span className="text-base font-bold text-emerald-800 font-mono">
                              {app.offerLetter.ctcLpa} LPA
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">Base Salary</span>
                            <span className="text-sm font-semibold text-slate-800 font-mono">
                              {app.offerLetter.baseSalaryLpa} LPA
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">Joining Date</span>
                            <span className="text-sm font-semibold text-slate-800">
                              {app.offerLetter.joiningDate}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">Accept By</span>
                            <span className="text-sm font-semibold text-slate-800 font-mono">
                              {app.offerLetter.validTill}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <p className="text-xs text-emerald-800">
                            Congratulations on securing this coveted campus placement! Endorsed by TPO.
                          </p>
                          <button
                            onClick={triggerCelebration}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Trigger Confetti
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PROFILE & RESUME MANAGEMENT */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Cloudinary Resume & ATS Viewer */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Placement Resume</h3>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Cloudinary CDN
                </span>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <FileText className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-slate-900">{student.resumeFileName}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Last updated {student.resumeUpdatedAt} · PDF format
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setIsResumeModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    Preview ATS Resume
                  </button>

                  <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    {isUploadSimulating ? 'Uploading to CDN...' : 'Upload New Resume'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleRealResumeUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {uploadSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccessMessage}</span>
                </div>
              )}

              {/* TPO Academic Seal */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  TPO Academic Verification Status
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Your academic records, marksheets, and backlog records are verified by the Dean of Placement (Prof. Dr. K. Ramanathan).
                </p>
                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-500">
                  <span>Verified Date:</span>
                  <span className="font-mono text-slate-700">{student.tpoVerificationDate || '2026-08-15'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Academic Details & Skills Editor */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Academic & Placement Profile</h3>
                  <p className="text-xs text-slate-500">
                    Keep your profile updated. Recruiters check these parameters against job criteria.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>

              {/* Academic Scores Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cumulative CGPA (out of 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profileFormData.cgpa}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, cgpa: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono font-semibold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Active Backlogs
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={profileFormData.activeBacklogs}
                    onChange={(e) =>
                      setProfileFormData({
                        ...profileFormData,
                        activeBacklogs: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono font-semibold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Historical / Dead Backlogs
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={profileFormData.historyBacklogs}
                    onChange={(e) =>
                      setProfileFormData({
                        ...profileFormData,
                        historyBacklogs: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono font-semibold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch / Discipline
                  </label>
                  <select
                    value={profileFormData.branch}
                    onChange={(e) => setProfileFormData({ ...profileFormData, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                    <option value="Civil Engg">Civil Engg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    10th Standard Score (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={profileFormData.tenthPercentage}
                    onChange={(e) =>
                      setProfileFormData({
                        ...profileFormData,
                        tenthPercentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    12th / Diploma Score (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={profileFormData.twelfthPercentage}
                    onChange={(e) =>
                      setProfileFormData({
                        ...profileFormData,
                        twelfthPercentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Technical Skills List */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Key Skills & Technologies ({profileFormData.skills.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {profileFormData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md border border-slate-200"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = profileFormData.skills.filter((_, i) => i !== idx);
                          setProfileFormData({ ...profileFormData, skills: updated });
                        }}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-sm mt-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. Next.js, C++, AWS)"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newSkillInput.trim()) {
                          setProfileFormData({
                            ...profileFormData,
                            skills: [...profileFormData.skills, newSkillInput.trim()],
                          });
                          setNewSkillInput('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSkillInput.trim()) {
                        setProfileFormData({
                          ...profileFormData,
                          skills: [...profileFormData.skills, newSkillInput.trim()],
                        });
                        setNewSkillInput('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Professional Certifications
                </label>
                <div className="space-y-2">
                  {profileFormData.certifications.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{c.title}</span>
                        <span className="text-slate-500 ml-2">by {c.issuer} ({c.year})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = profileFormData.certifications.filter((item) => item.id !== c.id);
                          setProfileFormData({ ...profileFormData, certifications: updated });
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add certification fields */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Certification Title (e.g. AWS Solutions Architect)"
                    value={newCertTitle}
                    onChange={(e) => setNewCertTitle(e.target.value)}
                    className="flex-2 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Issuer (e.g. AWS, Oracle)"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCertTitle.trim() && newCertIssuer.trim()) {
                        const newCert = {
                          id: `cert_${Date.now()}`,
                          title: newCertTitle.trim(),
                          issuer: newCertIssuer.trim(),
                          year: newCertYear,
                        };
                        setProfileFormData({
                          ...profileFormData,
                          certifications: [...profileFormData.certifications, newCert],
                        });
                        setNewCertTitle('');
                        setNewCertIssuer('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg whitespace-nowrap"
                  >
                    Add Cert
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 4: INTERVIEW PREPARATION & QUESTION BANK */}
      {activeTab === 'prep' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Placement Preparation & Interview Question Bank</h2>
            <p className="text-xs text-slate-500">
              High-frequency questions asked in campus recruitment technical assessments and HR interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: DSA & Problem Solving */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm border-b border-slate-100 pb-2">
                <BookOpen className="w-4 h-4" />
                Data Structures & Algorithms
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-slate-900 block">Sliding Window & Two Pointers</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Find longest substring without repeating characters, subarray sums. Asked at Google & Amazon.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-slate-900 block">Graph Traversals (BFS / DFS / Dijkstra)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Shortest path in weighted DAG, cycle detection in directed graphs, topological sorting.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-slate-900 block">Dynamic Programming (1D & 2D)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    0/1 Knapsack, Coin Change problem, Longest Common Subsequence state formulation.
                  </p>
                </li>
              </ul>
            </div>

            {/* Column 2: Core CS Fundamentals */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm border-b border-slate-100 pb-2">
                <FileCheck className="w-4 h-4" />
                Core Computer Science
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-slate-900 block">DBMS & SQL Query Optimization</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    B-Tree vs Hash indexing, ACID properties, Normalization (1NF to BCNF), writing complex JOIN queries.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-slate-900 block">Operating Systems & Concurrency</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Process vs Thread, Semaphores vs Mutex, Deadlock conditions (Coffman), Virtual Memory paging.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-slate-900 block">Computer Networks Protocols</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    TCP 3-way handshake, DNS lookup journey, TLS/SSL handshake, HTTP/1.1 vs HTTP/2 vs HTTP/3.
                  </p>
                </li>
              </ul>
            </div>

            {/* Column 3: HR & Behavioral Round */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm border-b border-slate-100 pb-2">
                <Award className="w-4 h-4" />
                HR & Managerial STAR Round
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-slate-900 block">STAR Method Template</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Situation, Task, Action, Result. Always quantify business impact and team collaboration.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-slate-900 block">"Why do you want to join our company?"</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reference current engineering projects, culture principles, and specific tech stack alignments.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-slate-900 block">Resolving Conflict in Academic Projects</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Show empathy, active listening, objective data-driven decision making, and delivering deadlines.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: CAMPUS NOTICES & CIRCULARS */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Placement Cell Notices & Official Circulars</h2>
            <p className="text-xs text-slate-500">
              Official circulars from Training & Placement Office regarding ongoing recruitment drives.
            </p>
          </div>

          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        notice.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {notice.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{notice.title}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{notice.publishedDate}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{notice.content}</p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Issued by: <strong className="text-slate-800">{notice.author}</strong></span>
                  {notice.attachmentName && (
                    <span className="text-indigo-600 font-medium hover:underline cursor-pointer flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {notice.attachmentName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JOB DETAILS & SMART ELIGIBILITY DRAWER/MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                  {selectedJob.companyName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedJob.companyName}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedJob.roleTitle} · {selectedJob.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
              {/* Package & Key Details Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Package</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {selectedJob.ctcLpa.toFixed(1)} LPA
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Category</span>
                  <span className="font-semibold text-slate-800">{selectedJob.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Drive Date</span>
                  <span className="font-mono text-slate-800">{selectedJob.driveDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Deadline</span>
                  <span className="font-mono text-rose-700 font-semibold">{selectedJob.applicationDeadline}</span>
                </div>
              </div>

              {/* AUTOMATED ELIGIBILITY CHECK ENGINE BREAKDOWN */}
              {(() => {
                const eligibility = checkEligibility(student, selectedJob);
                const isApplied = appliedJobIds.has(selectedJob.id);

                return (
                  <div
                    className={`rounded-xl p-4 border ${
                      eligibility.isEligible
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {eligibility.isEligible ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>You are fully eligible for this drive!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-amber-600" />
                            <span>Criteria Unmet ({eligibility.reasons.length} issue)</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs font-mono font-semibold">
                        Match Score: {eligibility.matchScore}%
                      </span>
                    </div>

                    {/* Criteria items checklist */}
                    <div className="space-y-1.5 text-xs">
                      {eligibility.passedCriteria.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-emerald-800">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}

                      {eligibility.reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-amber-900 font-medium">
                          <span className="text-amber-600 font-bold shrink-0">✕</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Job Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Role Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Key Responsibilities</h4>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  {selectedJob.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Eligible Branches */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Eligible Branches</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.eligibleBranches.map((b, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-md">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selection Process Roadmap */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Selection Rounds</h4>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {selectedJob.selectionRounds.map((round, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-medium">
                        {idx + 1}. {round}
                      </span>
                      {idx < selectedJob.selectionRounds.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Button */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close
              </button>

              {(() => {
                const isApplied = appliedJobIds.has(selectedJob.id);
                const eligibility = checkEligibility(student, selectedJob);

                if (isApplied) {
                  return (
                    <button
                      disabled
                      className="px-5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg cursor-not-allowed"
                    >
                      ✓ Already Applied
                    </button>
                  );
                }

                if (!eligibility.isEligible) {
                  return (
                    <button
                      disabled
                      title="You do not meet the minimum eligibility criteria"
                      className="px-5 py-2 text-xs font-semibold text-slate-400 bg-slate-200 rounded-lg cursor-not-allowed"
                    >
                      Criteria Unmet
                    </button>
                  );
                }

                return (
                  <button
                    onClick={() => {
                      onApplyJob(selectedJob.id);
                      setSelectedJob(null);
                    }}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    Apply with Verified Profile
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* In-Browser PDF Resume Viewer Modal */}
      <ResumeViewerModal
        student={student}
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        viewerRoleTitle="Student Self Preview"
      />
    </div>
  );
};
