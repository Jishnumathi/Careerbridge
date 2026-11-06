import { User, StudentProfile, Job, Application, PlacementNotice } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_stu_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    role: 'student',
    title: 'B.Tech Computer Science & Engineering (2026)',
    organization: 'Apex Institute of Technology',
  },
  {
    id: 'user_stu_2',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@campus.edu',
    role: 'student',
    title: 'B.Tech Electronics & Communication (2026)',
    organization: 'Apex Institute of Technology',
  },
  {
    id: 'user_stu_3',
    name: 'Kabir Mehta',
    email: 'kabir.mehta@campus.edu',
    role: 'student',
    title: 'B.Tech Mechanical Engineering (2026)',
    organization: 'Apex Institute of Technology',
  },
  {
    id: 'user_stu_4',
    name: 'Divya Nambiar',
    email: 'divya.nambiar@campus.edu',
    role: 'student',
    title: 'B.Tech Information Technology (2026)',
    organization: 'Apex Institute of Technology',
  },
  {
    id: 'user_rec_1',
    name: 'Sarah Jenkins',
    email: 'sjenkins@google-recruiting.com',
    role: 'recruiter',
    title: 'University Programs Lead',
    organization: 'Google',
  },
  {
    id: 'user_rec_2',
    name: 'Rohan Deshmukh',
    email: 'rdeshmukh@microsoft.com',
    role: 'recruiter',
    title: 'Campus Talent Acquisition Manager',
    organization: 'Microsoft',
  },
  {
    id: 'user_tpo_1',
    name: 'Dr. K. Ramanathan',
    email: 'tpo.director@campus.edu',
    role: 'tpo',
    title: 'Dean of Career Guidance & Placement Officer',
    organization: 'Apex Institute of Technology',
  },
];

