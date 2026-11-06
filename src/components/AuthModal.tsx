import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Building, GraduationCap, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  const [department, setDepartment] = useState('Computer Science');
  const [companyName, setCompanyName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
          onClose();
        }
      } else {
        const payload: any = {
          email,
          password,
          name,
          role,
        };

        if (role === 'student') {
          payload.department = department;
          payload.rollNumber = rollNumber || `22CS${Math.floor(1000 + Math.random() * 9000)}`;
        } else {
          payload.companyName = companyName || 'Enterprise Partner';
        }

        const success = await register(payload);
        if (success) {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'login' ? 'Sign In to CareerBridge' : 'Register Campus Account'}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? 'Enter your credentials to access your placement portal'
                : 'Create a new verified Student or Recruiter account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 font-semibold transition-colors ${
                      role === 'student'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 font-semibold transition-colors ${
                      role === 'recruiter'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    Recruiter
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {role === 'student' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Comm">Electronics & Comm</option>
                      <option value="Mechanical Engg">Mechanical Engg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 22CS1045"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 uppercase font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Microsoft, Adobe"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="pt-2 text-center border-t border-slate-100">
            {mode === 'login' ? (
              <p className="text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Register as Student or Recruiter
                </button>
              </p>
            ) : (
              <p className="text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Sign In instead
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
