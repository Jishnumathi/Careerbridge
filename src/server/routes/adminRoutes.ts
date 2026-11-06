import { Router, Response } from 'express';
import { db } from '../db/database';
import { protect, authorizeRoles, AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from '../services/notificationService';

export const adminRouter = Router();

adminRouter.use(protect);
adminRouter.use(authorizeRoles('admin'));

// GET /api/admin/dashboard
adminRouter.get('/dashboard', async (_req: AuthRequest, res: Response) => {
  try {
    const students = await db.students.find();
    const jobs = await db.jobs.find();
    const applications = await db.applications.find();
    const recruiters = await db.recruiters.find();

    const totalBatchSize = 580; // Total graduating seniors batch 2026
    const offeredApps = applications.filter((a: any) => a.currentStatus === 'Offered');
    const uniquelyPlacedStudentIds = new Set(offeredApps.map((a: any) => a.student?.toString()));
    
    // Total placed count (seed baseline + dynamic offers)
    const totalPlaced = Math.min(totalBatchSize, 442 + uniquelyPlacedStudentIds.size);
    const placementRate = Number(((totalPlaced / totalBatchSize) * 100).toFixed(1));

    const highestLpa = Math.max(...jobs.map((j: any) => Number(j.salaryRange || 0)), 32.0);
    const totalLpaSum = jobs.reduce((sum: number, j: any) => sum + Number(j.salaryRange || 0), 0);
    const averageLpa = Number((totalLpaSum / (jobs.length || 1)).toFixed(2));

    const dreamOffers = jobs.filter((j: any) => j.category === 'Dream').length;
    const superDreamOffers = jobs.filter((j: any) => j.category === 'Super Dream').length;

    // Department-wise breakdown
    const branchStats = [
      { branch: 'Computer Science', code: 'CSE', total: 180, placed: 165, unplaced: 15, avgLpa: 17.2, highestLpa: 32.0, rate: 91.6 },
      { branch: 'Information Technology', code: 'IT', total: 120, placed: 108, unplaced: 12, avgLpa: 15.4, highestLpa: 28.5, rate: 90.0 },
      { branch: 'Electronics & Comm', code: 'ECE', total: 140, placed: 112, unplaced: 28, avgLpa: 12.1, highestLpa: 22.0, rate: 80.0 },
      { branch: 'Electrical & Electronics', code: 'EEE', total: 60, placed: 44, unplaced: 16, avgLpa: 9.8, highestLpa: 16.0, rate: 73.3 },
      { branch: 'Mechanical Engg', code: 'MECH', total: 80, placed: 58, unplaced: 22, avgLpa: 8.5, highestLpa: 14.5, rate: 72.5 },
    ];

    // Monthly Application & Offer Trajectory
    const applicationTrends = [
      { month: 'Aug 2025', applications: 260, screenings: 220, interviews: 95, offers: 36 },
      { month: 'Sep 2025', applications: 540, screenings: 440, interviews: 210, offers: 92 },
      { month: 'Oct 2025', applications: 780, screenings: 630, interviews: 340, offers: 154 },
      { month: 'Nov 2025', applications: 610, screenings: 490, interviews: 275, offers: 118 },
      { month: 'Dec 2025', applications: 340, screenings: 280, interviews: 150, offers: 64 },
      { month: 'Jan 2026', applications: 450, screenings: 370, interviews: 195, offers: 52 },
      { month: 'Feb 2026', applications: 320, screenings: 260, interviews: 130, offers: 38 },
    ];

    // Salary tier breakdown
    const salaryTierDistribution = [
      { name: 'Super Dream (> 20 LPA)', tier: '>20 LPA', count: 48, percentage: 10.8, color: '#e11d48' },
      { name: 'Dream (10 - 20 LPA)', tier: '10-20 LPA', count: 184, percentage: 41.6, color: '#4f46e5' },
      { name: 'Core Prime (6 - 10 LPA)', tier: '6-10 LPA', count: 152, percentage: 34.4, color: '#059669' },
      { name: 'Standard (3.5 - 6 LPA)', tier: '3.5-6 LPA', count: 58, percentage: 13.2, color: '#d97706' },
    ];

    // Recruitment funnel stage progression
    const pipelineFunnel = [
      { stage: 'Total Applications', count: 3300, dropRate: '0%' },
      { stage: 'Resume Screened', count: 2690, dropRate: '18.5%' },
      { stage: 'Online Assessment', count: 1940, dropRate: '27.9%' },
      { stage: 'Technical Rounds', count: 1080, dropRate: '44.3%' },
      { stage: 'HR & Cultural Round', count: 590, dropRate: '45.4%' },
      { stage: 'Final Offers Extended', count: 442 + uniquelyPlacedStudentIds.size, dropRate: '25.1%' },
    ];

    return res.json({
      success: true,
      analytics: {
        totalBatchSize,
        totalPlaced,
        placementRate,
        highestLpa,
        averageLpa,
        totalCompanies: recruiters.length + jobs.length,
        activeDrivesCount: jobs.filter((j: any) => j.jobStatus === 'active').length,
        totalApplications: applications.length,
        dreamOffers,
        superDreamOffers,
        branchStats,
        applicationTrends,
        salaryTierDistribution,
        pipelineFunnel,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard analytics.', error: err.message });
  }
});

// GET /api/admin/students
adminRouter.get('/students', async (_req: AuthRequest, res: Response) => {
  try {
    const students = await db.students.find();
    return res.json({ success: true, count: students.length, students });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve students.', error: err.message });
  }
});

// PATCH /api/admin/students/:id/verify
adminRouter.patch('/students/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { verified } = req.body;
    const student = await db.students.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const isVerified = verified !== undefined ? Boolean(verified) : !student.isVerifiedByTpo;

    const updated = await db.students.findByIdAndUpdate(req.params.id, {
      isVerifiedByTpo: isVerified,
      tpoVerificationDate: isVerified ? new Date() : null,
    });

    // Notify student
    if (student.user) {
      await createNotification({
        userId: student.user.toString(),
        title: isVerified ? 'Academic Profile Verified by TPO' : 'TPO Verification Status Revoked',
        message: isVerified
          ? 'Your CGPA and academic credentials have been verified by the Placement Office. You may now apply for eligible campus drives.'
          : 'Your academic verification was set to pending. Please consult the TPO office.',
        notificationType: 'profile_verified',
        relatedId: student._id.toString(),
      });
    }

    return res.json({
      success: true,
      message: `Student academic profile ${isVerified ? 'verified' : 'unverified'} successfully.`,
      student: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update verification status.', error: err.message });
  }
});

// GET /api/admin/recruiters
adminRouter.get('/recruiters', async (_req: AuthRequest, res: Response) => {
  try {
    const recruiters = await db.recruiters.find();
    return res.json({ success: true, count: recruiters.length, recruiters });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve recruiters.', error: err.message });
  }
});

// PATCH /api/admin/recruiters/:id/verify
adminRouter.patch('/recruiters/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { verified } = req.body;
    const updated = await db.recruiters.findByIdAndUpdate(req.params.id, {
      isVerified: Boolean(verified),
    });
    return res.json({ success: true, message: 'Recruiter verification status updated.', recruiter: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to verify recruiter.', error: err.message });
  }
});

// GET /api/admin/jobs
adminRouter.get('/jobs', async (_req: AuthRequest, res: Response) => {
  try {
    const jobs = await db.jobs.find();
    return res.json({ success: true, count: jobs.length, jobs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve jobs.', error: err.message });
  }
});

// GET /api/admin/applications
adminRouter.get('/applications', async (_req: AuthRequest, res: Response) => {
  try {
    const applications = await db.applications.find();
    return res.json({ success: true, count: applications.length, applications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve applications.', error: err.message });
  }
});

// GET /api/admin/reports/placements
adminRouter.get('/reports/placements', async (_req: AuthRequest, res: Response) => {
  try {
    const students = await db.students.find();
    const applications = await db.applications.find();
    const jobs = await db.jobs.find();

    const reportRows = students.map((s: any) => {
      const studentApps = applications.filter((a: any) => a.student?.toString() === s._id?.toString());
      const offer = studentApps.find((a: any) => a.currentStatus === 'Offered');
      const job = offer ? jobs.find((j: any) => j._id?.toString() === offer.job?.toString()) : null;

      return {
        rollNumber: s.rollNumber,
        name: s.name,
        department: s.department,
        graduationYear: s.graduationYear,
        cgpa: s.cgpa,
        activeBacklogs: s.activeBacklogs,
        isVerifiedByTpo: s.isVerifiedByTpo ? 'Yes' : 'No',
        placementStatus: s.placementStatus,
        placedCompany: s.placedDetails?.company || job?.companyName || 'N/A',
        ctcLpa: s.placedDetails?.ctcLpa || job?.salaryRange || 'N/A',
        offerRole: s.placedDetails?.role || job?.jobTitle || 'N/A',
      };
    });

    return res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      academicYear: '2025-2026',
      totalGraduating: students.length,
      report: reportRows,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to generate placement report.', error: err.message });
  }
});

// POST /api/admin/notices
adminRouter.post('/notices', async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, priority, content, targetBranches, attachmentName } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Notice title and content are required.' });
    }

    const notice = await db.notices.create({
      title,
      category: category || 'Drive Announcement',
      priority: priority || 'Normal',
      publishedDate: new Date().toISOString().split('T')[0],
      author: req.user!.name || 'Prof. Dr. K. Ramanathan (TPO Dean)',
      content,
      targetBranches: Array.isArray(targetBranches) && targetBranches.length > 0 ? targetBranches : ['All Branches'],
      attachmentName: attachmentName || '',
    });

    return res.status(201).json({ success: true, message: 'Notice broadcasted successfully.', notice });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to publish notice.', error: err.message });
  }
});

// DELETE /api/admin/notices/:id
adminRouter.delete('/notices/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.notices.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete notice.', error: err.message });
  }
});
