import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Loader2, UserCheck, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'login', onClose }) => {
  const {
    currentUser,
    userProfile,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    checkUsernameAvailability,
    updateUserProfile,
  } = useAuth();

  // Mode: 'auth' (step 1) or 'profile' (step 2)
  const [step, setStep] = useState<'auth' | 'profile'>('auth');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>(initialMode);

  // Email/Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Profile / Signup Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  // Status & Validation states
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | null>(
    null
  );

  // Initialize form or step when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setInfo(null);
    setAuthTab(initialMode);

    // If user is already logged in, close the modal directly
    if (currentUser && userProfile) {
      onClose();
    } else {
      setStep('auth');
    }
  }, [isOpen, currentUser, userProfile, initialMode, onClose]);

  // Debounced username availability checker
  useEffect(() => {
    const isSignupTab = step === 'auth' && authTab === 'signup';
    const isProfileStep = step === 'profile';

    if ((!isSignupTab && !isProfileStep) || !username.trim()) {
      setUsernameStatus(null);
      return;
    }

    const clean = username.trim();
    if (clean.length < 3 || !/^[a-zA-Z0-9_]+$/.test(clean)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailability(clean);
        setUsernameStatus(available ? 'available' : 'taken');
      } catch (err) {
        console.error('Error checking username:', err);
      } finally {
        setUsernameChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, step, authTab, checkUsernameAvailability]);

  if (!isOpen) return null;

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.message?.includes('closed') || err.message?.includes('cancel')) {
        return;
      }
      setError('failed to sign in with google: ' + (err.message || 'please check your setup'));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmail(cleanEmail, password);
      onClose();
    } catch (err: any) {
      console.error('Email Login Error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('invalid email or password. please try again.');
      } else {
        setError(err.message || 'failed to sign in with email.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Email Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const cleanEmail = email.trim();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanUsername = username.trim();

    if (!cleanFirst) {
      setError('please enter your first name');
      return;
    }

    if (!cleanLast) {
      setError('please enter your surname / last name');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('username must be at least 3 characters');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('username is already taken. please choose another.');
      return;
    }

    if (!cleanEmail) {
      setError('please enter your email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const { isNewUser } = await signupWithEmail(
        cleanEmail,
        password,
        cleanFirst,
        cleanLast,
        cleanUsername
      );

      if (isNewUser) {
        setInfo('account created successfully! if email confirmation is required, please check your inbox.');
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error('Email Signup Error:', err);
      if (err.message?.includes('User already registered')) {
        setError('an account with this email already exists. please sign in instead.');
      } else {
        setError(err.message || 'failed to create account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Save Profile Completion
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanUsername = username.trim();

    if (!cleanFirst) {
      setError('please enter your first name');
      return;
    }

    if (!cleanLast) {
      setError('please enter your surname / last name');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('username must be at least 3 characters');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('username is already taken. please choose another.');
      return;
    }

    setSubmitting(true);
    try {
      await updateUserProfile({
        firstName: cleanFirst,
        lastName: cleanLast,
        username: cleanUsername,
        usernameLower: cleanUsername.toLowerCase(),
        isProfileComplete: true,
      });

      onClose();
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError('failed to save profile: ' + (err.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 w-full max-w-md bg-[#1A1917] border border-[rgba(232,226,216,0.12)] rounded-xl p-6 sm:p-8 shadow-2xl text-[#E8E2D8] font-sans"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#9A9488] hover:text-[#E8E2D8] transition-colors rounded-lg hover:bg-[rgba(232,226,216,0.05)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Info Banner */}
          {info && (
            <div className="mb-4 p-3 bg-[#6FA85C]/10 border border-[#6FA85C]/30 rounded-lg flex items-center space-x-2 text-xs text-[#6FA85C]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{info}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-[#D64545]/10 border border-[#D64545]/30 rounded-lg flex items-center space-x-2 text-xs text-[#D64545]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'auth' ? (
            <div>
              {/* Auth Header & Mode Tabs */}
              <div className="mb-6">
                <div className="flex items-center justify-between border-b border-[rgba(232,226,216,0.12)] pb-3 mb-4">
                  <h2 className="text-xl font-medium tracking-tight text-[#E8E2D8]">
                    {authTab === 'login' ? 'sign in to qalampir' : 'create an account'}
                  </h2>
                  <div className="flex items-center gap-1 bg-[#0F0E0D] p-1 rounded-lg border border-[rgba(232,226,216,0.1)]">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('login');
                        setError(null);
                        setInfo(null);
                      }}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                        authTab === 'login'
                          ? 'bg-[#E85D3D] text-[#0F0E0D] font-medium'
                          : 'text-[#9A9488] hover:text-[#E8E2D8]'
                      }`}
                    >
                      sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('signup');
                        setError(null);
                        setInfo(null);
                      }}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                        authTab === 'signup'
                          ? 'bg-[#E85D3D] text-[#0F0E0D] font-medium'
                          : 'text-[#9A9488] hover:text-[#E8E2D8]'
                      }`}
                    >
                      sign up
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#9A9488] font-mono">
                  {authTab === 'login'
                    ? 'sign in to save your typing tests, track stats, and join the leaderboards'
                    : 'create your account to save typing scores and rank on leaderboards'}
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full bg-[#0F0E0D] hover:bg-[#151412] text-[#E8E2D8] border border-[rgba(232,226,216,0.15)] font-mono text-xs font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-3 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#E8E2D8]" />
                ) : (
                  <>
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center p-0.5 shrink-0">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-1.4-1.2-3.1-1.2-5z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                        />
                      </svg>
                    </div>
                    <span>continue with google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(232,226,216,0.12)]" />
                </div>
                <span className="relative bg-[#1A1917] px-3 text-[11px] font-mono text-[#9A9488]">
                  or continue with email
                </span>
              </div>

              {/* Email / Password Forms */}
              {authTab === 'login' ? (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                      email address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#9A9488] absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg pl-9 pr-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                      password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#9A9488] absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg pl-9 pr-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0F0E0D]" />
                    ) : (
                      <>
                        <span>sign in</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('signup');
                        setError(null);
                        setInfo(null);
                      }}
                      className="text-xs text-[#9A9488] hover:text-[#E85D3D] font-mono transition-colors cursor-pointer"
                    >
                      don't have an account? sign up
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleEmailSignup} className="space-y-3.5">
                  {/* First Name & Surname */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                        first name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Nodirbek"
                        className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg px-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                        surname *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Baratov"
                        className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg px-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-[#9A9488] font-mono">username *</label>
                      {usernameChecking && (
                        <span className="text-[10px] text-[#5C574C] flex items-center gap-1 font-mono">
                          <Loader2 className="w-3 h-3 animate-spin" /> checking...
                        </span>
                      )}
                      {!usernameChecking && usernameStatus === 'available' && (
                        <span className="text-[10px] text-[#6FA85C] flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> available
                        </span>
                      )}
                      {!usernameChecking && usernameStatus === 'taken' && (
                        <span className="text-[10px] text-[#D64545] flex items-center gap-1 font-mono">
                          <AlertCircle className="w-3 h-3" /> taken
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#9A9488] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. nodirbek"
                        className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg pl-9 pr-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                      email address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#9A9488] absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg pl-9 pr-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                      password (min 6 characters) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#9A9488] absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg pl-9 pr-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50 shadow-md mt-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0F0E0D]" />
                    ) : (
                      <>
                        <span>create account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('login');
                        setError(null);
                        setInfo(null);
                      }}
                      className="text-xs text-[#9A9488] hover:text-[#E85D3D] font-mono transition-colors cursor-pointer"
                    >
                      already have an account? sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Step 2: Post Auth Profile Completion */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#E85D3D]/10 border border-[#E85D3D]/30 rounded-full text-[10px] text-[#E85D3D] font-mono mb-2">
                  <UserCheck className="w-3 h-3" />
                  <span>one last step</span>
                </div>
                <h2 className="text-xl font-medium tracking-tight text-[#E8E2D8]">
                  complete your profile
                </h2>
                <p className="text-xs text-[#9A9488] mt-1 font-mono">
                  please enter your name and surname to finish setting up your account
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                      first name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Nodirbek"
                      className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg px-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9A9488] mb-1 font-mono">
                      surname *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Baratov"
                      className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg px-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-[#9A9488] font-mono">username *</label>
                    {usernameChecking && (
                      <span className="text-[10px] text-[#5C574C] flex items-center gap-1 font-mono">
                        <Loader2 className="w-3 h-3 animate-spin" /> checking...
                      </span>
                    )}
                    {!usernameChecking && usernameStatus === 'available' && (
                      <span className="text-[10px] text-[#6FA85C] flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> available
                      </span>
                    )}
                    {!usernameChecking && usernameStatus === 'taken' && (
                      <span className="text-[10px] text-[#D64545] flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3 h-3" /> taken
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. nodirbek"
                    className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg px-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0F0E0D]" />
                  ) : (
                    <>
                      <span>save & continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