export const INITIAL_STUDENT_PROFILES: StudentProfile[] = [
  {
    id: 'stu_1',
    userId: 'user_stu_1',
    rollNumber: '22CS1042',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    phone: '+91 98765 43210',
    branch: 'Computer Science',
    batch: '2026',
    cgpa: 8.72,
    activeBacklogs: 0,
    historyBacklogs: 0,
    tenthPercentage: 94.2,
    twelfthPercentage: 91.5,
    skills: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'Python', 'System Design', 'Docker'],
    certifications: [
      { id: 'c1', title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2025' },
      { id: 'c2', title: 'Full Stack Open MERN Specialization', issuer: 'University of Helsinki', year: '2024' }
    ],
    resumeUrl: 'https://cdn.careerbridge.campus/resumes/22CS1042_Aarav_Sharma.pdf',
    resumeFileName: 'Aarav_Sharma_SWE_Resume.pdf',
    resumeUpdatedAt: '2026-10-18',
    linkedinUrl: 'https://linkedin.com/in/aarav-sharma-cs',
    githubUrl: 'https://github.com/aaravsharma-dev',
    portfolioUrl: 'https://aaravsharma.dev',
    isVerifiedByTpo: true,
    tpoVerificationDate: '2026-08-15',
    placementStatus: 'Placed',
    placedDetails: {
      company: 'Microsoft',
      ctcLpa: 28.5,
      offerDate: '2026-10-24',
      role: 'Cloud Software Engineer'
    }
  },
  {
    id: 'stu_2',
    userId: 'user_stu_2',
    rollNumber: '22EC1089',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@campus.edu',
    phone: '+91 98451 23678',
    branch: 'Electronics & Comm',
    batch: '2026',
    cgpa: 7.85,
    activeBacklogs: 0,
    historyBacklogs: 0,
    tenthPercentage: 88.0,
    twelfthPercentage: 84.5,
    skills: ['C++', 'Embedded C', 'IoT Architecture', 'Python', 'Verilog', 'VLSI Fundamentals'],
    certifications: [
      { id: 'c3', title: 'Embedded Systems Design Certification', issuer: 'Arm Education', year: '2025' }
    ],
    resumeUrl: 'https://cdn.careerbridge.campus/resumes/22EC1089_Ananya_Iyer.pdf',
    resumeFileName: 'Ananya_Iyer_Hardware_SWE.pdf',
    resumeUpdatedAt: '2026-10-29',
    linkedinUrl: 'https://linkedin.com/in/ananya-iyer-vlsi',
    githubUrl: 'https://github.com/ananyaiyer',
    isVerifiedByTpo: true,
    tpoVerificationDate: '2026-08-16',
    placementStatus: 'Unplaced'
  },
  {
    id: 'stu_3',
    userId: 'user_stu_3',
    rollNumber: '22ME1015',
    name: 'Kabir Mehta',
    email: 'kabir.mehta@campus.edu',
    phone: '+91 97112 34567',
    branch: 'Mechanical Engg',
    batch: '2026',
    cgpa: 6.95,
    activeBacklogs: 1,
    historyBacklogs: 1,
    tenthPercentage: 81.2,
    twelfthPercentage: 76.4,
    skills: ['AutoCAD', 'SolidWorks', 'MATLAB', 'Python', 'Finite Element Analysis', 'Ansys'],
    certifications: [
      { id: 'c4', title: 'CSWA Mechanical Design', issuer: 'Dassault Systèmes', year: '2024' }
    ],
    resumeUrl: 'https://cdn.careerbridge.campus/resumes/22ME1015_Kabir_Mehta.pdf',
    resumeFileName: 'Kabir_Mehta_DesignEngineer.pdf',
    resumeUpdatedAt: '2026-09-12',
    isVerifiedByTpo: true,
    tpoVerificationDate: '2026-08-20',
    placementStatus: 'Unplaced'
  },
  {
    id: 'stu_4',
    userId: 'user_stu_4',
    rollNumber: '22IT1031',
    name: 'Divya Nambiar',
    email: 'divya.nambiar@campus.edu',
    phone: '+91 99203 98112',
    branch: 'Information Technology',
    batch: '2026',
    cgpa: 9.35,
    activeBacklogs: 0,
    historyBacklogs: 0,
    tenthPercentage: 96.5,
    twelfthPercentage: 95.0,
    skills: ['Go', 'Kubernetes', 'Distributed Systems', 'Java', 'Spring Boot', 'PostgreSQL', 'Kafka'],
    certifications: [
      { id: 'c5', title: 'Certified Kubernetes Administrator (CKA)', issuer: 'Linux Foundation', year: '2025' }
    ],
    resumeUrl: 'https://cdn.careerbridge.campus/resumes/22IT1031_Divya_Nambiar.pdf',
    resumeFileName: 'Divya_Nambiar_CoreSystems.pdf',
    resumeUpdatedAt: '2026-11-01',
    linkedinUrl: 'https://linkedin.com/in/divya-nambiar-infra',
    githubUrl: 'https://github.com/divyanambiar',
    isVerifiedByTpo: true,
    tpoVerificationDate: '2026-08-14',
    placementStatus: 'Unplaced'
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_google_01',
    recruiterId: 'user_rec_1',
    companyName: 'Google',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=128&h=128&q=80',
    companyWebsite: 'https://careers.google.com',
    roleTitle: 'Software Engineer - Cloud Systems',
    jobType: 'Full-time',
    location: 'Bengaluru / Hyderabad',
    workMode: 'Hybrid',
    ctcLpa: 32.0,
    stipendPerMonth: 110000,
    category: 'Super Dream',
    description: 'We are seeking passionate 2026 graduates to build and scale next-generation cloud infrastructure, distributed microservices, and high-throughput developer platforms.',
    responsibilities: [
      'Design, write, and deploy resilient backend code in C++, Go, or Java.',
      'Optimize distributed datastores and telemetry pipelines handling billions of queries.',
      'Collaborate with global reliability and security engineering teams.'
    ],
    requirements: [
      'Strong foundations in data structures, algorithms, and concurrency.',
      'Familiarity with distributed systems and Linux internals.',
      'Effective written and verbal engineering communication skills.'
    ],
    minCgpa: 8.0,
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    minTenthPercentage: 75,
    minTwelfthPercentage: 75,
    applicationDeadline: '2026-11-20',
    driveDate: '2026-11-25',
    selectionRounds: ['Online Assessment (90 mins)', 'Technical Interview 1', 'Technical Interview 2', 'Googliness & Leadership'],
    status: 'active',
    createdAt: '2026-10-15'
  },
  {
    id: 'job_msft_02',
    recruiterId: 'user_rec_2',
    companyName: 'Microsoft',
    companyLogo: 'https://images.unsplash.com/photo-1642132652075-2b23a936a287?auto=format&fit=crop&w=128&h=128&q=80',
    companyWebsite: 'https://careers.microsoft.com',
    roleTitle: 'Cloud Software Engineer',
    jobType: 'Full-time',
    location: 'Hyderabad / Noida',
    workMode: 'Hybrid',
    ctcLpa: 28.5,
    stipendPerMonth: 95000,
    category: 'Super Dream',
    description: 'Join the Azure Core Engineering team building enterprise virtualization, hyper-scale container orchestration, and multi-tenant security guarantees.',
    responsibilities: [
      'Build core Azure services with sub-millisecond API response latency.',
      'Develop automated integration test frameworks and chaos engineering routines.',
      'Participate in on-call and live site incident diagnostics.'
    ],
    requirements: [
      'Proficiency in C#, Java, C++, or TypeScript.',
      'Understanding of object-oriented design patterns and networking protocols.',
      'Problem-solving track record in competitive programming or open source.'
    ],
    minCgpa: 7.75,
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Electrical & Electronics'],
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    minTenthPercentage: 70,
    minTwelfthPercentage: 70,
    applicationDeadline: '2026-10-20',
    driveDate: '2026-10-24',
    selectionRounds: ['Cognitive & Coding Test', 'Technical Round 1', 'System Design & Problem Solving', 'Director Interview'],
    status: 'active',
    createdAt: '2026-09-28'
  },
  {
    id: 'job_amzn_03',
    recruiterId: 'user_rec_1',
    companyName: 'Amazon',
    companyLogo: 'https://images.unsplash.com/photo-1523474253246-63e607d531d4?auto=format&fit=crop&w=128&h=128&q=80',
    companyWebsite: 'https://amazon.jobs',
    roleTitle: 'Software Development Engineer I (SDE-1)',
    jobType: 'Full-time',
    location: 'Bengaluru / Chennai',
    workMode: 'Hybrid',
    ctcLpa: 24.0,
    stipendPerMonth: 85000,
    category: 'Super Dream',
    description: 'Build mission-critical systems for e-commerce checkout, logistics fulfillment routing, and customer loyalty personalization.',
    responsibilities: [
      'Implement scalable web services using AWS Lambda, DynamoDB, and ECS.',
      'Champion unit testing and CI/CD best practices.',
      'Work alongside Senior SDEs on architecture reviews.'
    ],
    requirements: [
      'BS in Computer Science, IT, or related engineering discipline.',
      'Hands-on fluency in Java or Python and relational databases.',
      'Demonstrated ownership and customer obsession.'
    ],
    minCgpa: 7.5,
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    minTenthPercentage: 70,
    minTwelfthPercentage: 70,
    applicationDeadline: '2026-11-22',
    driveDate: '2026-11-28',
    selectionRounds: ['OA on HackerRank', 'Technical Interview 1', 'Technical Interview 2', 'Bar Raiser Round'],
    status: 'active',
    createdAt: '2026-10-20'
  },
  {
    id: 'job_cisco_04',
    recruiterId: 'user_rec_2',
    companyName: 'Cisco Systems',
    companyLogo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=128&h=128&q=80',
    companyWebsite: 'https://jobs.cisco.com',
    roleTitle: 'Software Engineer - Networking & Security',
    jobType: 'Full-time',
    location: 'Bengaluru',
    workMode: 'On-site',
    ctcLpa: 17.5,
    stipendPerMonth: 65000,
    category: 'Dream',
    description: 'Develop next-gen programmable switches, SD-WAN controllers, and cloud-managed network telemetry solutions.',
    responsibilities: [
      'Implement data plane and control plane features in C/C++.',
      'Test network automation protocols with Python and PyTest.',
      'Debug packet drops, routing loops, and hardware acceleration pipelines.'
    ],
    requirements: [
      'Strong grasp of TCP/IP, OSI layers, routing protocols, and socket programming.',
      'Working knowledge of Linux CLI and scripting.'
    ],
    minCgpa: 7.0,
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Electrical & Electronics'],
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    minTenthPercentage: 65,
    minTwelfthPercentage: 65,
    applicationDeadline: '2026-11-18',
    driveDate: '2026-11-24',
    selectionRounds: ['Aptitude & Technical OA', 'Technical Round (Networking & OS)', 'Managerial / HR'],
    status: 'active',
    createdAt: '2026-10-22'
  },
  {
    id: 'job_deloitte_05',
    recruiterId: 'user_rec_1',
    companyName: 'Deloitte',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=128&h=128&q=80',
    companyWebsite: 'https://deloitte.com/careers',
    roleTitle: 'Technology Analyst - Digital Transformation',
    jobType: 'Full-time',
    location: 'Hyderabad / Mumbai / Bengaluru',
    workMode: 'Hybrid',
    ctcLpa: 10.5,
    category: 'Dream',
    description: 'Deliver strategic enterprise software solutions across ERP, cloud migration, modern data analytics, and digital experience engineering for Fortune 500 clients.',
    responsibilities: [
      'Develop modern business web applications and workflow integrations.',
      'Analyze client business logic and translate into technical specifications.',
      'Work in Agile squads across sprint planning and user story execution.'
    ],
    requirements: [
      'Strong analytical thinking, problem decomposition, and stakeholder communication.',
      'Knowledge of SQL, Web technologies (HTML/JS/React), or Python.'
    ],
    minCgpa: 6.5,
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Electrical & Electronics', 'Mechanical Engg', 'Civil Engg'],
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    minTenthPercentage: 60,
    minTwelfthPercentage: 60,
    applicationDeadline: '2026-11-25',
    driveDate: '2026-11-30',
    selectionRounds: ['Online Aptitude & Verbal Test', 'Technical Interview', 'Partner / HR Discussion'],
    status: 'active',
    createdAt: '2026-10-25'
  },
  {
    id: 'job_tata_06',
    recruiterId: 'user_rec_2',
    companyName: 'Tata Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=128&h=128&q=80',
    companyWebsite: 'https://tatatechnologies.com',
    roleTitle: 'Graduate Engineer Trainee - EV Systems & CAD',
    jobType: 'Full-time',
    location: 'Pune',
    workMode: 'On-site',
    ctcLpa: 8.8,
    category: 'Standard',
    description: 'Innovate automotive structural engineering, battery pack thermal management, and electric powertrain packaging for global EV brands.',
    responsibilities: [
      'Model 3D chassis and powertrain components using CATIA/SolidWorks.',
      'Perform structural FEA and CFD simulations for thermal dissipation.',
      'Coordinate with tooling and prototyping manufacturing teams.'
    ],
    requirements: [
      'B.Tech Mechanical / Automobile / Production Engineering.',
      'Proficiency in 3D CAD modeling and strength of materials fundamentals.'
    ],
    minCgpa: 6.5,
    eligibleBranches: ['Mechanical Engg', 'Electrical & Electronics'],
    maxActiveBacklogs: 1,
    maxHistoryBacklogs: 2,
    minTenthPercentage: 60,
    minTwelfthPercentage: 60,
    applicationDeadline: '2026-11-15',
    driveDate: '2026-11-19',
    selectionRounds: ['Domain Technical Test', 'CAD Practical Exam', 'Technical Interview', 'HR Round'],
    status: 'active',
    createdAt: '2026-10-18'
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_01',
    jobId: 'job_msft_02',
    studentId: 'stu_1',
    studentName: 'Aarav Sharma',
    studentRollNumber: '22CS1042',
    studentBranch: 'Computer Science',
    studentCgpa: 8.72,
    studentBacklogs: 0,
    resumeUrl: 'https://cdn.careerbridge.campus/resumes/22CS1042_Aarav_Sharma.pdf',
    resumeFileName: 'Aarav_Sharma_SWE_Resume.pdf',
    appliedDate: '2026-10-10',
    currentStage: 'Offered',
    stageHistory: [
      { stage: 'Applied', timestamp: '2026-10-10 14:22', note: 'Profile & Resume verified' },
      { stage: 'Resume Screened', timestamp: '2026-10-12 11:00', note: 'Shortlisted for Online Assessment' },
      { stage: 'Online Assessment', timestamp: '2026-10-15 10:00', note: 'Score: 96/100 on coding & problem solving' },
      { stage: 'Technical Interview', timestamp: '2026-10-20 15:30', note: 'Cleared 2 technical rounds on distributed storage' },
      { stage: 'HR Round', timestamp: '2026-10-23 11:30', note: 'Cultural fit and compensation discussion' },
      { stage: 'Offered', timestamp: '2026-10-24 18:00', note: 'Official Campus Offer Letter Issued' }
    ],
    offerLetter: {
      ctcLpa: 28.5,
      role: 'Cloud Software Engineer',
      baseSalaryLpa: 20.0,
      joiningDate: '2026-07-15',
      validTill: '2026-11-30',
      issuedAt: '2026-10-24'
    },
    recruiterNotes: 'Exceptional performance in systems design and algorithms. Recommended for immediate offer.'
  },
  {
    id: 'app_02',
    jobId: 'job_google_01',
    studentId: 'stu_4',
    studentName: 'Divya Nambiar',
    studentRollNumber: '22IT1031',
    studentBranch: 'Information Technology',
    studentCgpa: 9.35,
    studentBacklogs: 0,
    resumeUrl: 'https://cdn.careerbridge.campus/resumes/22IT1031_Divya_Nambiar.pdf',
    resumeFileName: 'Divya_Nambiar_CoreSystems.pdf',
    appliedDate: '2026-10-19',
    currentStage: 'Technical Interview',
    stageHistory: [
      { stage: 'Applied', timestamp: '2026-10-19 09:15', note: 'Applied via CareerBridge student portal' },
      { stage: 'Resume Screened', timestamp: '2026-10-21 16:40', note: 'Meets 8.0+ CGPA and Kubernetes background' },
      { stage: 'Online Assessment', timestamp: '2026-10-26 14:00', note: 'Aced OA with 100% test case pass rate' },
      { stage: 'Technical Interview', timestamp: '2026-11-02 11:00', note: 'Scheduled for Round 1 & Round 2 technical panel' }
    ],
    interviewSchedule: {
      date: '2026-11-12',
      time: '14:30 IST',
      mode: 'Virtual (Google Meet)',
      linkOrVenue: 'meet.google.com/xyz-placement-eng',
      instructions: 'Please have your IDE ready with screen sharing enabled. Questions will center on distributed queues and C++ memory management.'
    },
    recruiterNotes: 'High potential candidate with certified CKA credential.'
  },
  {
    id: 'app_03',
    jobId: 'job_cisco_04',
    studentId: 'stu_2',
    studentName: 'Ananya Iyer',
    studentRollNumber: '22EC1089',
    studentBranch: 'Electronics & Comm',
    studentCgpa: 7.85,
    studentBacklogs: 0,
    resumeUrl: 'https://cdn.careerbridge.campus/resumes/22EC1089_Ananya_Iyer.pdf',
    resumeFileName: 'Ananya_Iyer_Hardware_SWE.pdf',
    appliedDate: '2026-10-24',
    currentStage: 'Online Assessment',
    stageHistory: [
      { stage: 'Applied', timestamp: '2026-10-24 16:10', note: 'Application submitted' },
      { stage: 'Resume Screened', timestamp: '2026-10-27 10:30', note: 'Eligibility confirmed (ECE, 7.85 CGPA)' },
      { stage: 'Online Assessment', timestamp: '2026-11-04 11:00', note: 'OA link dispatched to student email' }
    ],
    interviewSchedule: {
      date: '2026-11-14',
      time: '10:00 IST',
      mode: 'In-Person (Campus Lab 4)',
      linkOrVenue: 'Campus Central Computing Lab 4, Block B',
      instructions: 'Carry your student ID card and printed copy of your resume.'
    }
  },
  {
    id: 'app_04',
    jobId: 'job_deloitte_05',
    studentId: 'stu_2',
    studentName: 'Ananya Iyer',
    studentRollNumber: '22EC1089',
    studentBranch: 'Electronics & Comm',
    studentCgpa: 7.85,
    studentBacklogs: 0,
    resumeUrl: 'https://cdn.careerbridge.campus/resumes/22EC1089_Ananya_Iyer.pdf',
    resumeFileName: 'Ananya_Iyer_Hardware_SWE.pdf',
    appliedDate: '2026-10-26',
    currentStage: 'Resume Screened',
    stageHistory: [
      { stage: 'Applied', timestamp: '2026-10-26 12:45', note: 'Application registered' },
      { stage: 'Resume Screened', timestamp: '2026-10-28 14:15', note: 'Cleared academic verification' }
    ]
  },
  {
    id: 'app_05',
    jobId: 'job_tata_06',
    studentId: 'stu_3',
    studentName: 'Kabir Mehta',
    studentRollNumber: '22ME1015',
    studentBranch: 'Mechanical Engg',
    studentCgpa: 6.95,
    studentBacklogs: 1,
    resumeUrl: 'https://cdn.careerbridge.campus/resumes/22ME1015_Kabir_Mehta.pdf',
    resumeFileName: 'Kabir_Mehta_DesignEngineer.pdf',
    appliedDate: '2026-10-20',
    currentStage: 'Technical Interview',
    stageHistory: [
      { stage: 'Applied', timestamp: '2026-10-20 18:20', note: 'Applied for EV Systems' },
      { stage: 'Resume Screened', timestamp: '2026-10-23 09:40', note: '1 active backlog permitted per drive guidelines' },
      { stage: 'Online Assessment', timestamp: '2026-10-28 15:00', note: 'CAD assessment passed' },
      { stage: 'Technical Interview', timestamp: '2026-11-03 14:00', note: 'SolidWorks design round cleared' }
    ],
    interviewSchedule: {
      date: '2026-11-16',
      time: '11:30 IST',
      mode: 'In-Person (Campus Lab 4)',
      linkOrVenue: 'Mechanical Dept Seminar Hall 102'
    }
  }
];

