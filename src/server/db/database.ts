import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { StudentModel } from '../models/Student';
import { RecruiterModel } from '../models/Recruiter';
import { JobModel } from '../models/Job';
import { ApplicationModel } from '../models/Application';
import { InterviewModel } from '../models/Interview';
import { NotificationModel } from '../models/Notification';
import { NoticeModel } from '../models/Notice';

export interface DatabaseStatus {
  isConnectedToMongo: boolean;
  engine: 'MongoDB' | 'EmbeddedPersistentStore';
  uri?: string;
  error?: string;
}

export let dbStatus: DatabaseStatus = {
  isConnectedToMongo: false,
  engine: 'EmbeddedPersistentStore',
};

// Persistent storage file path for embedded engine when standalone mongod is not present
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'careerbridge_db.json');

// Memory cache for embedded store
let storeData: {
  users: any[];
  students: any[];
  recruiters: any[];
  jobs: any[];
  applications: any[];
  interviews: any[];
  notifications: any[];
  notices: any[];
} = {
  users: [],
  students: [],
  recruiters: [],
  jobs: [],
  applications: [],
  interviews: [],
  notifications: [],
  notices: [],
};

// Seed initial production data
export async function seedInitialData() {
  const passwordHash = await bcrypt.hash('CareerBridge@2026', 10);

  // 1. Initial Users
  const seedUsers = [
    {
      _id: '672000000000000000000001',
      email: 'aarav.sharma@campus.edu',
      password: passwordHash,
      role: 'student',
      name: 'Aarav Sharma',
      organization: 'Apex Institute of Technology',
      avatar: '',
      isActive: true,
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-10-24'),
    },
    {
      _id: '672000000000000000000002',
      email: 'ananya.iyer@campus.edu',
      password: passwordHash,
      role: 'student',
      name: 'Ananya Iyer',
      organization: 'Apex Institute of Technology',
      avatar: '',
      isActive: true,
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-10-29'),
    },
    {
      _id: '672000000000000000000003',
      email: 'kabir.mehta@campus.edu',
      password: passwordHash,
      role: 'student',
      name: 'Kabir Mehta',
      organization: 'Apex Institute of Technology',
      avatar: '',
      isActive: true,
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-10-20'),
    },
    {
      _id: '672000000000000000000004',
      email: 'divya.nambiar@campus.edu',
      password: passwordHash,
      role: 'student',
      name: 'Divya Nambiar',
      organization: 'Apex Institute of Technology',
      avatar: '',
      isActive: true,
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-11-01'),
    },
    {
      _id: '672000000000000000000005',
      email: 'sjenkins@google-recruiting.com',
      password: passwordHash,
      role: 'recruiter',
      name: 'Sarah Jenkins',
      organization: 'Google',
      avatar: '',
      isActive: true,
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-10-15'),
    },
    {
      _id: '672000000000000000000006',
      email: 'rdeshmukh@microsoft.com',
      password: passwordHash,
      role: 'recruiter',
      name: 'Rohan Deshmukh',
      organization: 'Microsoft',
      avatar: '',
      isActive: true,
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-10-10'),
    },
    {
      _id: '672000000000000000000007',
      email: 'tpo.director@campus.edu',
      password: passwordHash,
      role: 'admin',
      name: 'Dr. K. Ramanathan',
      organization: 'Apex Institute of Technology',
      avatar: '',
      isActive: true,
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-11-04'),
    },
  ];

  // 2. Initial Students
  const seedStudents = [
    {
      _id: '672100000000000000000001',
      user: '672000000000000000000001',
      rollNumber: '22CS1042',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      phone: '+91 98765 43210',
      department: 'Computer Science',
      graduationYear: '2026',
      cgpa: 8.72,
      tenthPercentage: 94.2,
      twelfthPercentage: 91.5,
      activeBacklogs: 0,
      historyBacklogs: 0,
      skills: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'Python', 'Docker', 'System Design'],
      projects: [
        {
          title: 'CareerBridge Enterprise Placement Engine',
          description: 'Architected high-throughput MERN campus placement portal with real-time eligibility checking.',
          technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'JWT'],
          year: '2026',
        },
      ],
      certifications: [
        { id: 'cert_1', title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2025' },
        { id: 'cert_2', title: 'Full Stack Open MERN Specialization', issuer: 'University of Helsinki', year: '2024' },
      ],
      resumeUrl: 'https://cdn.careerbridge.campus/resumes/22CS1042_Aarav_Sharma.pdf',
      resumeFileName: 'Aarav_Sharma_SWE_Resume.pdf',
      resumeUpdatedAt: new Date('2026-10-18'),
      linkedinUrl: 'https://linkedin.com/in/aarav-sharma-cs',
      githubUrl: 'https://github.com/aaravsharma-dev',
      isVerifiedByTpo: true,
      tpoVerificationDate: new Date('2026-08-15'),
      placementStatus: 'Placed',
      placedDetails: {
        company: 'Microsoft',
        ctcLpa: 28.5,
        offerDate: '2026-10-24',
        role: 'Cloud Software Engineer',
      },
    },
    {
      _id: '672100000000000000000002',
      user: '672000000000000000000002',
      rollNumber: '22EC1089',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@campus.edu',
      phone: '+91 98451 23678',
      department: 'Electronics & Comm',
      graduationYear: '2026',
      cgpa: 7.85,
      tenthPercentage: 88.0,
      twelfthPercentage: 84.5,
      activeBacklogs: 0,
      historyBacklogs: 0,
      skills: ['C++', 'Embedded C', 'IoT Architecture', 'Python', 'Verilog', 'VLSI Fundamentals'],
      projects: [
        {
          title: 'Autonomous Smart Sensor Telemetry Grid',
          description: 'Built edge IoT microcontroller network with sub-second MQTT telemetry synchronization.',
          technologies: ['C++', 'FreeRTOS', 'MQTT'],
          year: '2025',
        },
      ],
      certifications: [
        { id: 'cert_3', title: 'Embedded Systems Design Certification', issuer: 'Arm Education', year: '2025' },
      ],
      resumeUrl: 'https://cdn.careerbridge.campus/resumes/22EC1089_Ananya_Iyer.pdf',
      resumeFileName: 'Ananya_Iyer_Hardware_SWE.pdf',
      resumeUpdatedAt: new Date('2026-10-29'),
      linkedinUrl: 'https://linkedin.com/in/ananya-iyer-vlsi',
      githubUrl: 'https://github.com/ananyaiyer',
      isVerifiedByTpo: true,
      tpoVerificationDate: new Date('2026-08-16'),
      placementStatus: 'Unplaced',
    },
    {
      _id: '672100000000000000000003',
      user: '672000000000000000000003',
      rollNumber: '22ME1015',
      name: 'Kabir Mehta',
      email: 'kabir.mehta@campus.edu',
      phone: '+91 97112 34567',
      department: 'Mechanical Engg',
      graduationYear: '2026',
      cgpa: 6.95,
      tenthPercentage: 81.2,
      twelfthPercentage: 76.4,
      activeBacklogs: 1,
      historyBacklogs: 1,
      skills: ['AutoCAD', 'SolidWorks', 'MATLAB', 'Python', 'Finite Element Analysis', 'Ansys'],
      projects: [
        {
          title: 'Electric Vehicle Chassis Structural Optimization',
          description: 'Simulated 3D torsional rigidity and lightweight alloy deformation under dynamic load.',
          technologies: ['SolidWorks', 'Ansys FEA'],
          year: '2025',
        },
      ],
      certifications: [
        { id: 'cert_4', title: 'CSWA Mechanical Design Certification', issuer: 'Dassault Systèmes', year: '2024' },
      ],
      resumeUrl: 'https://cdn.careerbridge.campus/resumes/22ME1015_Kabir_Mehta.pdf',
      resumeFileName: 'Kabir_Mehta_DesignEngineer.pdf',
      resumeUpdatedAt: new Date('2026-09-12'),
      isVerifiedByTpo: true,
      tpoVerificationDate: new Date('2026-08-20'),
      placementStatus: 'Unplaced',
    },
    {
      _id: '672100000000000000000004',
      user: '672000000000000000000004',
      rollNumber: '22IT1031',
      name: 'Divya Nambiar',
      email: 'divya.nambiar@campus.edu',
      phone: '+91 99203 98112',
      department: 'Information Technology',
      graduationYear: '2026',
      cgpa: 9.35,
      tenthPercentage: 96.5,
      twelfthPercentage: 95.0,
      activeBacklogs: 0,
      historyBacklogs: 0,
      skills: ['Go', 'Kubernetes', 'Distributed Systems', 'Java', 'PostgreSQL', 'Kafka'],
      projects: [
        {
          title: 'Distributed Fault-Tolerant Storage Broker',
          description: 'Implemented Raft consensus algorithm with asynchronous WAL journaling.',
          technologies: ['Go', 'Raft', 'gRPC'],
          year: '2025',
        },
      ],
      certifications: [
        { id: 'cert_5', title: 'Certified Kubernetes Administrator (CKA)', issuer: 'Linux Foundation', year: '2025' },
      ],
      resumeUrl: 'https://cdn.careerbridge.campus/resumes/22IT1031_Divya_Nambiar.pdf',
      resumeFileName: 'Divya_Nambiar_CoreSystems.pdf',
      resumeUpdatedAt: new Date('2026-11-01'),
      linkedinUrl: 'https://linkedin.com/in/divya-nambiar-infra',
      githubUrl: 'https://github.com/divyanambiar',
      isVerifiedByTpo: true,
      tpoVerificationDate: new Date('2026-08-14'),
      placementStatus: 'Unplaced',
    },
  ];

  // 3. Initial Recruiters
  const seedRecruiters = [
    {
      _id: '672200000000000000000001',
      user: '672000000000000000000005',
      companyName: 'Google',
      designation: 'University Programs Lead',
      industry: 'Software & Cloud Infrastructure',
      website: 'https://careers.google.com',
      companyLogo: '',
      isVerified: true,
      officeLocation: 'Bengaluru / Hyderabad',
    },
    {
      _id: '672200000000000000000002',
      user: '672000000000000000000006',
      companyName: 'Microsoft',
      designation: 'Campus Talent Acquisition Manager',
      industry: 'Cloud Computing & Enterprise Software',
      website: 'https://careers.microsoft.com',
      companyLogo: '',
      isVerified: true,
      officeLocation: 'Hyderabad / Noida',
    },
  ];

  // 4. Initial Jobs
  const seedJobs = [
    {
      _id: '672300000000000000000001',
      recruiter: '672000000000000000000005',
      companyName: 'Google',
      companyLogo: '',
      companyWebsite: 'https://careers.google.com',
      jobTitle: 'Software Engineer - Cloud Systems',
      jobType: 'Full-time',
      location: 'Bengaluru / Hyderabad',
      workMode: 'Hybrid',
      salaryRange: 32.0,
      stipendPerMonth: 110000,
      category: 'Super Dream',
      description: 'We are seeking passionate 2026 graduates to build and scale next-generation cloud infrastructure, distributed microservices, and developer platforms.',
      responsibilities: [
        'Design, write, and deploy resilient backend code in C++, Go, or Java.',
        'Optimize distributed datastores and telemetry pipelines.',
        'Collaborate with reliability and security engineering teams.',
      ],
      requirements: [
        'Strong foundations in data structures, algorithms, and concurrency.',
        'Familiarity with distributed systems and Linux internals.',
      ],
      requiredSkills: ['C++', 'Go', 'Distributed Systems', 'Linux'],
      minCgpa: 8.0,
      eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
      maxBacklogs: 0,
      maxHistoryBacklogs: 0,
      minTenthPercentage: 75,
      minTwelfthPercentage: 75,
      applicationDeadline: '2026-11-20',
      driveDate: '2026-11-25',
      selectionRounds: ['Online Assessment (90 mins)', 'Technical Interview 1', 'Technical Interview 2', 'Leadership Round'],
      jobStatus: 'active',
    },
    {
      _id: '672300000000000000000002',
      recruiter: '672000000000000000000006',
      companyName: 'Microsoft',
      companyLogo: '',
      companyWebsite: 'https://careers.microsoft.com',
      jobTitle: 'Cloud Software Engineer',
      jobType: 'Full-time',
      location: 'Hyderabad / Noida',
      workMode: 'Hybrid',
      salaryRange: 28.5,
      stipendPerMonth: 95000,
      category: 'Super Dream',
      description: 'Join the Azure Core Engineering team building enterprise virtualization, hyper-scale container orchestration, and multi-tenant security guarantees.',
      responsibilities: [
        'Build core Azure services with sub-millisecond API response latency.',
        'Develop automated integration test frameworks and chaos engineering routines.',
      ],
      requirements: [
        'Proficiency in C#, Java, C++, or TypeScript.',
        'Understanding of object-oriented design patterns and networking protocols.',
      ],
      requiredSkills: ['C#', 'TypeScript', 'Cloud Architecture', 'OOP'],
      minCgpa: 7.75,
      eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Electrical & Electronics'],
      maxBacklogs: 0,
      maxHistoryBacklogs: 1,
      minTenthPercentage: 70,
      minTwelfthPercentage: 70,
      applicationDeadline: '2026-10-20',
      driveDate: '2026-10-24',
      selectionRounds: ['Cognitive & Coding Test', 'Technical Round 1', 'System Design Round', 'Director Interview'],
      jobStatus: 'active',
    },
    {
      _id: '672300000000000000000003',
      recruiter: '672000000000000000000005',
      companyName: 'Amazon',
      companyLogo: '',
      companyWebsite: 'https://amazon.jobs',
      jobTitle: 'Software Development Engineer I (SDE-1)',
      jobType: 'Full-time',
      location: 'Bengaluru / Chennai',
      workMode: 'Hybrid',
      salaryRange: 24.0,
      stipendPerMonth: 85000,
      category: 'Super Dream',
      description: 'Build mission-critical systems for e-commerce checkout, logistics fulfillment routing, and customer loyalty personalization.',
      responsibilities: [
        'Implement scalable web services using AWS Lambda, DynamoDB, and ECS.',
        'Champion unit testing and CI/CD best practices.',
      ],
      requirements: [
        'BS in Computer Science, IT, or related engineering discipline.',
        'Hands-on fluency in Java or Python and relational databases.',
      ],
      requiredSkills: ['Java', 'Python', 'AWS', 'Data Structures'],
      minCgpa: 7.5,
      eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
      maxBacklogs: 0,
      maxHistoryBacklogs: 0,
      minTenthPercentage: 70,
      minTwelfthPercentage: 70,
      applicationDeadline: '2026-11-22',
      driveDate: '2026-11-28',
      selectionRounds: ['OA on HackerRank', 'Technical Interview 1', 'Technical Interview 2', 'Bar Raiser Round'],
      jobStatus: 'active',
    },
    {
      _id: '672300000000000000000004',
      recruiter: '672000000000000000000006',
      companyName: 'Cisco Systems',
      companyLogo: '',
      companyWebsite: 'https://jobs.cisco.com',
      jobTitle: 'Software Engineer - Networking & Security',
      jobType: 'Full-time',
      location: 'Bengaluru',
      workMode: 'On-site',
      salaryRange: 17.5,
      stipendPerMonth: 65000,
      category: 'Dream',
      description: 'Develop next-gen programmable switches, SD-WAN controllers, and cloud-managed network telemetry solutions.',
      responsibilities: [
        'Implement data plane and control plane features in C/C++.',
        'Test network automation protocols with Python and PyTest.',
      ],
      requirements: [
        'Strong grasp of TCP/IP, OSI layers, and socket programming.',
      ],
      requiredSkills: ['C', 'C++', 'Networking', 'TCP/IP', 'Linux'],
      minCgpa: 7.0,
      eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Electrical & Electronics'],
      maxBacklogs: 0,
      maxHistoryBacklogs: 1,
      minTenthPercentage: 65,
      minTwelfthPercentage: 65,
      applicationDeadline: '2026-11-18',
      driveDate: '2026-11-24',
      selectionRounds: ['Aptitude & Technical OA', 'Technical Round (Networking & OS)', 'Managerial / HR'],
      jobStatus: 'active',
    },
    {
      _id: '672300000000000000000005',
      recruiter: '672000000000000000000005',
      companyName: 'Deloitte',
      companyLogo: '',
      companyWebsite: 'https://deloitte.com/careers',
      jobTitle: 'Technology Analyst - Digital Transformation',
      jobType: 'Full-time',
      location: 'Hyderabad / Mumbai',
      workMode: 'Hybrid',
      salaryRange: 10.5,
      category: 'Dream',
      description: 'Deliver strategic enterprise software solutions across ERP, cloud migration, and modern data analytics.',
      responsibilities: [
        'Develop modern business web applications and workflow integrations.',
      ],
      requirements: [
        'Strong analytical thinking and stakeholder communication.',
      ],
      requiredSkills: ['SQL', 'JavaScript', 'Python', 'Agile'],
      minCgpa: 6.5,
      eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical Engg', 'Civil Engg'],
      maxBacklogs: 0,
      maxHistoryBacklogs: 2,
      minTenthPercentage: 60,
      minTwelfthPercentage: 60,
      applicationDeadline: '2026-11-25',
      driveDate: '2026-11-30',
      selectionRounds: ['Online Aptitude & Verbal Test', 'Technical Interview', 'Partner / HR Discussion'],
      jobStatus: 'active',
    },
    {
      _id: '672300000000000000000006',
      recruiter: '672000000000000000000006',
      companyName: 'Tata Technologies',
      companyLogo: '',
      companyWebsite: 'https://tatatechnologies.com',
      jobTitle: 'Graduate Engineer Trainee - EV Systems & CAD',
      jobType: 'Full-time',
      location: 'Pune',
      workMode: 'On-site',
      salaryRange: 8.8,
      category: 'Standard',
      description: 'Innovate automotive structural engineering, battery pack thermal management, and electric powertrain packaging.',
      responsibilities: [
        'Model 3D chassis and powertrain components using CATIA/SolidWorks.',
      ],
      requirements: [
        'B.Tech Mechanical / Automobile / Production Engineering.',
      ],
      requiredSkills: ['SolidWorks', 'CAD', 'FEA', 'Automotive Systems'],
      minCgpa: 6.5,
      eligibleBranches: ['Mechanical Engg', 'Electrical & Electronics'],
      maxBacklogs: 1,
      maxHistoryBacklogs: 2,
      minTenthPercentage: 60,
      minTwelfthPercentage: 60,
      applicationDeadline: '2026-11-15',
      driveDate: '2026-11-19',
      selectionRounds: ['Domain Technical Test', 'CAD Practical Exam', 'Technical Interview', 'HR Round'],
      jobStatus: 'active',
    },
  ];

  // 5. Initial Applications
  const seedApplications = [
    {
      _id: '672400000000000000000001',
      student: '672100000000000000000001',
      job: '672300000000000000000002',
      studentName: 'Aarav Sharma',
      studentRollNumber: '22CS1042',
      studentBranch: 'Computer Science',
      studentCgpa: 8.72,
      studentBacklogs: 0,
      resumeUrl: 'https://cdn.careerbridge.campus/resumes/22CS1042_Aarav_Sharma.pdf',
      resumeFileName: 'Aarav_Sharma_SWE_Resume.pdf',
      applicationDate: '2026-10-10',
      currentStatus: 'Offered',
      statusHistory: [
        { stage: 'Applied', timestamp: '2026-10-10 14:22', note: 'Profile & Resume verified' },
        { stage: 'Resume Screened', timestamp: '2026-10-12 11:00', note: 'Shortlisted for Online Assessment' },
        { stage: 'Online Assessment', timestamp: '2026-10-15 10:00', note: 'Score: 96/100 on coding test' },
        { stage: 'Technical Interview', timestamp: '2026-10-20 15:30', note: 'Cleared 2 technical rounds on distributed storage' },
        { stage: 'HR Round', timestamp: '2026-10-23 11:30', note: 'Cultural fit and compensation discussion' },
        { stage: 'Offered', timestamp: '2026-10-24 18:00', note: 'Official Campus Offer Letter Issued' },
      ],
      recruiterRemarks: 'Exceptional performance in systems design and algorithms. Recommended for immediate offer.',
      offerLetter: {
        ctcLpa: 28.5,
        role: 'Cloud Software Engineer',
        baseSalaryLpa: 20.0,
        joiningDate: '2026-07-15',
        validTill: '2026-11-30',
        issuedAt: '2026-10-24',
      },
    },
    {
      _id: '672400000000000000000002',
      student: '672100000000000000000004',
      job: '672300000000000000000001',
      studentName: 'Divya Nambiar',
      studentRollNumber: '22IT1031',
      studentBranch: 'Information Technology',
      studentCgpa: 9.35,
      studentBacklogs: 0,
      resumeUrl: 'https://cdn.careerbridge.campus/resumes/22IT1031_Divya_Nambiar.pdf',
      resumeFileName: 'Divya_Nambiar_CoreSystems.pdf',
      applicationDate: '2026-10-19',
      currentStatus: 'Technical Interview',
      statusHistory: [
        { stage: 'Applied', timestamp: '2026-10-19 09:15', note: 'Applied via CareerBridge student portal' },
        { stage: 'Resume Screened', timestamp: '2026-10-21 16:40', note: 'Meets 8.0+ CGPA requirement' },
        { stage: 'Online Assessment', timestamp: '2026-10-26 14:00', note: 'Aced OA with 100% test case pass rate' },
        { stage: 'Technical Interview', timestamp: '2026-11-02 11:00', note: 'Scheduled for Round 1 & Round 2 technical panel' },
      ],
      recruiterRemarks: 'High potential candidate with certified CKA credential.',
      interviewSchedule: {
        date: '2026-11-12',
        time: '14:30 IST',
        mode: 'Virtual (Google Meet)',
        linkOrVenue: 'meet.google.com/xyz-placement-eng',
        instructions: 'Please have your IDE ready with screen sharing enabled. Questions will center on distributed queues.',
      },
    },
    {
      _id: '672400000000000000000003',
      student: '672100000000000000000002',
      job: '672300000000000000000004',
      studentName: 'Ananya Iyer',
      studentRollNumber: '22EC1089',
      studentBranch: 'Electronics & Comm',
      studentCgpa: 7.85,
      studentBacklogs: 0,
      resumeUrl: 'https://cdn.careerbridge.campus/resumes/22EC1089_Ananya_Iyer.pdf',
      resumeFileName: 'Ananya_Iyer_Hardware_SWE.pdf',
      applicationDate: '2026-10-24',
      currentStatus: 'Online Assessment',
      statusHistory: [
        { stage: 'Applied', timestamp: '2026-10-24 16:10', note: 'Application submitted' },
        { stage: 'Resume Screened', timestamp: '2026-10-27 10:30', note: 'Eligibility confirmed (ECE, 7.85 CGPA)' },
        { stage: 'Online Assessment', timestamp: '2026-11-04 11:00', note: 'OA link dispatched to student email' },
      ],
      interviewSchedule: {
        date: '2026-11-14',
        time: '10:00 IST',
        mode: 'In-Person (Campus Lab 4)',
        linkOrVenue: 'Campus Central Computing Lab 4, Block B',
        instructions: 'Carry your student ID card and printed copy of your resume.',
      },
    },
    {
      _id: '672400000000000000000004',
      student: '672100000000000000000003',
      job: '672300000000000000000006',
      studentName: 'Kabir Mehta',
      studentRollNumber: '22ME1015',
      studentBranch: 'Mechanical Engg',
      studentCgpa: 6.95,
      studentBacklogs: 1,
      resumeUrl: 'https://cdn.careerbridge.campus/resumes/22ME1015_Kabir_Mehta.pdf',
      resumeFileName: 'Kabir_Mehta_DesignEngineer.pdf',
      applicationDate: '2026-10-20',
      currentStatus: 'Technical Interview',
      statusHistory: [
        { stage: 'Applied', timestamp: '2026-10-20 18:20', note: 'Applied for EV Systems' },
        { stage: 'Resume Screened', timestamp: '2026-10-23 09:40', note: '1 active backlog permitted' },
        { stage: 'Online Assessment', timestamp: '2026-10-28 15:00', note: 'CAD assessment passed' },
        { stage: 'Technical Interview', timestamp: '2026-11-03 14:00', note: 'SolidWorks design round cleared' },
      ],
      interviewSchedule: {
        date: '2026-11-16',
        time: '11:30 IST',
        mode: 'In-Person (Campus Lab 4)',
        linkOrVenue: 'Mechanical Dept Seminar Hall 102',
      },
    },
  ];

  // 6. Initial Notices
  const seedNotices = [
    {
      _id: '672500000000000000000001',
      title: 'Google Campus Recruitment Drive 2026 Schedule & Guidelines',
      category: 'Drive Announcement',
      priority: 'High',
      publishedDate: '2026-11-04',
      author: 'Prof. Dr. K. Ramanathan (TPO Dean)',
      content: 'All shortlisted candidates for Google Cloud Software Engineer drive are hereby informed that the coding round will commence on November 25, 2026 at 09:30 AM in Computer Labs 1, 2, and 3. Formal dress code is mandatory.',
      targetBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
      attachmentName: 'Google_Campus_Drive_Process_2026.pdf',
    },
    {
      _id: '672500000000000000000002',
      title: 'Policy Regarding Dream & Super Dream Job Offers (Placement Rules 2025-26)',
      category: 'TPO Guideline',
      priority: 'High',
      publishedDate: '2026-10-15',
      author: 'Prof. Dr. K. Ramanathan (TPO Dean)',
      content: 'Students holding a Standard category offer (<10 LPA) remain eligible to attempt Dream (10-20 LPA) and Super Dream (>20 LPA) drives. Once a student secures a Super Dream offer, they must opt out of further campus interview rounds to ensure opportunities for peers.',
      targetBranches: ['All Branches'],
      attachmentName: 'Campus_Placement_Code_of_Conduct_2025_26.pdf',
    },
  ];

  // 7. Initial Notifications
  const seedNotifications = [
    {
      _id: '672600000000000000000001',
      user: '672000000000000000000001',
      title: 'Official Placement Offer Extended!',
      message: 'Congratulations! Microsoft IDC has extended an official campus job offer for Cloud Software Engineer (28.5 LPA).',
      notificationType: 'offer_extended',
      relatedId: '672400000000000000000001',
      isRead: false,
      createdAt: new Date('2026-10-24'),
    },
    {
      _id: '672600000000000000000002',
      user: '672000000000000000000004',
      title: 'Technical Interview Scheduled with Google',
      message: 'Your Technical Interview for Cloud Systems SWE is scheduled on Nov 12 at 14:30 IST via Google Meet.',
      notificationType: 'interview_scheduled',
      relatedId: '672400000000000000000002',
      isRead: false,
      createdAt: new Date('2026-11-02'),
    },
  ];

  return {
    users: seedUsers,
    students: seedStudents,
    recruiters: seedRecruiters,
    jobs: seedJobs,
    applications: seedApplications,
    interviews: [],
    notifications: seedNotifications,
    notices: seedNotices,
  };
}

