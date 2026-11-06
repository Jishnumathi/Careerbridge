import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  UserCheck,
  Building2,
  Shield,
  ChevronDown,
  Check,
  Bell,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react';

interface TopNavigationProps {
  currentUser: User;
  activeRole: UserRole;
  onRoleChange: (user: any) => void;
  allUsers: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openNoticeCount: number;
  unreadNotifCount: number;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentUser,
  activeRole,
  onRoleChange,
  allUsers,
  activeTab,
  setActiveTab,
  openNoticeCount,
  unreadNotifCount,
  onOpenNotifications,
  onOpenAuth,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Normalized active role
  const normalizedRole = activeRole === 'admin' ? 'tpo' : activeRole;

  // Nav links based on active portal context
  const getNavLinks = () => {
    if (normalizedRole === 'student') {
      return [
        { id: 'jobs', label: 'Opportunities' },
        { id: 'applications', label: 'Applications' },
        { id: 'profile', label: 'Resume & Profile' },
        { id: 'prep', label: 'Interview Prep' },
        { id: 'notices', label: `Notices (${openNoticeCount})` },
      ];
    } else if (normalizedRole === 'recruiter') {
      return [
        { id: 'applicants', label: 'Candidate Pipeline' },
        { id: 'jobs', label: 'Manage Drives' },
        { id: 'post_job', label: 'Post Campus Drive' },
        { id: 'company_profile', label: 'Company Info' },
      ];
    } else {
      // TPO Placement Administrator
      return [
        { id: 'analytics', label: 'Placement Analytics' },
        { id: 'students', label: 'Student Registry' },
        { id: 'drives', label: 'Drive Approvals' },
        { id: 'notices', label: 'Announcements' },
        { id: 'reports', label: 'Accreditation Reports' },
      ];
    }
  };

  const roleLabel =
    normalizedRole === 'student' ? 'Student' : normalizedRole === 'recruiter' ? 'Recruiter' : 'TPO Admin';

  const roleIcon =
    normalizedRole === 'student' ? (
      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
    ) : normalizedRole === 'recruiter' ? (
      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
    ) : (
      <Shield className="w-3.5 h-3.5 text-purple-600" />
    );

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span
              onClick={() => setActiveTab(getNavLinks()[0].id)}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors"
            >
              CareerBridge
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">/</span>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-600">
              Campus Placement MERN Platform
            </span>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {getNavLinks().map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action - Notifications & User Switcher */}
          <div className="flex items-center gap-2.5 shrink-0 relative">
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Placement Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Quick Role & User Profile Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 whitespace-nowrap"
              >
                <span className="flex items-center gap-1.5">
                  {roleIcon}
                  <span className="font-semibold text-slate-900">{roleLabel}:</span>
                  <span className="text-slate-600 truncate max-w-[110px]">{currentUser.name}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Role Switcher Menu */}
              {isRoleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-left"
                  onMouseLeave={() => setIsRoleDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Authenticated Session (JWT)
                      </p>
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        onOpenAuth();
                      }}
                      className="px-2 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      Sign In / Register
                    </button>
                  </div>

                  {/* Student Options */}
                  <div className="py-1">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">
                      Graduating Students (Batch 2026)
                    </div>
                    {allUsers
                      .filter((u) => u.role === 'student')
                      .map((u) => (
                        <button
                          key={u._id || u.id}
                          onClick={() => {
                            onRoleChange(u);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 ${
                            currentUser.id === (u._id || u.id)
                              ? 'bg-indigo-50/70 font-semibold text-indigo-900'
                              : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.title || u.organization}</div>
                          </div>
                          {currentUser.id === (u._id || u.id) && (
                            <Check className="w-4 h-4 text-indigo-600" />
                          )}
                        </button>
                      ))}
                  </div>

                  {/* Recruiter Options */}
                  <div className="py-1 border-t border-slate-100">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">
                      Corporate Recruiters
                    </div>
                    {allUsers
                      .filter((u) => u.role === 'recruiter')
                      .map((u) => (
                        <button
                          key={u._id || u.id}
                          onClick={() => {
                            onRoleChange(u);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 ${
                            currentUser.id === (u._id || u.id)
                              ? 'bg-indigo-50/70 font-semibold text-indigo-900'
                              : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {u.organization} · Campus Recruiter
                            </div>
                          </div>
                          {currentUser.id === (u._id || u.id) && (
                            <Check className="w-4 h-4 text-indigo-600" />
                          )}
                        </button>
                      ))}
                  </div>

                  {/* TPO Admin Options */}
                  <div className="py-1 border-t border-slate-100">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">
                      Training & Placement Office (TPO)
                    </div>
                    {allUsers
                      .filter((u) => u.role === 'admin' || u.role === 'tpo')
                      .map((u) => (
                        <button
                          key={u._id || u.id}
                          onClick={() => {
                            onRoleChange(u);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 ${
                            currentUser.id === (u._id || u.id)
                              ? 'bg-indigo-50/70 font-semibold text-indigo-900'
                              : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">
                              Dean of Placement & Corporate Relations
                            </div>
                          </div>
                          {currentUser.id === (u._id || u.id) && (
                            <Check className="w-4 h-4 text-indigo-600" />
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 gap-4 text-xs font-medium text-slate-600 bg-slate-50">
        {getNavLinks().map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md ${
              activeTab === link.id
                ? 'bg-indigo-600 text-white font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
};
