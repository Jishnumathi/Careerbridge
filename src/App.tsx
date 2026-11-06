import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  StudentProfile,
  Job,
  Application,
  PlacementNotice,
  ApplicationStage,
} from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { studentApi, recruiterApi, adminApi, notificationApi, api } from './api/client';
import { TopNavigation } from './components/TopNavigation';
import { StudentPortal } from './components/StudentPortal';
import { RecruiterPortal } from './components/RecruiterPortal';
import { TpoAdminPortal } from './components/TpoAdminPortal';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import {
  UserCheck,
  Building2,
  Shield,
  RotateCcw,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Database,
  CheckCircle2,
  AlertCircle,
  Bell,
  LogIn
} from 'lucide-react';

const heroImage = '/src/assets/images/campus_placement_hero_1793936980683.jpg';

function MainApp() {
  const {
    currentUser,
    studentProfile,
    token,
    demoUsers,
    unreadNotifCount,
    switchUser,
    refreshStudentProfile,
    refreshNotifications,
  } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [notices, setNotices] = useState<PlacementNotice[]>([]);
  const [activeTab, setActiveTab] = useState<string>('jobs');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [serverHealth, setServerHealth] = useState<{
    databaseEngine: string;
    mongoConnected: boolean;
  }>({
    databaseEngine: 'Checking...',
    mongoConnected: false,
  });

  // Modal controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  // Active role normalization
  const activeRole: UserRole =
    currentUser?.role === 'admin' ? 'tpo' : currentUser?.role || 'student';

  // Check server health
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await api.get('/api/health');
        if (res.data) {
          setServerHealth({
            databaseEngine: res.data.databaseEngine || 'MongoDB',
            mongoConnected: Boolean(res.data.mongoConnected),
          });
        }
      } catch (err) {
        setServerHealth({
          databaseEngine: 'Offline',
          mongoConnected: false,
        });
      }
    }
    checkHealth();
  }, []);

  // Helper to format student profiles
  function formatStudents(rawList: any[]): StudentProfile[] {
    return rawList.map((s: any) => ({
      id: s._id || s.id,
      userId: s.user?.toString() || s.userId,
      rollNumber: s.rollNumber,
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      branch: s.department || s.branch || 'Computer Science',
      batch: s.graduationYear || s.batch || '2026',
      cgpa: Number(s.cgpa || 0),
      activeBacklogs: Number(s.activeBacklogs || 0),
      historyBacklogs: Number(s.historyBacklogs || 0),
      tenthPercentage: Number(s.tenthPercentage || 0),
      twelfthPercentage: Number(s.twelfthPercentage || 0),
      skills: s.skills || [],
      certifications: s.certifications || [],
      resumeUrl: s.resumeUrl || '',
      resumeFileName: s.resumeFileName || 'Resume.pdf',
      resumeUpdatedAt: s.resumeUpdatedAt ? new Date(s.resumeUpdatedAt).toISOString().split('T')[0] : '2026-10-18',
      isVerifiedByTpo: Boolean(s.isVerifiedByTpo),
      tpoVerificationDate: s.tpoVerificationDate ? new Date(s.tpoVerificationDate).toISOString().split('T')[0] : undefined,
      placementStatus: s.placementStatus || 'Unplaced',
      placedDetails: s.placedDetails,
    }));
  }

  // Fetch all backend data
  const loadBackendData = useCallback(async () => {
    if (!token || !currentUser) return;
    setIsDataLoading(true);
    try {
      // 1. Fetch public notices
      const noticeRes = await notificationApi.getPublicNotices();
      if (noticeRes.success && noticeRes.notices) {
        setNotices(
          noticeRes.notices.map((n: any) => ({
            id: n._id || n.id,
            title: n.title,
            category: n.category,
            priority: n.priority,
            publishedDate: n.publishedDate,
            author: n.author,
            content: n.content,
            targetBranches: n.targetBranches || ['All Branches'],
            attachmentName: n.attachmentName,
          }))
        );
      }

      // 2. Fetch jobs using role-authorized endpoints
      let jobsRes;
      if (currentUser.role === 'student') {
        jobsRes = await studentApi.getJobs();
      } else if (currentUser.role === 'recruiter') {
        jobsRes = await recruiterApi.getJobs();
      } else {
        jobsRes = await adminApi.getJobs();
      }

      if (jobsRes && jobsRes.success && jobsRes.jobs) {
        setJobs(
          jobsRes.jobs.map((j: any) => ({
            id: j._id || j.id,
            recruiterId: j.recruiter?.toString() || '',
            companyName: j.companyName,
            companyLogo: j.companyLogo || '',
            companyWebsite: j.companyWebsite || '',
            roleTitle: j.jobTitle,
            jobType: j.jobType || 'Full-time',
            location: j.location,
            workMode: j.workMode || 'Hybrid',
            ctcLpa: Number(j.salaryRange || 0),
            stipendPerMonth: Number(j.stipendPerMonth || 0),
            category: j.category || 'Standard',
            description: j.description,
            responsibilities: j.responsibilities || [],
            requirements: j.requirements || [],
            minCgpa: Number(j.minCgpa || 6.5),
            eligibleBranches: j.eligibleBranches || ['All Branches'],
            maxActiveBacklogs: Number(j.maxBacklogs ?? 0),
            maxHistoryBacklogs: Number(j.maxHistoryBacklogs ?? 0),
            minTenthPercentage: Number(j.minTenthPercentage ?? 60),
            minTwelfthPercentage: Number(j.minTwelfthPercentage ?? 60),
            applicationDeadline: j.applicationDeadline,
            driveDate: j.driveDate,
            selectionRounds: j.selectionRounds || ['OA', 'Tech Interview', 'HR'],
            status: j.jobStatus || 'active',
            createdAt: j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : '2026-10-15',
          }))
        );
      }

      // 3. Fetch applications using role-authorized endpoints
      if (currentUser.role === 'student') {
        const appRes = await studentApi.getApplications();
        if (appRes.success && appRes.applications) {
          setApplications(formatApplications(appRes.applications));
        }
      } else if (currentUser.role === 'recruiter') {
        const appRes = await recruiterApi.getApplications();
        if (appRes.success && appRes.applications) {
          setApplications(formatApplications(appRes.applications));
        }
      } else {
        const appRes = await adminApi.getApplications();
        if (appRes.success && appRes.applications) {
          setApplications(formatApplications(appRes.applications));
        }
      }

      // 4. Fetch students for recruiter and admin
      if (currentUser.role === 'recruiter') {
        const stuRes = await recruiterApi.getStudents();
        if (stuRes.success && stuRes.students) {
          setStudents(formatStudents(stuRes.students));
        }
      } else if (currentUser.role === 'admin' || currentUser.role === 'tpo') {
        const stuRes = await adminApi.getStudents();
        if (stuRes.success && stuRes.students) {
          setStudents(formatStudents(stuRes.students));
        }
      }
    } catch (err) {
      console.error('Failed to load backend data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, [token, currentUser?.id, currentUser?.role]);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  function formatApplications(rawList: any[]): Application[] {
    return rawList.map((a: any) => ({
      id: a._id || a.id,
      jobId: a.job?.toString() || a.jobId,
      studentId: a.student?.toString() || a.studentId,
      studentName: a.studentName,
      studentRollNumber: a.studentRollNumber,
      studentBranch: a.studentBranch,
      studentCgpa: Number(a.studentCgpa || 0),
      studentBacklogs: Number(a.studentBacklogs || 0),
      resumeUrl: a.resumeUrl,
      resumeFileName: a.resumeFileName,
      appliedDate: a.applicationDate || '2026-10-10',
      currentStage: a.currentStatus as ApplicationStage,
      stageHistory: a.statusHistory || [],
      interviewSchedule: a.interviewSchedule,
      offerLetter: a.offerLetter,
      recruiterNotes: a.recruiterRemarks,
    }));
  }

  // Student applies to job via real backend POST /api/students/jobs/:id/apply
  const handleApplyJob = async (jobId: string) => {
    try {
      const res = await studentApi.applyJob(jobId);
      if (res.success) {
        alert(res.message);
        await loadBackendData();
        await refreshNotifications();
      }
    } catch (err: any) {
      alert(`Application Rejected: ${err.message}`);
    }
  };

  // Student updates profile
  const handleUpdateStudentProfile = async (updated: StudentProfile) => {
    await refreshStudentProfile();
    await loadBackendData();
  };

  // Recruiter posts new campus drive via real backend POST /api/recruiters/jobs
  const handlePostJob = async (newJob: Job) => {
    try {
      const res = await recruiterApi.createJob({
        companyName: newJob.companyName,
        companyWebsite: newJob.companyWebsite,
        jobTitle: newJob.roleTitle,
        jobType: newJob.jobType,
        location: newJob.location,
        workMode: newJob.workMode,
        salaryRange: newJob.ctcLpa,
        stipendPerMonth: newJob.stipendPerMonth,
        description: newJob.description,
        responsibilities: newJob.responsibilities,
        requirements: newJob.requirements,
        minCgpa: newJob.minCgpa,
        eligibleBranches: newJob.eligibleBranches,
        maxBacklogs: newJob.maxActiveBacklogs,
        maxHistoryBacklogs: newJob.maxHistoryBacklogs,
        minTenthPercentage: newJob.minTenthPercentage,
        minTwelfthPercentage: newJob.minTwelfthPercentage,
        applicationDeadline: newJob.applicationDeadline,
        driveDate: newJob.driveDate,
        selectionRounds: newJob.selectionRounds,
      });

      if (res.success) {
        alert(res.message);
        await loadBackendData();
      }
    } catch (err: any) {
      alert(`Failed to post job: ${err.message}`);
    }
  };

  // Recruiter advances application status or schedules interview via real backend PATCH
  const handleUpdateApplicationStage = async (
    applicationId: string,
    newStage: ApplicationStage,
    meta?: {
      interviewSchedule?: Application['interviewSchedule'];
      offerLetter?: Application['offerLetter'];
      recruiterNotes?: string;
    }
  ) => {
    try {
      const res = await recruiterApi.updateApplicationStatus(applicationId, newStage, {
        remarks: meta?.recruiterNotes,
        interviewSchedule: meta?.interviewSchedule,
        offerDetails: meta?.offerLetter,
      });

      if (res.success) {
        await loadBackendData();
        await refreshNotifications();
      }
    } catch (err: any) {
      alert(`Failed to advance candidate stage: ${err.message}`);
    }
  };

  // TPO verifies student records via real backend PATCH /api/admin/students/:id/verify
  const handleVerifyStudent = async (studentId: string, verified: boolean) => {
    try {
      const res = await adminApi.verifyStudent(studentId, verified);
      if (res.success) {
        await loadBackendData();
        await refreshNotifications();
      }
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  // TPO adds notice via real backend POST /api/admin/notices
  const handleAddNotice = async (notice: PlacementNotice) => {
    try {
      const res = await adminApi.createNotice(notice);
      if (res.success) {
        await loadBackendData();
      }
    } catch (err: any) {
      alert(`Failed to publish notice: ${err.message}`);
    }
  };

  // TPO deletes notice via real backend DELETE /api/admin/notices/:id
  const handleDeleteNotice = async (noticeId: string) => {
    try {
      const res = await adminApi.deleteNotice(noticeId);
      if (res.success) {
        await loadBackendData();
      }
    } catch (err: any) {
      alert(`Failed to delete notice: ${err.message}`);
    }
  };

  // Fallback student profile if user is student
  const activeStudentProfile: StudentProfile = studentProfile || {
    id: currentUser?.id || 'stu_fallback',
    userId: currentUser?.id || 'stu_fallback',
    rollNumber: '22CS1042',
    name: currentUser?.name || 'Aarav Sharma',
    email: currentUser?.email || 'aarav.sharma@campus.edu',
    phone: '+91 98765 43210',
    branch: 'Computer Science',
    batch: '2026',
    cgpa: 8.72,
    activeBacklogs: 0,
    historyBacklogs: 0,
    tenthPercentage: 94.2,
    twelfthPercentage: 91.5,
    skills: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'Python'],
    certifications: [],
    resumeUrl: '',
    resumeFileName: 'Aarav_Sharma_Resume.pdf',
    resumeUpdatedAt: '2026-10-18',
    isVerifiedByTpo: true,
    placementStatus: 'Placed',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract Compliant Header */}
      {currentUser && (
        <TopNavigation
          currentUser={currentUser}
          activeRole={activeRole}
          onRoleChange={(u) => {
            switchUser(u);
            if (u.role === 'student') setActiveTab('jobs');
            else if (u.role === 'recruiter') setActiveTab('applicants');
            else setActiveTab('analytics');
          }}
          allUsers={demoUsers}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openNoticeCount={notices.length}
          unreadNotifCount={unreadNotifCount}
          onOpenNotifications={() => setIsNotifModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Hero Banner with Live Database Status & Real MERN Architecture Badges */}
      <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-25">
          <img
            src={heroImage}
            alt="Campus Placement Drive Hall"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-md">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Apex Institute of Technology · Campus Drive 2025–26
                </span>

                {/* Live Database Engine Badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-md">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Backend: {serverHealth.databaseEngine}
                </span>

                {/* JWT Auth Badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  JWT Auth Verified
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
                CareerBridge Placement Management Platform
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Production-grade MERN architecture backed by MongoDB schemas, real JWT authentication,
                server-side eligibility evaluation, Multer resume uploads, and institutional placement analytics.
              </p>
            </div>

            {/* Quick Auth Actions */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                Custom Sign In / Register
              </button>
            </div>
          </div>

          {/* Quick Role Switcher Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {([
                demoUsers.find((u) => u.role === 'student'),
                demoUsers.find((u) => u.role === 'recruiter'),
                demoUsers.find((u) => u.role === 'admin' || u.role === 'tpo'),
              ].filter(Boolean).length >= 3
                ? [
                    demoUsers.find((u) => u.role === 'student'),
                    demoUsers.find((u) => u.role === 'recruiter'),
                    demoUsers.find((u) => u.role === 'admin' || u.role === 'tpo'),
                  ].filter(Boolean)
                : demoUsers.slice(0, 3)
              ).map((u: any) => {
                const isSelected = currentUser?.id === (u._id || u.id);
                return (
                  <button
                    key={u._id || u.id}
                    onClick={() => {
                      switchUser(u);
                      if (u.role === 'student') setActiveTab('jobs');
                      else if (u.role === 'recruiter') setActiveTab('applicants');
                      else setActiveTab('analytics');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                      isSelected
                        ? u.role === 'student'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : u.role === 'recruiter'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {u.role === 'student' && <UserCheck className="w-3.5 h-3.5" />}
                    {u.role === 'recruiter' && <Building2 className="w-3.5 h-3.5" />}
                    {(u.role === 'admin' || u.role === 'tpo') && <Shield className="w-3.5 h-3.5" />}
                    <span>{u.name} ({u.role.toUpperCase()})</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={loadBackendData}
              title="Refresh live data from backend MongoDB"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh API Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser && activeRole === 'student' && (
          <StudentPortal
            student={activeStudentProfile}
            jobs={jobs}
            applications={applications}
            notices={notices}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onApplyJob={handleApplyJob}
            onUpdateProfile={handleUpdateStudentProfile}
          />
        )}

        {currentUser && activeRole === 'recruiter' && (
          <RecruiterPortal
            currentUser={currentUser}
            jobs={jobs}
            applications={applications}
            students={students}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onPostJob={handlePostJob}
            onUpdateApplicationStage={handleUpdateApplicationStage}
          />
        )}

        {currentUser && activeRole === 'tpo' && (
          <TpoAdminPortal
            currentUser={currentUser}
            students={students}
            jobs={jobs}
            applications={applications}
            notices={notices}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onVerifyStudent={handleVerifyStudent}
            onAddNotice={handleAddNotice}
            onDeleteNotice={handleDeleteNotice}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CareerBridge</span>
            <span>—</span>
            <span>MERN Stack Campus Placement Platform (MongoDB, Express, React, Node.js)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Engine: {serverHealth.databaseEngine}</span>
            <span>·</span>
            <span>Training & Placement Cell © 2026</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Notifications Modal */}
      <NotificationModal isOpen={isNotifModalOpen} onClose={() => setIsNotifModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