// Save store to disk
function persistStoreToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(storeData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write careerbridge_db.json:', err);
  }
}

// Load store from disk or initialize with seeds
export async function initializeStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      storeData = JSON.parse(content);
      console.log('Loaded CareerBridge persistent database from disk.');
    } else {
      console.log('Seeding initial CareerBridge database records...');
      storeData = await seedInitialData();
      persistStoreToDisk();
      console.log('Initial database records seeded and persisted to disk.');
    }
  } catch (err) {
    console.warn('Error reading careerbridge_db.json, re-initializing with seeds:', err);
    storeData = await seedInitialData();
    persistStoreToDisk();
  }
}

// Connect to MongoDB if available, otherwise activate persistent store
export async function connectDatabase(): Promise<DatabaseStatus> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerbridge';

  // Always initialize store data first so data is guaranteed available
  await initializeStore();

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]+)@/, ':****@')} ...`);
    
    // Set 2 second timeout so app boots quickly even if Mongo daemon is not running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });

    dbStatus = {
      isConnectedToMongo: true,
      engine: 'MongoDB',
      uri: mongoUri,
    };
    console.log('Successfully connected to MongoDB via Mongoose!');

    // Seed Mongoose collections if empty
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('Seeding MongoDB collections from initial state...');
      await UserModel.insertMany(storeData.users);
      await StudentModel.insertMany(storeData.students);
      await RecruiterModel.insertMany(storeData.recruiters);
      await JobModel.insertMany(storeData.jobs);
      await ApplicationModel.insertMany(storeData.applications);
      await NoticeModel.insertMany(storeData.notices);
      await NotificationModel.insertMany(storeData.notifications);
      console.log('MongoDB collections successfully populated!');
    }
  } catch (err: any) {
    dbStatus = {
      isConnectedToMongo: false,
      engine: 'EmbeddedPersistentStore',
      error: err.message,
    };
    console.warn(`MongoDB server offline (${err.message}). Active backend engine: EmbeddedPersistentStore (JSON-backed).`);
  }

  return dbStatus;
}

// Helper to generate a 24-character hexadecimal ObjectId
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

// UNIFIED DATABASE REPOSITORY ACCESSORS (Work with Mongoose OR Embedded Store)
export const db = {
  // USERS
  users: {
    find: async (filter?: (u: any) => boolean) => {
      if (dbStatus.isConnectedToMongo) {
        return UserModel.find(filter ? {} : {}).lean();
      }
      return filter ? storeData.users.filter(filter) : [...storeData.users];
    },
    findById: async (id: string) => {
      if (dbStatus.isConnectedToMongo) {
        return UserModel.findById(id).lean();
      }
      return storeData.users.find((u) => u._id.toString() === id.toString()) || null;
    },
    findOne: async (predicate: (u: any) => boolean, mongoFilter?: any) => {
      if (dbStatus.isConnectedToMongo && mongoFilter) {
        return UserModel.findOne(mongoFilter).lean();
      }
      return storeData.users.find(predicate) || null;
    },
    create: async (data: any) => {
      data._id = data._id || generateObjectId();
      data.createdAt = new Date();
      data.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        const created = await UserModel.create(data);
        return created.toObject();
      }
      storeData.users.push(data);
      persistStoreToDisk();
      return { ...data };
    },
  },

  // STUDENTS
  students: {
    find: async (filter?: (s: any) => boolean) => {
      if (dbStatus.isConnectedToMongo) {
        return StudentModel.find().lean();
      }
      return filter ? storeData.students.filter(filter) : [...storeData.students];
    },
    findById: async (id: string) => {
      if (dbStatus.isConnectedToMongo) {
        return StudentModel.findById(id).lean();
      }
      return storeData.students.find((s) => s._id.toString() === id.toString()) || null;
    },
    findByUserId: async (userId: string) => {
      if (dbStatus.isConnectedToMongo) {
        return StudentModel.findOne({ user: userId }).lean();
      }
      return storeData.students.find((s) => s.user.toString() === userId.toString()) || null;
    },
    create: async (data: any) => {
      data._id = data._id || generateObjectId();
      data.createdAt = new Date();
      data.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        const created = await StudentModel.create(data);
        return created.toObject();
      }
      storeData.students.push(data);
      persistStoreToDisk();
      return { ...data };
    },
    findByIdAndUpdate: async (id: string, updates: any) => {
      updates.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        return StudentModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      }
      const idx = storeData.students.findIndex((s) => s._id.toString() === id.toString());
      if (idx === -1) return null;
      storeData.students[idx] = { ...storeData.students[idx], ...updates };
      persistStoreToDisk();
      return { ...storeData.students[idx] };
    },
  },

  // RECRUITERS
  recruiters: {
    find: async (filter?: (r: any) => boolean) => {
      if (dbStatus.isConnectedToMongo) {
        return RecruiterModel.find().lean();
      }
      return filter ? storeData.recruiters.filter(filter) : [...storeData.recruiters];
    },
    findById: async (id: string) => {
      if (dbStatus.isConnectedToMongo) {
        return RecruiterModel.findById(id).lean();
      }
      return storeData.recruiters.find((r) => r._id.toString() === id.toString()) || null;
    },
    findByUserId: async (userId: string) => {
      if (dbStatus.isConnectedToMongo) {
        return RecruiterModel.findOne({ user: userId }).lean();
      }
      return storeData.recruiters.find((r) => r.user.toString() === userId.toString()) || null;
    },
    create: async (data: any) => {
      data._id = data._id || generateObjectId();
      data.createdAt = new Date();
      data.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        const created = await RecruiterModel.create(data);
        return created.toObject();
      }
      storeData.recruiters.push(data);
      persistStoreToDisk();
      return { ...data };
    },
    findByIdAndUpdate: async (id: string, updates: any) => {
      updates.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        return RecruiterModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      }
      const idx = storeData.recruiters.findIndex((r) => r._id.toString() === id.toString());
      if (idx === -1) return null;
      storeData.recruiters[idx] = { ...storeData.recruiters[idx], ...updates };
      persistStoreToDisk();
      return { ...storeData.recruiters[idx] };
    },
  },

  // JOBS
  jobs: {
    find: async (filter?: (j: any) => boolean) => {
      if (dbStatus.isConnectedToMongo) {
        return JobModel.find().sort({ createdAt: -1 }).lean();
      }
      const list = filter ? storeData.jobs.filter(filter) : [...storeData.jobs];
      return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },
    findById: async (id: string) => {
      if (dbStatus.isConnectedToMongo) {
        return JobModel.findById(id).lean();
      }
      return storeData.jobs.find((j) => j._id.toString() === id.toString()) || null;
    },
    create: async (data: any) => {
      data._id = data._id || generateObjectId();
      data.createdAt = new Date();
      data.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        const created = await JobModel.create(data);
        return created.toObject();
      }
      storeData.jobs.unshift(data);
      persistStoreToDisk();
      return { ...data };
    },
    findByIdAndUpdate: async (id: string, updates: any) => {
      updates.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        return JobModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      }
      const idx = storeData.jobs.findIndex((j) => j._id.toString() === id.toString());
      if (idx === -1) return null;
      storeData.jobs[idx] = { ...storeData.jobs[idx], ...updates };
      persistStoreToDisk();
      return { ...storeData.jobs[idx] };
    },
    findByIdAndDelete: async (id: string) => {
      if (dbStatus.isConnectedToMongo) {
        return JobModel.findByIdAndDelete(id).lean();
      }
      const idx = storeData.jobs.findIndex((j) => j._id.toString() === id.toString());
      if (idx === -1) return null;
      const removed = storeData.jobs.splice(idx, 1)[0];
      persistStoreToDisk();
      return removed;
    },
  },

  // APPLICATIONS
  applications: {
    find: async (filter?: (a: any) => boolean) => {
      if (dbStatus.isConnectedToMongo) {
        return ApplicationModel.find().sort({ createdAt: -1 }).lean();
      }
      const list = filter ? storeData.applications.filter(filter) : [...storeData.applications];
      return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },
    findById: async (id: string) => {
      if (dbStatus.isConnectedToMongo) {
        return ApplicationModel.findById(id).lean();
      }
      return storeData.applications.find((a) => a._id.toString() === id.toString()) || null;
    },
    findOne: async (filter: (a: any) => boolean, mongoFilter?: any) => {
      if (dbStatus.isConnectedToMongo && mongoFilter) {
        return ApplicationModel.findOne(mongoFilter).lean();
      }
      return storeData.applications.find(filter) || null;
    },
    create: async (data: any) => {
      data._id = data._id || generateObjectId();
      data.createdAt = new Date();
      data.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        const created = await ApplicationModel.create(data);
        return created.toObject();
      }
      storeData.applications.unshift(data);
      persistStoreToDisk();
      return { ...data };
    },
    findByIdAndUpdate: async (id: string, updates: any) => {
      updates.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        return ApplicationModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      }
      const idx = storeData.applications.findIndex((a) => a._id.toString() === id.toString());
      if (idx === -1) return null;
      storeData.applications[idx] = { ...storeData.applications[idx], ...updates };
      persistStoreToDisk();
      return { ...storeData.applications[idx] };
    },
  },

  // INTERVIEWS
  interviews: {
    find: async (filter?: (i: any) => boolean) => {
      if (dbStatus.isConnectedToMongo) {
        return InterviewModel.find().lean();
      }
      return filter ? storeData.interviews.filter(filter) : [...storeData.interviews];
    },
    create: async (data: any) => {
      data._id = data._id || generateObjectId();
      data.createdAt = new Date();
      data.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        const created = await InterviewModel.create(data);
        return created.toObject();
      }
      storeData.interviews.push(data);
      persistStoreToDisk();
      return { ...data };
    },
  },

  // NOTIFICATIONS
  notifications: {
    find: async (filter?: (n: any) => boolean) => {
      if (dbStatus.isConnectedToMongo) {
        return NotificationModel.find().sort({ createdAt: -1 }).lean();
      }
      const list = filter ? storeData.notifications.filter(filter) : [...storeData.notifications];
      return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },
    create: async (data: any) => {
      data._id = data._id || generateObjectId();
      data.createdAt = new Date();
      data.updatedAt = new Date();
      data.isRead = false;
      if (dbStatus.isConnectedToMongo) {
        const created = await NotificationModel.create(data);
        return created.toObject();
      }
      storeData.notifications.unshift(data);
      persistStoreToDisk();
      return { ...data };
    },
    findByIdAndUpdate: async (id: string, updates: any) => {
      if (dbStatus.isConnectedToMongo) {
        return NotificationModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      }
      const idx = storeData.notifications.findIndex((n) => n._id.toString() === id.toString());
      if (idx === -1) return null;
      storeData.notifications[idx] = { ...storeData.notifications[idx], ...updates };
      persistStoreToDisk();
      return { ...storeData.notifications[idx] };
    },
    updateMany: async (filter: (n: any) => boolean, updates: any) => {
      if (dbStatus.isConnectedToMongo) {
        return NotificationModel.updateMany({}, updates);
      }
      storeData.notifications.forEach((n) => {
        if (filter(n)) {
          Object.assign(n, updates);
        }
      });
      persistStoreToDisk();
    },
  },

  // NOTICES
  notices: {
    find: async (filter?: (n: any) => boolean) => {
      if (dbStatus.isConnectedToMongo) {
        return NoticeModel.find().sort({ createdAt: -1 }).lean();
      }
      const list = filter ? storeData.notices.filter(filter) : [...storeData.notices];
      return list.sort((a, b) => new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime());
    },
    create: async (data: any) => {
      data._id = data._id || generateObjectId();
      data.createdAt = new Date();
      data.updatedAt = new Date();
      if (dbStatus.isConnectedToMongo) {
        const created = await NoticeModel.create(data);
        return created.toObject();
      }
      storeData.notices.unshift(data);
      persistStoreToDisk();
      return { ...data };
    },
    findByIdAndDelete: async (id: string) => {
      if (dbStatus.isConnectedToMongo) {
        return NoticeModel.findByIdAndDelete(id).lean();
      }
      const idx = storeData.notices.findIndex((n) => n._id.toString() === id.toString());
      if (idx === -1) return null;
      const removed = storeData.notices.splice(idx, 1)[0];
      persistStoreToDisk();
      return removed;
    },
  },
};
