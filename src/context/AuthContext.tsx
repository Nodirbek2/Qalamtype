import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ isNewUser: boolean; profile: UserProfile }>;
  logout: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if username is available in Firestore
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) return false;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('usernameLower', '==', cleanUsername));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return true;
      // If the doc found belongs to the current user, it's still "available" for them
      if (currentUser && querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === currentUser.uid) {
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Username availability check fallback:', err);
      return true;
    }
  };

  // Login or sign up with Google
  const loginWithGoogle = async (): Promise<{ isNewUser: boolean; profile: UserProfile }> => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user doc exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Create a default profile
      const rawBase = (user.email?.split('@')[0] || 'user').replace(/[^a-zA-Z0-9_]/g, '');
      let candidateUsername = rawBase.length >= 3 ? rawBase : `user_${Math.floor(100 + Math.random() * 900)}`;

      const isAvailable = await checkUsernameAvailability(candidateUsername);
      if (!isAvailable) {
        candidateUsername = `${candidateUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const nameParts = (user.displayName || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const newProfile: UserProfile = {
        uid: user.uid,
        username: candidateUsername,
        usernameLower: candidateUsername.toLowerCase(),
        email: user.email || '',
        firstName: firstName,
        lastName: lastName,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        preferredSiteLanguage: 'uzbek',
        preferredTypingLanguage: 'uzbek',
        isProfileComplete: false,
      };

      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
      return { isNewUser: true, profile: newProfile };
    } else {
      const existingProfile = userDocSnap.data() as UserProfile;
      setUserProfile(existingProfile);

      const needsCompletion =
        !existingProfile.isProfileComplete ||
        !existingProfile.firstName?.trim() ||
        !existingProfile.lastName?.trim();

      return { isNewUser: needsCompletion, profile: existingProfile };
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  // Update user profile fields
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, data);

    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithGoogle,
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
