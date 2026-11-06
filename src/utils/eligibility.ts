import { StudentProfile, Job, EligibilityResult } from '../types';

/**
 * CareerBridge Smart Eligibility Checker
 * Evaluates candidate qualifications against company criteria.
 */
export function checkEligibility(student: StudentProfile, job: Job): EligibilityResult {
  const reasons: string[] = [];
  const passedCriteria: string[] = [];
  let criteriaCount = 0;
  let passedCount = 0;

  // 1. TPO Verification check
  criteriaCount++;
  if (!student.isVerifiedByTpo) {
    reasons.push('Student academic profile is pending verification by Placement Cell (TPO).');
  } else {
    passedCount++;
    passedCriteria.push('Student academic profile is verified by TPO');
  }

  // 2. CGPA Check
  criteriaCount++;
  if (student.cgpa < job.minCgpa) {
    reasons.push(
      `CGPA requirement unmet: Job requires minimum ${job.minCgpa.toFixed(2)}, your CGPA is ${student.cgpa.toFixed(2)}.`
    );
  } else {
    passedCount++;
    passedCriteria.push(`CGPA: ${student.cgpa.toFixed(2)} meets minimum requirement of ${job.minCgpa.toFixed(2)}`);
  }

  // 3. Branch Eligibility
  criteriaCount++;
  const isBranchAllowed =
    job.eligibleBranches.length === 0 ||
    job.eligibleBranches.includes('All Branches') ||
    job.eligibleBranches.includes(student.branch);

  if (!isBranchAllowed) {
    reasons.push(
      `Branch restriction: ${student.branch} is not eligible for this role. Eligible branches: ${job.eligibleBranches.join(', ')}.`
    );
  } else {
    passedCount++;
    passedCriteria.push(`Branch: ${student.branch} is eligible`);
  }

  // 4. Active Backlogs Check
  criteriaCount++;
  if (student.activeBacklogs > job.maxActiveBacklogs) {
    reasons.push(
      `Active backlogs exceeded: Allowed max ${job.maxActiveBacklogs}, you have ${student.activeBacklogs} active backlog(s).`
    );
  } else {
    passedCount++;
    passedCriteria.push(
      `Active Backlogs: ${student.activeBacklogs} (Allowed: max ${job.maxActiveBacklogs})`
    );
  }

  // 5. Historical Backlogs Check (if specified)
  if (job.maxHistoryBacklogs !== undefined) {
    criteriaCount++;
    if (student.historyBacklogs > job.maxHistoryBacklogs) {
      reasons.push(
        `Dead/Historical backlogs exceeded: Allowed max ${job.maxHistoryBacklogs}, you have ${student.historyBacklogs}.`
      );
    } else {
      passedCount++;
      passedCriteria.push(`History Backlogs: ${student.historyBacklogs} (Allowed: max ${job.maxHistoryBacklogs})`);
    }
  }

  // 6. 10th Standard Percentage
  if (job.minTenthPercentage > 0) {
    criteriaCount++;
    if (student.tenthPercentage < job.minTenthPercentage) {
      reasons.push(
        `10th Grade score: Requires min ${job.minTenthPercentage}%, your score is ${student.tenthPercentage}%.`
      );
    } else {
      passedCount++;
      passedCriteria.push(`10th Grade score: ${student.tenthPercentage}% meets minimum ${job.minTenthPercentage}%`);
    }
  }

  // 7. 12th / Diploma Percentage
  if (job.minTwelfthPercentage > 0) {
    criteriaCount++;
    if (student.twelfthPercentage < job.minTwelfthPercentage) {
      reasons.push(
        `12th / Diploma score: Requires min ${job.minTwelfthPercentage}%, your score is ${student.twelfthPercentage}%.`
      );
    } else {
      passedCount++;
      passedCriteria.push(
        `12th / Diploma score: ${student.twelfthPercentage}% meets minimum ${job.minTwelfthPercentage}%`
      );
    }
  }

  const isEligible = reasons.length === 0;
  const matchScore = Math.round((passedCount / criteriaCount) * 100);

  return {
    isEligible,
    reasons,
    passedCriteria,
    matchScore,
  };
}
