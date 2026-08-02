import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Check if username is available in Supabase users table
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) return false;

    if (!isSupabaseConfigured) return true;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('uid')
        .eq('usernameLower', cleanUsername);

      if (error) {
        console.warn('Username check Supabase table fallback:', error.message);
        return true;
      }

      if (!data || data.length === 0) return true;
      if (currentUser && data.length === 1 && data[0].uid === currentUser.id) {
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Username availability check fallback:', err);
      return true;
    }
  };

  // Helper to fetch or create user profile
  const fetchOrCreateProfile = async (user: User): Promise<UserProfile> => {
    if (!isSupabaseConfigured) {
      const mockProfile: UserProfile = {
        uid: user.id,
        username: user.email?.split('@')[0] || 'user',
        usernameLower: (user.email?.split('@')[0] || 'user').toLowerCase(),
        email: user.email || '',
        photoURL: user.user_metadata?.avatar_url || '',
        createdAt: new Date().toISOString(),
        preferredSiteLanguage: 'uzbek',
        preferredTypingLanguage: 'uzbek',
        isProfileComplete: false,
      };
      return mockProfile;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', user.id)
        .maybeSingle();

      if (data) {
        return data as UserProfile;
      }

      // Profile doesn't exist, create it
      const meta = user.user_metadata || {};
      const fullName = (meta.full_name || meta.name || meta.given_name || '').trim();
      const nameParts = fullName ? fullName.split(' ') : [];
      const firstName =
        meta.first_name ||
        meta.given_name ||
        nameParts[0] ||
        user.email?.split('@')[0] ||
        'User';
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
        photoURL: meta.avatar_url || meta.picture || '',
        createdAt: new Date().toISOString(),
        preferredSiteLanguage: 'uzbek',
        preferredTypingLanguage: 'uzbek',
        isProfileComplete: true,
      };

      const { error: insertError } = await supabase.from('users').upsert(newProfile);
      if (insertError) {
        console.warn('Supabase profile creation fallback:', insertError.message);
      }

      return newProfile;
    } catch (err) {
      console.error('Error in fetchOrCreateProfile:', err);
      return {
        uid: user.id,
        username: user.email?.split('@')[0] || 'user',
        usernameLower: (user.email?.split('@')[0] || 'user').toLowerCase(),
        email: user.email || '',
        createdAt: new Date().toISOString(),
        preferredSiteLanguage: 'uzbek',
        preferredTypingLanguage: 'uzbek',
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

    if (data.user) {
      const profile = await fetchOrCreateProfile(data.user);
      setUserProfile(profile);
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

    if (data.user) {
      const profile = await fetchOrCreateProfile(data.user);
      setUserProfile(profile);
    }
  };

  // Login with Google via Supabase OAuth
  const loginWithGoogle = async (): Promise<{ isNewUser: boolean; profile: UserProfile }> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment variables.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
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
      preferredSiteLanguage: 'uzbek',
      preferredTypingLanguage: 'uzbek',
    };

    return {
      isNewUser: !dummyProfile.isProfileComplete,
      profile: dummyProfile,
    };
  };

  // Logout via Supabase
  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('uid', currentUser.id);

      if (error) {
        console.warn('Supabase profile update warning:', error.message);
      }
    }

    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        fetchOrCreateProfile(user).then((profile) => {
          setUserProfile(profile);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        const profile = await fetchOrCreateProfile(user);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
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
