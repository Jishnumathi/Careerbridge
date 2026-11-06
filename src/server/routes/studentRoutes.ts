import { Router, Response } from 'express';
import { db } from '../db/database';
import { protect, authorizeRoles, AuthRequest } from '../middleware/authMiddleware';
import { uploadResume } from '../middleware/uploadMiddleware';
import { evaluateBackendEligibility } from '../services/eligibilityService';
import { createNotification } from '../services/notificationService';

export const studentRouter = Router();

// Apply auth middleware to all student routes
studentRouter.use(protect);

// GET /api/students/jobs - Accessible to any authenticated university user
studentRouter.get('/jobs', async (_req: AuthRequest, res: Response) => {
  try {
    const jobs = await db.jobs.find((j: any) => j.jobStatus === 'active');
    return res.json({ success: true, count: jobs.length, jobs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching jobs.', error: err.message });
  }
});

// All remaining student routes require 'student' role
studentRouter.use(authorizeRoles('student'));

// GET /api/students/profile
studentRouter.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const student = await db.students.findByUserId(req.user!.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    return res.json({ success: true, student });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving profile.', error: err.message });
  }
});

// PUT /api/students/profile
studentRouter.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const student = await db.students.findByUserId(req.user!.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const {
      cgpa,
      activeBacklogs,
      historyBacklogs,
      tenthPercentage,
      twelfthPercentage,
      department,
      skills,
      projects,
      certifications,
      phone,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
    } = req.body;

    const updates: any = {};
    if (cgpa !== undefined) updates.cgpa = Number(cgpa);
    if (activeBacklogs !== undefined) updates.activeBacklogs = Number(activeBacklogs);
    if (historyBacklogs !== undefined) updates.historyBacklogs = Number(historyBacklogs);
    if (tenthPercentage !== undefined) updates.tenthPercentage = Number(tenthPercentage);
    if (twelfthPercentage !== undefined) updates.twelfthPercentage = Number(twelfthPercentage);
    if (department !== undefined) updates.department = department;
    if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : [];
    if (projects !== undefined) updates.projects = Array.isArray(projects) ? projects : [];
    if (certifications !== undefined) updates.certifications = Array.isArray(certifications) ? certifications : [];
    if (phone !== undefined) updates.phone = phone;
    if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl;

    const updatedStudent = await db.students.findByIdAndUpdate(student._id.toString(), updates);

    return res.json({
      success: true,
      message: 'Student profile updated successfully.',
      student: updatedStudent,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating profile.', error: err.message });
  }
});

// POST /api/students/resume
studentRouter.post('/resume', uploadResume.single('resume'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded.' });
    }

    const student = await db.students.findByUserId(req.user!.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Construct public URL
    const relativeUrl = `/uploads/resumes/${req.file.filename}`;
    const resumeFileName = req.file.originalname;

    const updated = await db.students.findByIdAndUpdate(student._id.toString(), {
      resumeUrl: relativeUrl,
      resumeFileName,
      resumeUpdatedAt: new Date(),
    });

    return res.json({
      success: true,
      message: 'Resume uploaded and stored successfully.',
      resumeUrl: relativeUrl,
      resumeFileName,
      student: updated,
    });
  } catch (err: any) {
    console.error('Resume upload error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload resume.', error: err.message });
  }
});


// GET /api/students/jobs/:id/eligibility
studentRouter.get('/jobs/:id/eligibility', async (req: AuthRequest, res: Response) => {
  try {
    const student = await db.students.findByUserId(req.user!.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const job = await db.jobs.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const evaluation = evaluateBackendEligibility(student, job);

    return res.json({
      success: true,
      jobId: job._id,
      companyName: job.companyName,
      roleTitle: job.jobTitle,
      ...evaluation,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Eligibility evaluation failed.', error: err.message });
  }
});

// POST /api/students/jobs/:id/apply
studentRouter.post('/jobs/:id/apply', async (req: AuthRequest, res: Response) => {
  try {
    const student = await db.students.findByUserId(req.user!.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const job = await db.jobs.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    // Backend security requirement: Strict eligibility evaluation
    const evaluation = evaluateBackendEligibility(student, job);
    if (!evaluation.isEligible) {
      return res.status(403).json({
        success: false,
        message: 'Eligibility criteria unmet. Application cannot be accepted.',
        reasons: evaluation.reasons,
      });
    }

    // Check duplicate application
    const existing = await db.applications.findOne(
      (a: any) =>
        a.student.toString() === student._id.toString() && a.job.toString() === job._id.toString(),
      { student: student._id, job: job._id }
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate Application: You have already applied for this campus drive.',
      });
    }

    const newApplication = await db.applications.create({
      student: student._id,
      job: job._id,
      studentName: student.name,
      studentRollNumber: student.rollNumber,
      studentBranch: student.department,
      studentCgpa: student.cgpa,
      studentBacklogs: student.activeBacklogs,
      resumeUrl: student.resumeUrl || `/uploads/resumes/${student.rollNumber}_resume.pdf`,
      resumeFileName: student.resumeFileName || `${student.name.replace(/\s+/g, '_')}_Resume.pdf`,
      applicationDate: new Date().toISOString().split('T')[0],
      currentStatus: 'Applied',
      statusHistory: [
        {
          stage: 'Applied',
          timestamp: new Date().toLocaleString(),
          note: 'Application verified and submitted via CareerBridge MERN API',
        },
      ],
    });

    // Notify recruiter
    if (job.recruiter) {
      await createNotification({
        userId: job.recruiter.toString(),
        title: 'New Applicant for ' + job.jobTitle,
        message: `${student.name} (${student.rollNumber} · ${student.department} · CGPA ${student.cgpa}) applied for ${job.jobTitle}.`,
        notificationType: 'application_status',
        relatedId: newApplication._id.toString(),
      });
    }

    return res.status(201).json({
      success: true,
      message: `Application submitted successfully for ${job.companyName} (${job.jobTitle})!`,
      application: newApplication,
    });
  } catch (err: any) {
    console.error('Apply error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process application.', error: err.message });
  }
});

// GET /api/students/applications
studentRouter.get('/applications', async (req: AuthRequest, res: Response) => {
  try {
    const student = await db.students.findByUserId(req.user!.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const applications = await db.applications.find(
      (a: any) => a.student.toString() === student._id.toString()
    );

    return res.json({ success: true, count: applications.length, applications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching applications.', error: err.message });
  }
});
