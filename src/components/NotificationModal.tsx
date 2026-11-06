import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Bell, CheckCheck, Clock, Award, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadNotifCount, markNotificationRead, markAllNotificationsRead } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'offer_extended':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'interview_scheduled':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'profile_verified':
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Placement Notifications</h3>
            {unreadNotifCount > 0 && (
              <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {unreadNotifCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadNotifCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id || n.id}
                onClick={() => {
                  if (!n.isRead) markNotificationRead(n._id || n.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-indigo-50/70 border-indigo-200 text-slate-900 font-medium shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                    {getIcon(n.notificationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
