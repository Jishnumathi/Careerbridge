import axios from 'axios';

// Create configured Axios instance
export const api = axios.create({
  baseURL: '', // Uses same host port 3000 where Express is running
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careerbridge_jwt_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error extracting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected network error occurred.';
    return Promise.reject(new Error(message));
  }
);

// 1. Authentication APIs
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  },
  register: async (userData: any) => {
    const res = await api.post('/api/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
  getDemoUsers: async () => {
    const res = await api.get('/api/auth/demo-users');
    return res.data;
  },
};

// 2. Student APIs
export const studentApi = {
  getProfile: async () => {
    const res = await api.get('/api/students/profile');
    return res.data;
  },
  updateProfile: async (profileData: any) => {
    const res = await api.put('/api/students/profile', profileData);
    return res.data;
  },
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await api.post('/api/students/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getJobs: async () => {
    const res = await api.get('/api/students/jobs');
    return res.data;
  },
  checkEligibility: async (jobId: string) => {
    const res = await api.get(`/api/students/jobs/${jobId}/eligibility`);
    return res.data;
  },
  applyJob: async (jobId: string) => {
    const res = await api.post(`/api/students/jobs/${jobId}/apply`);
    return res.data;
  },
  getApplications: async () => {
    const res = await api.get('/api/students/applications');
    return res.data;
  },
};

// 3. Recruiter APIs
export const recruiterApi = {
  getJobs: async () => {
    const res = await api.get('/api/recruiters/jobs');
    return res.data;
  },
  getApplications: async () => {
    const res = await api.get('/api/recruiters/applications');
    return res.data;
  },
  getStudents: async () => {
    const res = await api.get('/api/recruiters/students');
    return res.data;
  },
  createJob: async (jobData: any) => {
    const res = await api.post('/api/recruiters/jobs', jobData);
    return res.data;
  },
  updateJob: async (jobId: string, jobData: any) => {
    const res = await api.put(`/api/recruiters/jobs/${jobId}`, jobData);
    return res.data;
  },
  deleteJob: async (jobId: string) => {
    const res = await api.delete(`/api/recruiters/jobs/${jobId}`);
    return res.data;
  },
  getApplicants: async (jobId: string) => {
    const res = await api.get(`/api/recruiters/jobs/${jobId}/applicants`);
    return res.data;
  },
  updateApplicationStatus: async (
    applicationId: string,
    status: string,
    meta?: {
      remarks?: string;
      interviewSchedule?: any;
      offerDetails?: any;
    }
  ) => {
    const res = await api.patch(`/api/recruiters/applications/${applicationId}/status`, {
      status,
      remarks: meta?.remarks,
      interviewSchedule: meta?.interviewSchedule,
      offerDetails: meta?.offerDetails,
    });
    return res.data;
  },
  scheduleInterview: async (data: {
    applicationId: string;
    interviewRound: string;
    interviewDate: string;
    interviewTime: string;
    mode: string;
    venueOrMeetingLink: string;
    instructions?: string;
  }) => {
    const res = await api.post('/api/recruiters/interviews', data);
    return res.data;
  },
};

// 4. Administrator APIs
export const adminApi = {
  getDashboard: async () => {
    const res = await api.get('/api/admin/dashboard');
    return res.data;
  },
  getStudents: async () => {
    const res = await api.get('/api/admin/students');
    return res.data;
  },
  verifyStudent: async (studentId: string, verified: boolean) => {
    const res = await api.patch(`/api/admin/students/${studentId}/verify`, { verified });
    return res.data;
  },
  getRecruiters: async () => {
    const res = await api.get('/api/admin/recruiters');
    return res.data;
  },
  verifyRecruiter: async (recruiterId: string, verified: boolean) => {
    const res = await api.patch(`/api/admin/recruiters/${recruiterId}/verify`, { verified });
    return res.data;
  },
  getJobs: async () => {
    const res = await api.get('/api/admin/jobs');
    return res.data;
  },
  getApplications: async () => {
    const res = await api.get('/api/admin/applications');
    return res.data;
  },
  getPlacementReport: async () => {
    const res = await api.get('/api/admin/reports/placements');
    return res.data;
  },
  createNotice: async (noticeData: any) => {
    const res = await api.post('/api/admin/notices', noticeData);
    return res.data;
  },
  deleteNotice: async (noticeId: string) => {
    const res = await api.delete(`/api/admin/notices/${noticeId}`);
    return res.data;
  },
};

// 5. Notification & Notice APIs
export const notificationApi = {
  getNotifications: async () => {
    const res = await api.get('/api/notifications');
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.patch(`/api/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch('/api/notifications/read-all');
    return res.data;
  },
  getPublicNotices: async () => {
    const res = await api.get('/api/notices');
    return res.data;
  },
};