export const INITIAL_NOTICES: PlacementNotice[] = [
  {
    id: 'not_01',
    title: 'Google Campus Recruitment Drive 2026 Schedule & Guidelines',
    category: 'Drive Announcement',
    priority: 'High',
    publishedDate: '2026-11-04',
    author: 'Placement Cell (TPO)',
    content: 'All shortlisted candidates for Google Cloud Software Engineer drive are hereby informed that the coding round will commence on November 25, 2026 at 09:30 AM in Computer Labs 1, 2, and 3. Formal dress code is mandatory.',
    targetBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm'],
    attachmentName: 'Google_Campus_Drive_Process_2026.pdf'
  },
  {
    id: 'not_02',
    title: 'Policy Regarding Dream & Super Dream Job Offers (Placement Rules 2025-26)',
    category: 'TPO Guideline',
    priority: 'High',
    publishedDate: '2026-10-15',
    author: 'Prof. Dr. K. Ramanathan (TPO Dean)',
    content: 'Students holding a Standard category offer (<10 LPA) remain eligible to attempt Dream (10-20 LPA) and Super Dream (>20 LPA) drives. Once a student secures a Super Dream offer, they must opt out of further campus interview rounds to ensure opportunities for peers.',
    targetBranches: ['All Branches'],
    attachmentName: 'Campus_Placement_Code_of_Conduct_2025_26.pdf'
  },
  {
    id: 'not_03',
    title: 'Resume & Academic Credential Verification Deadline: Nov 15',
    category: 'TPO Guideline',
    priority: 'Normal',
    publishedDate: '2026-10-30',
    author: 'Placement Cell (TPO)',
    content: 'Students who have not yet submitted their semester grade cards for TPO verification are advised to upload them via their student dashboard immediately. Only verified profiles will be transmitted to upcoming recruiters.',
    targetBranches: ['All Branches']
  },
  {
    id: 'not_04',
    title: 'Microsoft Selects 12 Candidates from Batch 2026 - Congratulations!',
    category: 'Shortlist Result',
    priority: 'Normal',
    publishedDate: '2026-10-25',
    author: 'Placement Cell (TPO)',
    content: 'The Training & Placement Cell proudly congratulates the 12 candidates selected by Microsoft IDC at a package of 28.5 LPA. The official letter distribution ceremony will be held in the Main Auditorium on Friday.',
    targetBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm']
  }
];

// Helper functions for persistent LocalStorage backed state
const STORAGE_KEYS = {
  USERS: 'careerbridge_users_v1',
  STUDENTS: 'careerbridge_students_v1',
  JOBS: 'careerbridge_jobs_v1',
  APPLICATIONS: 'careerbridge_applications_v1',
  NOTICES: 'careerbridge_notices_v1',
  CURRENT_USER_ID: 'careerbridge_current_user_id_v1',
};

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error loading localStorage key "${key}":`, err);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error saving localStorage key "${key}":`, err);
  }
}

export function getInitialState() {
  const users = loadStoredData<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const students = loadStoredData<StudentProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENT_PROFILES);
  const jobs = loadStoredData<Job[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  const applications = loadStoredData<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  const notices = loadStoredData<PlacementNotice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  const currentUserId = loadStoredData<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user_stu_1');

  return {
    users,
    students,
    jobs,
    applications,
    notices,
    currentUserId,
    STORAGE_KEYS,
  };
}
