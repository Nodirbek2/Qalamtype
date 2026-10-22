import { defaultAvatar } from '../lib/avatars';
import { getAuthRedirectUrl } from '../lib/authRedirect';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ isNewUser: boolean; profile: UserProfile }>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    username?: string
  ) => Promise<{ isNewUser: boolean; profile: UserProfile }>;
  logout: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  // Check if username is available in Supabase profiles table
  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3 || !/^[a-z0-9_]+$/.test(cleanUsername)) return false;

    if (!isSupabaseConfigured) return true;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername.replace(/_/g, '\\_'));

      if (error) {
        console.warn('Username check Supabase table error:', error.message);
        throw error;
      }

      if (!data || data.length === 0) return true;
      if (currentUser && data.length === 1 && data[0].id === currentUser.id) {
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  }, [currentUser?.id]);

  // Helper to fetch or create user profile
  const fetchOrCreateProfile = async (user: User): Promise<UserProfile> => {
    if (!isSupabaseConfigured) {
      const mockProfile: UserProfile = {
        uid: user.id,
        username: user.email?.split('@')[0] || 'user',
        usernameLower: (user.email?.split('@')[0] || 'user').toLowerCase(),
        email: user.email || '',
        photoURL: user.user_metadata?.avatar_url || defaultAvatar(user.id),
        createdAt: new Date().toISOString(),
        preferredSiteLanguage: 'uzbek_latin',
        preferredTypingLanguage: 'uzbek_latin',
        isProfileComplete: false,
      };
      return mockProfile;
    }

    try {
      // Query 'profiles' table
      const { data, error: lookupError } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, avatar_url, updated_at, is_profile_complete')
        .eq('id', user.id)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (data) {
        return {
          uid: data.id,
          username: data.username || user.email?.split('@')[0] || 'user',
          usernameLower: (data.username || user.email?.split('@')[0] || 'user').toLowerCase(),
          email: user.email || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          photoURL: data.avatar_url || defaultAvatar(user.id),
          createdAt: data.updated_at || new Date().toISOString(),
          preferredSiteLanguage: 'uzbek_latin',
          preferredTypingLanguage: 'uzbek_latin',
          isProfileComplete: data.is_profile_complete ?? true,
        };
      }

      // Profile doesn't exist, create it for first-time user
      const meta = user.user_metadata || {};
      const fullName = (meta.full_name || meta.name || meta.given_name || '').trim();
      const nameParts = fullName ? fullName.split(' ') : [];
      const firstName =
        meta.first_name ||
        meta.given_name ||
        nameParts[0] ||
        '';
      const lastName =
        meta.last_name ||
        meta.family_name ||
        (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

      const rawBase = (meta.username || user.email?.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '');
      let candidateUsername = rawBase.length >= 3 ? rawBase : `user_${Math.floor(100 + Math.random() * 900)}`;

      const isAvailable = await checkUsernameAvailability(candidateUsername);
      if (!isAvailable && !meta.username) {
        candidateUsername = `${candidateUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const newProfile: UserProfile = {
        uid: user.id,
        username: candidateUsername,
        usernameLower: candidateUsername.toLowerCase(),
        email: user.email || '',
        firstName: firstName,
        lastName: lastName,
        photoURL: meta.avatar_url || meta.picture || defaultAvatar(user.id),
        createdAt: new Date().toISOString(),
        preferredSiteLanguage: 'uzbek_latin',
        preferredTypingLanguage: 'uzbek_latin',
        isProfileComplete: false, // First time signup requires choosing/confirming username
      };

      // Upsert into 'profiles' table with is_profile_complete = false
      const { error: createError } = await supabase.from('profiles').upsert({
        id: user.id,
        username: candidateUsername,
        first_name: firstName,
        last_name: lastName,
        avatar_url: newProfile.photoURL,
        is_profile_complete: false,
        updated_at: new Date().toISOString(),
      });

      if (createError) throw createError;
      return newProfile;
    } catch (err) {
      console.error('Error in fetchOrCreateProfile:', err);
      return {
        uid: user.id,
        username: user.email?.split('@')[0] || 'user',
        usernameLower: (user.email?.split('@')[0] || 'user').toLowerCase(),
        email: user.email || '',
        createdAt: new Date().toISOString(),
        preferredSiteLanguage: 'uzbek_latin',
        preferredTypingLanguage: 'uzbek_latin',
        isProfileComplete: false,
      };
    }
  };

  // Signup with Email & Password
  const signupWithEmail = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    username?: string
  ): Promise<{ isNewUser: boolean; profile: UserProfile }> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please check your configuration.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(window.location.origin),
        data: {
          full_name: `${firstName || ''} ${lastName || ''}`.trim(),
          first_name: firstName || '',
          last_name: lastName || '',
          username: username || '',
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user && !data.session) {
      throw new Error('EMAIL_CONFIRMATION_REQUIRED');
    }

    if (data.user) {
      const profile = await fetchOrCreateProfile(data.user);
      return {
        isNewUser: !profile.isProfileComplete,
        profile,
      };
    }

    throw new Error('signup submitted successfully.');
  };

  // Login with Email & Password
  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please check your configuration.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // The auth listener loads the profile after releasing the auth lock.
  };

  // Login with Google via Supabase OAuth
  const loginWithGoogle = async (): Promise<{ isNewUser: boolean; profile: UserProfile }> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment variables.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl(window.location.origin),
      },
    });

    if (error) {
      throw error;
    }

    const dummyProfile: UserProfile = userProfile || {
      uid: currentUser?.id || '',
      username: '',
      usernameLower: '',
      email: currentUser?.email || '',
      createdAt: new Date().toISOString(),
      preferredSiteLanguage: 'uzbek_latin',
      preferredTypingLanguage: 'uzbek_latin',
    };

    return {
      isNewUser: !dummyProfile.isProfileComplete,
      profile: dummyProfile,
    };
  };

  // Logout via Supabase
  const logout = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    userIdRef.current = null;
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('Sign in before updating your profile.');

    if (isSupabaseConfigured) {
      // Map to profiles table column names
      const profileUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (data.username !== undefined) profileUpdates.username = data.username;
      if (data.firstName !== undefined) profileUpdates.first_name = data.firstName;
      if (data.lastName !== undefined) profileUpdates.last_name = data.lastName;
      if (data.photoURL !== undefined) profileUpdates.avatar_url = data.photoURL;
      if (data.isProfileComplete !== undefined) profileUpdates.is_profile_complete = data.isProfileComplete;

      const { error: profileErr, data: savedProfile } = await supabase
        .from('profiles')
        .upsert({ ...profileUpdates, id: currentUser.id, username: profileUpdates.username ?? userProfile?.username }, { onConflict: 'id' })
        .select('id')
        .single();

      if (profileErr) throw profileErr;
      if (!savedProfile) throw new Error('Profile was not saved.');
    }

    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;
    let version = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const applyUser = (user: User | null) => {
      if (user && userIdRef.current === user.id) return;
      userIdRef.current = user?.id ?? null;
      const requestVersion = ++version;
      setCurrentUser(user);
      setUserProfile(null);
      if (timer) clearTimeout(timer);
      if (!user) {
        setLoading(false);
        return;
      }
      // Leave the auth callback before making requests with the same client.
      timer = setTimeout(() => {
        fetchOrCreateProfile(user).then((profile) => {
          if (active && requestVersion === version) setUserProfile(profile);
        }).finally(() => {
          if (active && requestVersion === version) setLoading(false);
        });
      }, 0);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) applyUser(session?.user ?? null);
    });
    return () => {
      active = false;
      version++;
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        checkUsernameAvailability,
        updateUserProfile,
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
