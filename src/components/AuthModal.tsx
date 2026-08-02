import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Loader2, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, loginWithGoogle, checkUsernameAvailability, updateUserProfile } =
    useAuth();

  // State: 'google' (step 1) or 'profile' (step 2)
  const [step, setStep] = useState<'google' | 'profile'>('google');

  // Profile Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  // Status & Validation states
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | null>(
    null
  );

  // Initialize profile form or step when modal opens or user profile changes
  useEffect(() => {
    if (!isOpen) return;

    setError(null);

    // If user is already logged in but needs name/surname/profile completion
    if (currentUser && userProfile) {
      if (!userProfile.isProfileComplete || !userProfile.firstName || !userProfile.lastName) {
        setStep('profile');
        setFirstName(userProfile.firstName || '');
        setLastName(userProfile.lastName || '');
        setUsername(userProfile.username || '');
      } else {
        // Already complete
        onClose();
      }
    } else {
      setStep('google');
    }
  }, [isOpen, currentUser, userProfile, onClose]);

  // Debounced username availability checker
  useEffect(() => {
    if (step !== 'profile' || !username.trim()) {
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
  }, [username, step, checkUsernameAvailability]);

  if (!isOpen) return null;

  // Step 1: Google Authentication
  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const { isNewUser, profile } = await loginWithGoogle();

      // Check if profile needs completion (first time signup or missing name/surname)
      if (isNewUser || !profile.firstName?.trim() || !profile.lastName?.trim() || !profile.isProfileComplete) {
        setStep('profile');
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setUsername(profile.username || '');
      } else {
        // Complete existing user
        onClose();
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.message?.includes('closed') || err.message?.includes('cancel')) {
        return;
      }
      setError('failed to sign in with google: ' + (err.message || 'please check your credentials or setup'));
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Save Name & Surname Profile Completion
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
            className="absolute top-4 right-4 p-1.5 text-[#9A9488] hover:text-[#E8E2D8] transition-colors rounded-lg hover:bg-[rgba(232,226,216,0.05)]"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-[#D64545]/10 border border-[#D64545]/30 rounded-lg flex items-center space-x-2 text-xs text-[#D64545]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'google' ? (
            /* Step 1: Single Google Sign In */
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-medium tracking-tight text-[#E8E2D8]">
                  sign in to qalampir
                </h2>
                <p className="text-xs text-[#9A9488] mt-1 font-mono">
                  sign in with your google account to save your typing scores, track stats, and join the global leaderboards
                </p>
              </div>

              <div className="my-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                  className="w-full bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center space-x-3 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0F0E0D]" />
                  ) : (
                    <>
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-0.5 shrink-0">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                      <span className="tracking-wide">continue with google</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-[#9A9488] font-mono flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6FA85C]" />
                  fast, secure, and passwordless authentication
                </p>
              </div>
            </div>
          ) : (
            /* Step 2: Post Signup Profile Completion (Name, Surname, Username) */
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
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. nodirbek"
                    className="w-full bg-[#0F0E0D] border border-[rgba(232,226,216,0.12)] rounded-lg px-3 py-2 text-sm text-[#E8E2D8] font-mono focus:outline-none focus:border-[#E85D3D] transition-colors"
                  />
                </div>

                {/* Submit Button */}
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
