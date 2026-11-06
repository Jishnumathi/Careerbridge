import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, UserRole } from '../types';
import { authApi, studentApi, notificationApi } from '../api/client';

interface AuthContextType {
  currentUser: User | null;
  studentProfile: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: any[];
  unreadNotifCount: number;
  demoUsers: any[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  switchUser: (user: any) => Promise<void>;
  refreshStudentProfile: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('careerbridge_jwt_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  // Load demo users and active session on mount
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      try {
        // Fetch demo users for 1-click test switcher
        const demoRes = await authApi.getDemoUsers();
        if (demoRes.success && demoRes.users) {
          setDemoUsers(demoRes.users);
        }

        const storedToken = localStorage.getItem('careerbridge_jwt_token');
        if (storedToken) {
          try {
            const meRes = await authApi.getMe();
            if (meRes.success && meRes.user) {
              setCurrentUser({
                id: meRes.user._id,
                _id: meRes.user._id,
                name: meRes.user.name,
                email: meRes.user.email,
                role: meRes.user.role === 'admin' ? 'admin' : (meRes.user.role as UserRole),
                organization: meRes.user.organization,
                avatar: meRes.user.avatar,
              });

              if (meRes.profile) {
                setStudentProfile(formatStudentProfile(meRes.profile));
              }
            }
          } catch (err) {
            console.warn('Session expired or invalid token:', err);
            localStorage.removeItem('careerbridge_jwt_token');
            setToken(null);
          }
        } else if (demoRes.users && demoRes.users.length > 0) {
          // Default to first student demo user for seamless preview
          const firstStudent = demoRes.users[0];
          await switchUser(firstStudent);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  // Sync notifications periodically or when user changes
  useEffect(() => {
    if (token && currentUser) {
      refreshNotifications();
    }
  }, [token, currentUser?.id]);

  function formatStudentProfile(raw: any): StudentProfile {
    return {
      id: raw._id?.toString() || raw.id,
      _id: raw._id?.toString(),
      userId: raw.user?.toString() || raw.userId,
      rollNumber: raw.rollNumber,
      name: raw.name,
      email: raw.email,
      phone: raw.phone || '',
      branch: raw.department || raw.branch || 'Computer Science',
      department: raw.department || raw.branch || 'Computer Science',
      batch: raw.graduationYear || raw.batch || '2026',
      graduationYear: raw.graduationYear || raw.batch || '2026',
      cgpa: Number(raw.cgpa || 0),
      activeBacklogs: Number(raw.activeBacklogs || 0),
      historyBacklogs: Number(raw.historyBacklogs || 0),
      tenthPercentage: Number(raw.tenthPercentage || 0),
      twelfthPercentage: Number(raw.twelfthPercentage || 0),
      skills: Array.isArray(raw.skills) ? raw.skills : [],
      certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
      resumeUrl: raw.resumeUrl || '',
      resumeFileName: raw.resumeFileName || 'Resume.pdf',
      resumeUpdatedAt: raw.resumeUpdatedAt ? new Date(raw.resumeUpdatedAt).toISOString().split('T')[0] : '2026-10-18',
      linkedinUrl: raw.linkedinUrl || '',
      githubUrl: raw.githubUrl || '',
      portfolioUrl: raw.portfolioUrl || '',
      isVerifiedByTpo: Boolean(raw.isVerifiedByTpo),
      tpoVerificationDate: raw.tpoVerificationDate ? new Date(raw.tpoVerificationDate).toISOString().split('T')[0] : undefined,
      placementStatus: raw.placementStatus || 'Unplaced',
      placedDetails: raw.placedDetails,
    };
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem('careerbridge_jwt_token', res.token);
        setToken(res.token);
        setCurrentUser({
          id: res.user._id,
          _id: res.user._id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          organization: res.user.organization,
        });

        // Load profile
        if (res.user.role === 'student') {
          const profRes = await studentApi.getProfile();
          if (profRes.success && profRes.student) {
            setStudentProfile(formatStudentProfile(profRes.student));
          }
        }
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const res = await authApi.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('careerbridge_jwt_token', res.token);
        setToken(res.token);
        setCurrentUser({
          id: res.user._id,
          _id: res.user._id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          organization: res.user.organization,
        });

        if (res.user.role === 'student') {
          const profRes = await studentApi.getProfile();
          if (profRes.success && profRes.student) {
            setStudentProfile(formatStudentProfile(profRes.student));
          }
        }
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('careerbridge_jwt_token');
    setToken(null);
    setCurrentUser(null);
    setStudentProfile(null);
  };

  const switchUser = async (userObj: any) => {
    try {
      if (userObj.token) {
        localStorage.setItem('careerbridge_jwt_token', userObj.token);
        setToken(userObj.token);
        setCurrentUser({
          id: userObj._id || userObj.id,
          _id: userObj._id || userObj.id,
          name: userObj.name,
          email: userObj.email,
          role: userObj.role,
          organization: userObj.organization,
          title: userObj.title,
        });

        if (userObj.role === 'student') {
          try {
            const profRes = await studentApi.getProfile();
            if (profRes.success && profRes.student) {
              setStudentProfile(formatStudentProfile(profRes.student));
            }
          } catch (e) {
            console.warn('Could not fetch student profile for switched user:', e);
          }
        } else {
          setStudentProfile(null);
        }

        await refreshNotifications();
      }
    } catch (err) {
      console.error('Error switching user:', err);
    }
  };

  const refreshStudentProfile = async () => {
    try {
      const profRes = await studentApi.getProfile();
      if (profRes.success && profRes.student) {
        setStudentProfile(formatStudentProfile(profRes.student));
      }
    } catch (err) {
      console.error('Failed to refresh student profile:', err);
    }
  };

  const refreshNotifications = async () => {
    try {
      const notifRes = await notificationApi.getNotifications();
      if (notifRes.success) {
        setNotifications(notifRes.notifications || []);
        setUnreadNotifCount(notifRes.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail if network transient
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentProfile,
        token,
        isAuthenticated: !!token && !!currentUser,
        isLoading,
        notifications,
        unreadNotifCount,
        demoUsers,
        login,
        register,
        logout,
        switchUser,
        refreshStudentProfile,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
