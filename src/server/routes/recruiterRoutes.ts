import { Router, Response } from 'express';
import { db } from '../db/database';
import { protect, authorizeRoles, AuthRequest } from '../middleware/authMiddleware';
import { createNotification } from '../services/notificationService';

export const recruiterRouter = Router();

recruiterRouter.use(protect);
recruiterRouter.use(authorizeRoles('recruiter', 'admin'));

// POST /api/recruiters/jobs
recruiterRouter.post('/jobs', async (req: AuthRequest, res: Response) => {
  try {
    const {
      companyName,
      companyWebsite,
      jobTitle,
      jobType,
      location,
      workMode,
      salaryRange,
      stipendPerMonth,
      description,
      responsibilities,
      requirements,
      requiredSkills,
      minCgpa,
      eligibleBranches,
      maxBacklogs,
      maxHistoryBacklogs,
      minTenthPercentage,
      minTwelfthPercentage,
      applicationDeadline,
      driveDate,
      selectionRounds,
    } = req.body;

    if (!jobTitle || !salaryRange || !applicationDeadline || !driveDate) {
      return res.status(400).json({
        success: false,
        message: 'Job title, salary range (LPA), deadline, and drive date are required.',
      });
    }

    const ctc = Number(salaryRange);
    const category = ctc >= 20 ? 'Super Dream' : ctc >= 10 ? 'Dream' : 'Standard';

    const newJob = await db.jobs.create({
      recruiter: req.user!.id,
      companyName: companyName || req.user!.organization || 'Enterprise Recruiter',
      companyLogo: '',
      companyWebsite: companyWebsite || '',
      jobTitle,
      jobType: jobType || 'Full-time',
      location: location || 'Bengaluru / Hyderabad',
      workMode: workMode || 'Hybrid',
      salaryRange: ctc,
      stipendPerMonth: Number(stipendPerMonth || 0),
      category,
      description: description || 'Exciting campus recruitment opportunity.',
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      minCgpa: Number(minCgpa || 6.5),
      eligibleBranches: Array.isArray(eligibleBranches) && eligibleBranches.length > 0 ? eligibleBranches : ['All Branches'],
      maxBacklogs: Number(maxBacklogs || 0),
      maxHistoryBacklogs: Number(maxHistoryBacklogs || 0),
      minTenthPercentage: Number(minTenthPercentage || 60),
      minTwelfthPercentage: Number(minTwelfthPercentage || 60),
      applicationDeadline,
      driveDate,
      selectionRounds: Array.isArray(selectionRounds) && selectionRounds.length > 0 ? selectionRounds : ['Online Assessment', 'Technical Interview 1', 'HR Round'],
      jobStatus: 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Campus recruitment drive posted successfully.',
      job: newJob,
    });
  } catch (err: any) {
    console.error('Job creation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create job posting.', error: err.message });
  }
});

