import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy,
  limit,
  where,
  QueryConstraint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { TestResult, UserProfile, Language, Difficulty, TestMode } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface LeaderboardResult {
  id: string;
  uid: string;
  username: string;
  photoURL?: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  mode: TestMode;
  modeValue: number;
  difficulty: Difficulty;
  typingLanguage: Language;
  date: Date;
}

export type TimeRangeFilter = 'today' | 'week' | 'month' | 'all';
export type LanguageFilter = 'all' | Language;
export type ModeFilter = 'all' | 'time' | 'words' | 'time_15' | 'time_30' | 'time_60' | 'time_120' | 'words_10' | 'words_25' | 'words_50' | 'words_100';
export type DifficultyFilter = 'all' | Difficulty;

export interface LeaderboardFilters {
  timeRange: TimeRangeFilter;
  language: LanguageFilter;
  modeFilter: ModeFilter;
  difficulty: DifficultyFilter;
}

/**
 * Saves a completed typing test result to Firestore 'results' collection.
 */
export async function saveTestResult(
  result: TestResult,
  userProfile: UserProfile
): Promise<string | undefined> {
  const modeValue =
    result.mode === 'time'
      ? result.duration || 30
      : result.wordCount || 25;

  const data = {
    uid: userProfile.uid,
    username: userProfile.username,
    photoURL: userProfile.photoURL || '',
    wpm: Number(result.wpm),
    rawWpm: Number(result.rawWpm),
    accuracy: Number(result.accuracy),
    mode: result.mode,
    modeValue: Number(modeValue),
    difficulty: result.difficulty,
    typingLanguage: result.language,
    timestamp: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'results'), data);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'results');
  }
}

/**
 * Uploads a profile image to Firebase Storage, with canvas base64 fallback.
 */
export async function uploadAvatarImage(uid: string, file: File): Promise<string> {
  try {
    // Attempt Firebase Storage upload
    const storageRef = ref(storage, `avatars/${uid}_${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.warn('Firebase Storage upload failed or unconfigured, converting to compressed data URL fallback:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error('Failed to process image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Subscribes to real-time test results for a specific user.
 */
export function subscribeToUserResults(
  uid: string,
  onData: (results: LeaderboardResult[]) => void,
  onError?: (err: Error) => void
) {
  const resultsRef = collection(db, 'results');
  const q = query(resultsRef, where('uid', '==', uid));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const parsedDocs: LeaderboardResult[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();

        let docDate = new Date();
        if (data.timestamp?.toDate) {
          docDate = data.timestamp.toDate();
        } else if (data.timestamp?.seconds) {
          docDate = new Date(data.timestamp.seconds * 1000);
        } else if (data.timestamp instanceof Date) {
          docDate = data.timestamp;
        }

        parsedDocs.push({
          id: doc.id,
          uid: data.uid || '',
          username: data.username || '',
          photoURL: data.photoURL || '',
          wpm: Number(data.wpm || 0),
          rawWpm: Number(data.rawWpm || 0),
          accuracy: Number(data.accuracy || 0),
          mode: (data.mode as TestMode) || 'time',
          modeValue: Number(data.modeValue || 30),
          difficulty: (data.difficulty as Difficulty) || 'easy',
          typingLanguage: (data.typingLanguage as Language) || 'uzbek',
          date: docDate,
        });
      });

      // Sort chronological ascending for progress over time chart
      parsedDocs.sort((a, b) => a.date.getTime() - b.date.getTime());

      onData(parsedDocs);
    },
    (err) => {
      console.error('User results snapshot error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time leaderboard updates with multi-filtering support.
 */
export function subscribeToLeaderboard(
  filters: LeaderboardFilters,
  onData: (results: LeaderboardResult[]) => void,
  onError?: (err: Error) => void
) {
  const resultsRef = collection(db, 'results');
  const constraints: QueryConstraint[] = [orderBy('wpm', 'desc'), limit(150)];

  // Add equality query constraints when specific single values are selected
  if (filters.language !== 'all') {
    constraints.unshift(where('typingLanguage', '==', filters.language));
  }
  if (filters.difficulty !== 'all') {
    constraints.unshift(where('difficulty', '==', filters.difficulty));
  }

  const q = query(resultsRef, ...constraints);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const now = new Date();
      let cutoffDate: Date | null = null;

      if (filters.timeRange === 'today') {
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      } else if (filters.timeRange === 'week') {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === 'month') {
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const parsedDocs: LeaderboardResult[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();

        // Convert Firestore timestamp to JS Date safely
        let docDate = new Date();
        if (data.timestamp?.toDate) {
          docDate = data.timestamp.toDate();
        } else if (data.timestamp?.seconds) {
          docDate = new Date(data.timestamp.seconds * 1000);
        } else if (data.timestamp instanceof Date) {
          docDate = data.timestamp;
        }

        // 1. Time range filter
        if (cutoffDate && docDate < cutoffDate) {
          return;
        }

        // 2. Language filter (if not applied in query)
        if (filters.language !== 'all' && data.typingLanguage !== filters.language) {
          return;
        }

        // 3. Difficulty filter (if not applied in query)
        if (filters.difficulty !== 'all' && data.difficulty !== filters.difficulty) {
          return;
        }

        // 4. Mode / modeValue filter
        if (filters.modeFilter !== 'all') {
          if (filters.modeFilter === 'time' && data.mode !== 'time') return;
          if (filters.modeFilter === 'words' && data.mode !== 'words') return;

          if (filters.modeFilter.startsWith('time_')) {
            const val = parseInt(filters.modeFilter.replace('time_', ''), 10);
            if (data.mode !== 'time' || data.modeValue !== val) return;
          }

          if (filters.modeFilter.startsWith('words_')) {
            const val = parseInt(filters.modeFilter.replace('words_', ''), 10);
            if (data.mode !== 'words' || data.modeValue !== val) return;
          }
        }

        parsedDocs.push({
          id: doc.id,
          uid: data.uid || '',
          username: data.username || 'anonymous',
          photoURL: data.photoURL || '',
          wpm: Number(data.wpm || 0),
          rawWpm: Number(data.rawWpm || 0),
          accuracy: Number(data.accuracy || 0),
          mode: (data.mode as TestMode) || 'time',
          modeValue: Number(data.modeValue || 30),
          difficulty: (data.difficulty as Difficulty) || 'easy',
          typingLanguage: (data.typingLanguage as Language) || 'uzbek',
          date: docDate,
        });
      });

      // Sort by WPM descending, accuracy descending as tie-breaker
      parsedDocs.sort((a, b) => {
        if (b.wpm !== a.wpm) return b.wpm - a.wpm;
        return b.accuracy - a.accuracy;
      });

      // Limit to top 100
      onData(parsedDocs.slice(0, 100));
    },
    (err) => {
      console.error('Leaderboard snapshot error:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, 'results');
    }
  );

  return unsubscribe;
}

