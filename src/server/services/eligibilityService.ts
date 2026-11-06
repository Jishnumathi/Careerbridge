export interface EligibilityEvaluation {
  isEligible: boolean;
  reasons: string[];
  passedCriteria: string[];
  matchScore: number;
}

export function evaluateBackendEligibility(student: any, job: any): EligibilityEvaluation {
  const reasons: string[] = [];
  const passedCriteria: string[] = [];
  let totalCriteria = 0;
  let passedCount = 0;

  // 1. Academic Verification by TPO
  totalCriteria++;
  if (!student.isVerifiedByTpo) {
    reasons.push('Student academic profile is pending official TPO verification.');
  } else {
    passedCount++;
    passedCriteria.push('Student profile verified by TPO');
  }

  // 2. Minimum CGPA Cut-off
  totalCriteria++;
  const studentCgpa = Number(student.cgpa || 0);
  const minCgpa = Number(job.minCgpa || 0);
  if (studentCgpa < minCgpa) {
    reasons.push(
      `CGPA Cut-off: Requires minimum ${minCgpa.toFixed(2)}, candidate has ${studentCgpa.toFixed(2)}.`
    );
  } else {
    passedCount++;
    passedCriteria.push(`CGPA: ${studentCgpa.toFixed(2)} meets minimum requirement of ${minCgpa.toFixed(2)}`);
  }

  // 3. Eligible Department / Branch
  totalCriteria++;
  const eligibleBranches: string[] = job.eligibleBranches || ['All Branches'];
  const studentBranch = student.department || student.branch || '';
  const isBranchAllowed =
    eligibleBranches.length === 0 ||
    eligibleBranches.includes('All Branches') ||
    eligibleBranches.includes(studentBranch);

  if (!isBranchAllowed) {
    reasons.push(
      `Department Restriction: Candidate branch '${studentBranch}' is not eligible. Allowed: ${eligibleBranches.join(', ')}.`
    );
  } else {
    passedCount++;
    passedCriteria.push(`Department: '${studentBranch}' is eligible`);
  }

  // 4. Maximum Active Backlogs
  totalCriteria++;
  const activeBacklogs = Number(student.activeBacklogs || 0);
  const maxBacklogs = Number(job.maxBacklogs ?? 0);
  if (activeBacklogs > maxBacklogs) {
    reasons.push(
      `Active Backlogs: Allowed max is ${maxBacklogs}, candidate currently has ${activeBacklogs}.`
    );
  } else {
    passedCount++;
    passedCriteria.push(`Active Backlogs: ${activeBacklogs} within limit (Max ${maxBacklogs})`);
  }

  // 5. 10th Percentage Score
  if (job.minTenthPercentage && Number(job.minTenthPercentage) > 0) {
    totalCriteria++;
    const tenth = Number(student.tenthPercentage || 0);
    const min10th = Number(job.minTenthPercentage);
    if (tenth < min10th) {
      reasons.push(`10th Grade Score: Requires minimum ${min10th}%, candidate has ${tenth}%.`);
    } else {
      passedCount++;
      passedCriteria.push(`10th Grade Score: ${tenth}% meets minimum ${min10th}%`);
    }
  }

  // 6. 12th Percentage Score
  if (job.minTwelfthPercentage && Number(job.minTwelfthPercentage) > 0) {
    totalCriteria++;
    const twelfth = Number(student.twelfthPercentage || 0);
    const min12th = Number(job.minTwelfthPercentage);
    if (twelfth < min12th) {
      reasons.push(`12th / Diploma Score: Requires minimum ${min12th}%, candidate has ${twelfth}%.`);
    } else {
      passedCount++;
      passedCriteria.push(`12th / Diploma Score: ${twelfth}% meets minimum ${min12th}%`);
    }
  }

  // 7. Application Deadline Check
  if (job.applicationDeadline) {
    totalCriteria++;
    const today = new Date().toISOString().split('T')[0];
    if (today > job.applicationDeadline) {
      reasons.push(`Application Deadline Expired: Deadline was ${job.applicationDeadline}.`);
    } else {
      passedCount++;
      passedCriteria.push(`Application Deadline: Open until ${job.applicationDeadline}`);
    }
  }

  // 8. Job Active Status
  if (job.jobStatus && job.jobStatus !== 'active') {
    totalCriteria++;
    reasons.push('Job Posting Closed: This drive is no longer accepting new applicants.');
  }

  const isEligible = reasons.length === 0;
  const matchScore = totalCriteria > 0 ? Math.round((passedCount / totalCriteria) * 100) : 100;

  return {
    isEligible,
    reasons,
    passedCriteria,
    matchScore,
  };
}