// GET /api/recruiters/jobs
recruiterRouter.get('/jobs', async (_req: AuthRequest, res: Response) => {
  try {
    const jobs = await db.jobs.find();
    return res.json({ success: true, count: jobs.length, jobs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving jobs.', error: err.message });
  }
});

// GET /api/recruiters/applications
recruiterRouter.get('/applications', async (req: AuthRequest, res: Response) => {
  try {
    let applications: any[];
    if (req.user!.role === 'admin') {
      applications = await db.applications.find();
    } else {
      const userOrg = (req.user!.organization || '').toLowerCase();
      const myJobs = await db.jobs.find((j: any) => {
        const isOwner = j.recruiter?.toString() === req.user!.id;
        const matchesOrg = Boolean(userOrg && j.companyName?.toLowerCase() === userOrg);
        return isOwner || matchesOrg;
      });
      const jobIds = new Set(myJobs.map((j: any) => j._id?.toString()));
      applications = await db.applications.find((a: any) => jobIds.has(a.job?.toString()));
      // If no applications specific to their own jobs yet, return all applications
      if (applications.length === 0) {
        applications = await db.applications.find();
      }
    }
    return res.json({ success: true, count: applications.length, applications });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving applications.', error: err.message });
  }
});

// GET /api/recruiters/students
recruiterRouter.get('/students', async (_req: AuthRequest, res: Response) => {
  try {
    const students = await db.students.find();
    return res.json({ success: true, count: students.length, students });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving student profiles.', error: err.message });
  }
});

// PUT /api/recruiters/jobs/:id
recruiterRouter.put('/jobs/:id', async (req: AuthRequest, res: Response) => {
  try {
    const job = await db.jobs.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Authorization check
    if (req.user!.role !== 'admin' && job.recruiter?.toString() !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to edit this job.' });
    }

    const updatedJob = await db.jobs.findByIdAndUpdate(req.params.id, req.body);
    return res.json({ success: true, message: 'Job updated successfully.', job: updatedJob });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error updating job.', error: err.message });
  }
});

// DELETE /api/recruiters/jobs/:id
recruiterRouter.delete('/jobs/:id', async (req: AuthRequest, res: Response) => {
  try {
    const job = await db.jobs.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (req.user!.role !== 'admin' && job.recruiter?.toString() !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to delete this job.' });
    }

    await db.jobs.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Job removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error deleting job.', error: err.message });
  }
});

// GET /api/recruiters/jobs/:id/applicants
recruiterRouter.get('/jobs/:id/applicants', async (req: AuthRequest, res: Response) => {
  try {
    const job = await db.jobs.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const applicants = await db.applications.find(
      (a: any) => a.job?.toString() === req.params.id
    );

    return res.json({
      success: true,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      count: applicants.length,
      applicants,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving applicants.', error: err.message });
  }
});

// PATCH /api/recruiters/applications/:id/status
recruiterRouter.patch('/applications/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status, remarks, offerDetails, interviewSchedule } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'New recruitment status is required.' });
    }

    const application = await db.applications.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    const job = await db.jobs.findById(application.job?.toString());

    const newHistoryItem = {
      stage: status,
      timestamp: new Date().toLocaleString(),
      note: remarks || `Application stage advanced to ${status}`,
    };

    const updates: any = {
      currentStatus: status,
      statusHistory: [...(application.statusHistory || []), newHistoryItem],
    };

    if (remarks) updates.recruiterRemarks = remarks;
    if (interviewSchedule) updates.interviewSchedule = interviewSchedule;
    if (offerDetails) updates.offerLetter = offerDetails;

    const updatedApp = await db.applications.findByIdAndUpdate(req.params.id, updates);

    // If Offered: update student placement status in database!
    if (status === 'Offered' && offerDetails && application.student) {
      await db.students.findByIdAndUpdate(application.student.toString(), {
        placementStatus: 'Placed',
        placedDetails: {
          company: job?.companyName || 'Corporate Partner',
          ctcLpa: Number(offerDetails.ctcLpa || job?.salaryRange || 20),
          offerDate: new Date().toISOString().split('T')[0],
          role: offerDetails.role || job?.jobTitle || 'Software Engineer',
        },
      });
    }

    // Dispatch real in-app notification to the candidate!
    const student = await db.students.findById(application.student?.toString());
    if (student && student.user) {
      let notifTitle = `Application Update: ${status}`;
      let notifMsg = `Your application for ${job?.companyName || 'Campus Drive'} has been updated to "${status}".`;

      if (status === 'Offered') {
        notifTitle = 'Official Campus Placement Offer Extended!';
        notifMsg = `Congratulations! ${job?.companyName} has extended an official campus offer (${offerDetails?.ctcLpa || job?.salaryRange} LPA).`;
      } else if (status === 'Technical Interview' || status === 'Online Assessment') {
        notifTitle = `Interview Round: ${status}`;
        notifMsg = `You have been shortlisted for the ${status} round with ${job?.companyName}.`;
      }

      await createNotification({
        userId: student.user.toString(),
        title: notifTitle,
        message: notifMsg,
        notificationType: status === 'Offered' ? 'offer_extended' : 'application_status',
        relatedId: application._id.toString(),
      });
    }

    return res.json({
      success: true,
      message: `Candidate stage updated to '${status}'.`,
      application: updatedApp,
    });
  } catch (err: any) {
    console.error('Update status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update application status.', error: err.message });
  }
});

// POST /api/recruiters/interviews
recruiterRouter.post('/interviews', async (req: AuthRequest, res: Response) => {
  try {
    const {
      applicationId,
      interviewRound,
      interviewDate,
      interviewTime,
      mode,
      venueOrMeetingLink,
      instructions,
    } = req.body;

    if (!applicationId || !interviewDate || !interviewTime || !venueOrMeetingLink) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, interview date, time, and venue/meeting link are required.',
      });
    }

    const application = await db.applications.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const interview = await db.interviews.create({
      application: application._id,
      student: application.student,
      job: application.job,
      recruiter: req.user!.id,
      interviewRound: interviewRound || 'Technical Interview',
      interviewDate,
      interviewTime,
      mode: mode || 'Virtual (Google Meet)',
      venueOrMeetingLink,
      instructions: instructions || 'Please join on time with your university ID.',
      interviewResult: 'Scheduled',
    });

    // Update application schedule and advance stage to Technical Interview
    await db.applications.findByIdAndUpdate(applicationId, {
      currentStatus: 'Technical Interview',
      interviewSchedule: {
        interviewId: interview._id,
        date: interviewDate,
        time: interviewTime,
        mode,
        linkOrVenue: venueOrMeetingLink,
        instructions,
      },
      statusHistory: [
        ...(application.statusHistory || []),
        {
          stage: 'Technical Interview',
          timestamp: new Date().toLocaleString(),
          note: `Interview scheduled on ${interviewDate} at ${interviewTime} (${mode})`,
        },
      ],
    });

    // Notify student
    const student = await db.students.findById(application.student?.toString());
    const job = await db.jobs.findById(application.job?.toString());
    if (student && student.user) {
      await createNotification({
        userId: student.user.toString(),
        title: `Interview Scheduled with ${job?.companyName || 'Recruiter'}`,
        message: `Your ${interviewRound || 'Technical Interview'} is set for ${interviewDate} at ${interviewTime} (${mode} - ${venueOrMeetingLink}).`,
        notificationType: 'interview_scheduled',
        relatedId: application._id.toString(),
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Interview successfully scheduled and call letter dispatched.',
      interview,
    });
  } catch (err: any) {
    console.error('Schedule interview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to schedule interview.', error: err.message });
  }
});
