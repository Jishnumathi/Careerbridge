export type UserRole = 'student' | 'recruiter' | 'admin' | 'tpo';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  organization?: string;
  token?: string;
}

export interface StudentProfile {
  id: string;
  _id?: string;
  userId: string;
  user?: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  department?: string;
  batch: string; // e.g. "2026"
  graduationYear?: string;
  cgpa: number;
  activeBacklogs: number;
  historyBacklogs: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  skills: string[];
  certifications: {
    id: string;
    title: string;
    issuer: string;
    year: string;
  }[];
  resumeUrl: string;
  resumeFileName: string;
  resumeUpdatedAt: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isVerifiedByTpo: boolean;
  tpoVerificationDate?: string;
  placementStatus: 'Unplaced' | 'Placed' | 'Opted Out';
  placedDetails?: {
    company: string;
    ctcLpa: number;
    offerDate: string;
    role: string;
  };
}

export interface Job {
  id: string;
  recruiterId: string;
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  roleTitle: string;
  jobType: 'Full-time' | 'Internship + PPO' | 'Summer Internship';
  location: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  ctcLpa: number;
  stipendPerMonth?: number;
  category: 'Standard' | 'Dream' | 'Super Dream'; // Standard (<10LPA), Dream (10-20LPA), Super Dream (>20LPA)
  description: string;
  responsibilities: string[];
  requirements: string[];
  minCgpa: number;
  eligibleBranches: string[]; // e.g. ["Computer Science", "Information Technology", "Electronics & Comm"]
  maxActiveBacklogs: number;
  maxHistoryBacklogs: number;
  minTenthPercentage: number;
  minTwelfthPercentage: number;
  applicationDeadline: string;
  driveDate: string;
  selectionRounds: string[]; // e.g. ["Online Assessment", "Technical Interview 1", "Technical Interview 2", "HR Round"]
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
}

export type ApplicationStage =
  | 'Applied'
  | 'Resume Screened'
  | 'Online Assessment'
  | 'Technical Interview'
  | 'HR Round'
  | 'Offered'
  | 'Rejected';

export interface ApplicationHistoryItem {
  stage: ApplicationStage;
  timestamp: string;
  note?: string;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  studentBranch: string;
  studentCgpa: number;
  studentBacklogs: number;
  resumeUrl: string;
  resumeFileName: string;
  appliedDate: string;
  currentStage: ApplicationStage;
  stageHistory: ApplicationHistoryItem[];
  interviewSchedule?: {
    date: string;
    time: string;
    mode: 'In-Person (Campus Lab 4)' | 'Virtual (Google Meet)' | 'Auditorium';
    linkOrVenue: string;
    instructions?: string;
  };
  offerLetter?: {
    ctcLpa: number;
    role: string;
    baseSalaryLpa: number;
    joiningDate: string;
    validTill: string;
    issuedAt: string;
  };
  recruiterNotes?: string;
}

export interface PlacementNotice {
  id: string;
  title: string;
  category: 'Drive Announcement' | 'Shortlist Result' | 'TPO Guideline' | 'Preparation';
  priority: 'High' | 'Normal';
  publishedDate: string;
  author: string;
  content: string;
  targetBranches: string[];
  attachmentName?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  passedCriteria: string[];
  matchScore: number; // 0 - 100 percentage
}
