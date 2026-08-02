import { supabase, isSupabaseConfigured } from './supabase';
import { TestResult, UserProfile, Language, Difficulty, TestMode } from '../types';

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
export type ModeFilter =
  | 'all'
  | 'time'
  | 'words'
  | 'time_15'
  | 'time_30'
  | 'time_60'
  | 'time_120'
  | 'words_10'
  | 'words_25'
  | 'words_50'
  | 'words_100';
export type DifficultyFilter = 'all' | Difficulty;

export interface LeaderboardFilters {
  timeRange: TimeRangeFilter;
  language: LanguageFilter;
  modeFilter: ModeFilter;
  difficulty: DifficultyFilter;
}

const LOCAL_STORAGE_KEY = 'qalampirtype_local_results';

// Initial seed leaderboard entries so leaderboard is never empty
const INITIAL_DEMO_LEADERBOARD: LeaderboardResult[] = [
  {
    id: 'demo_1',
    uid: 'demo_1',
    username: 'sanjar_type',
    wpm: 124,
    rawWpm: 128,
    accuracy: 98.4,
    mode: 'time',
    modeValue: 30,
    difficulty: 'easy',
    typingLanguage: 'uzbek',
    date: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'demo_2',
    uid: 'demo_2',
    username: 'nodirbek_dev',
    wpm: 112,
    rawWpm: 115,
    accuracy: 97.8,
    mode: 'time',
    modeValue: 30,
    difficulty: 'medium',
    typingLanguage: 'uzbek',
    date: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'demo_3',
    uid: 'demo_3',
    username: 'typing_master',
    wpm: 105,
    rawWpm: 108,
    accuracy: 96.5,
    mode: 'words',
    modeValue: 25,
    difficulty: 'easy',
    typingLanguage: 'uzbek',
    date: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: 'demo_4',
    uid: 'demo_4',
    username: 'aziza_speed',
    wpm: 98,
    rawWpm: 102,
    accuracy: 97.1,
    mode: 'time',
    modeValue: 60,
    difficulty: 'easy',
    typingLanguage: 'uzbek',
    date: new Date(Date.now() - 1000 * 60 * 300),
  },
  {
    id: 'demo_5',
    uid: 'demo_5',
    username: 'doston_keys',
    wpm: 91,
    rawWpm: 94,
    accuracy: 95.8,
    mode: 'time',
    modeValue: 15,
    difficulty: 'medium',
    typingLanguage: 'uzbek',
    date: new Date(Date.now() - 1000 * 60 * 600),
  },
  {
    id: 'demo_6',
    uid: 'demo_6',
    username: 'malika_fast',
    wpm: 88,
    rawWpm: 90,
    accuracy: 99.1,
    mode: 'words',
    modeValue: 50,
    difficulty: 'easy',
    typingLanguage: 'uzbek',
    date: new Date(Date.now() - 1000 * 60 * 1200),
  },
  {
    id: 'demo_7',
    uid: 'demo_7',
    username: 'alex_russia',
    wpm: 95,
    rawWpm: 99,
    accuracy: 96.2,
    mode: 'time',
    modeValue: 30,
    difficulty: 'easy',
    typingLanguage: 'russian',
    date: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: 'demo_8',
    uid: 'demo_8',
    username: 'john_fastfingers',
    wpm: 103,
    rawWpm: 106,
    accuracy: 97.5,
    mode: 'time',
    modeValue: 30,
    difficulty: 'easy',
    typingLanguage: 'english',
    date: new Date(Date.now() - 1000 * 60 * 180),
  },
];

export function getLocalResults(): LeaderboardResult[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADERBOARD));
      return INITIAL_DEMO_LEADERBOARD;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADERBOARD));
      return INITIAL_DEMO_LEADERBOARD;
    }
    return parsed.map((row: any) => ({
      ...row,
      date: new Date(row.date || row.created_at || Date.now()),
    }));
  } catch {
    return INITIAL_DEMO_LEADERBOARD;
  }
}

export function saveLocalResult(result: LeaderboardResult) {
  try {
    const current = getLocalResults();
    // Prepend new result
    current.unshift(result);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current.slice(0, 150)));
  } catch (err) {
    console.warn('Failed to save local result:', err);
  }
}

/**
 * Saves a completed typing test result to local storage and Supabase.
 */
export async function saveTestResult(
  result: TestResult,
  userProfile?: UserProfile | null
): Promise<string | undefined> {
  const modeValue =
    result.mode === 'time'
      ? result.duration || 30
      : result.wordCount || 25;

  const uid = userProfile?.uid || `guest_${Date.now()}`;
  const username = userProfile?.username || 'mehmon';
  const photoURL = userProfile?.photoURL || '';

  const localRes: LeaderboardResult = {
    id: `result_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    uid,
    username,
    photoURL,
    wpm: Number(result.wpm),
    rawWpm: Number(result.rawWpm),
    accuracy: Number(result.accuracy),
    mode: result.mode,
    modeValue: Number(modeValue),
    difficulty: result.difficulty,
    typingLanguage: result.language,
    date: new Date(),
  };

  saveLocalResult(localRes);

  if (!isSupabaseConfigured || !userProfile) {
    return localRes.id;
  }

  const data = {
    user_id: userProfile.uid,
    username: userProfile.username,
    photo_url: userProfile.photoURL || '',
    wpm: Number(result.wpm),
    raw_wpm: Number(result.rawWpm),
    accuracy: Number(result.accuracy),
    mode: result.mode,
    mode_value: Number(modeValue),
    difficulty: result.difficulty,
    typing_language: result.language,
    created_at: new Date().toISOString(),
  };

  try {
    const { data: inserted, error } = await supabase
      .from('results')
      .insert([data])
      .select('id')
      .single();

    if (error) {
      console.warn('Supabase save warning (saved locally):', error.message);
      return localRes.id;
    }
    return inserted?.id || localRes.id;
  } catch (err) {
    console.warn('Failed to save test result to Supabase (saved locally):', err);
    return localRes.id;
  }
}

/**
 * Uploads a profile image to Supabase Storage, with compressed base64 fallback.
 */
export async function uploadAvatarImage(uid: string, file: File): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `avatars/${uid}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, using fallback:', err);
    }
  }

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
          resolve(canvas.toDataURL('image/jpeg', 0.85));
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

/**
 * Subscribes to real-time test results for a specific user.
 */
export function subscribeToUserResults(
  uid: string,
  onData: (results: LeaderboardResult[]) => void,
  onError?: (err: Error) => void
) {
  const loadLocalUserResults = () => {
    const allLocal = getLocalResults();
    const userLocal = allLocal.filter((r) => r.uid === uid);
    onData(userLocal.length > 0 ? userLocal : allLocal);
  };

  if (!isSupabaseConfigured) {
    loadLocalUserResults();
    return () => {};
  }

  const fetchUserResults = async () => {
    try {
      let { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });

      if (error) {
        const fallback = await supabase
          .from('results')
          .select('*')
          .eq('uid', uid)
          .order('created_at', { ascending: true });

        if (!fallback.error) {
          data = fallback.data;
          error = null;
        }
      }

      if (error || !data || data.length === 0) {
        loadLocalUserResults();
        return;
      }

      const parsedDocs: LeaderboardResult[] = (data || []).map((row: any) => ({
        id: String(row.id || row.user_id || row.uid),
        uid: row.user_id || row.uid || '',
        username: row.username || '',
        photoURL: row.photo_url || row.photoURL || '',
        wpm: Number(row.wpm || 0),
        rawWpm: Number(row.raw_wpm ?? row.rawWpm ?? 0),
        accuracy: Number(row.accuracy || 0),
        mode: (row.mode as TestMode) || 'time',
        modeValue: Number(row.mode_value ?? row.modeValue ?? 30),
        difficulty: (row.difficulty as Difficulty) || 'easy',
        typingLanguage: (row.typing_language || row.typingLanguage as Language) || 'uzbek',
        date: new Date(row.created_at || row.timestamp || Date.now()),
      }));

      onData(parsedDocs);
    } catch (err: any) {
      loadLocalUserResults();
      if (onError) onError(err);
    }
  };

  fetchUserResults();

  const channel = supabase
    .channel(`user-results-${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'results' },
      () => {
        fetchUserResults();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Helper to filter & sort any array of LeaderboardResult objects
 */

function filterAndSortResults(
  rawData: LeaderboardResult[],
  filters: LeaderboardFilters
): LeaderboardResult[] {
  const now = new Date();
  let cutoffDate: Date | null = null;

  if (filters.timeRange === 'today') {
    cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  } else if (filters.timeRange === 'week') {
    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (filters.timeRange === 'month') {
    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const filtered = rawData.filter((row) => {
    if (cutoffDate && new Date(row.date) < cutoffDate) {
      return false;
    }

    if (filters.language !== 'all' && row.typingLanguage !== filters.language) {
      return false;
    }

    if (filters.difficulty !== 'all' && row.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.modeFilter !== 'all') {
      if (filters.modeFilter === 'time' && row.mode !== 'time') return false;
      if (filters.modeFilter === 'words' && row.mode !== 'words') return false;

      if (filters.modeFilter.startsWith('time_')) {
        const val = parseInt(filters.modeFilter.replace('time_', ''), 10);
        if (row.mode !== 'time' || row.modeValue !== val) return false;
      }

      if (filters.modeFilter.startsWith('words_')) {
        const val = parseInt(filters.modeFilter.replace('words_', ''), 10);
        if (row.mode !== 'words' || row.modeValue !== val) return false;
      }
    }

    return true;
  });

  return filtered.sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    return b.accuracy - a.accuracy;
  });
}

/**
 * Subscribes to real-time leaderboard updates with multi-filtering support.
 */
export function subscribeToLeaderboard(
  filters: LeaderboardFilters,
  onData: (results: LeaderboardResult[]) => void,
  onError?: (err: Error) => void
) {
  const emitLocalFallback = () => {
    const local = getLocalResults();
    const processed = filterAndSortResults(local, filters);
    onData(processed);
  };

  if (!isSupabaseConfigured) {
    emitLocalFallback();
    return () => {};
  }

  const fetchLeaderboard = async () => {
    try {
      let query = supabase
        .from('results')
        .select('*')
        .order('wpm', { ascending: false })
        .limit(100);

      const now = new Date();
      if (filters.timeRange === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        query = query.gte('created_at', todayStart.toISOString());
      } else if (filters.timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (filters.timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      if (filters.language !== 'all') {
        query = query.eq('typing_language', filters.language);
      }

      if (filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters.modeFilter !== 'all') {
        if (filters.modeFilter === 'time') {
          query = query.eq('mode', 'time');
        } else if (filters.modeFilter === 'words') {
          query = query.eq('mode', 'words');
        } else if (filters.modeFilter.startsWith('time_')) {
          const val = parseInt(filters.modeFilter.replace('time_', ''), 10);
          query = query.eq('mode', 'time').eq('mode_value', val);
        } else if (filters.modeFilter.startsWith('words_')) {
          const val = parseInt(filters.modeFilter.replace('words_', ''), 10);
          query = query.eq('mode', 'words').eq('mode_value', val);
        }
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback to local data if table doesn't exist or has 0 entries
        emitLocalFallback();
        if (error && onError) {
          const errMsg = error.message || '';
          if (
            errMsg.includes('Could not find the table') ||
            errMsg.includes('schema cache') ||
            errMsg.includes('does not exist') ||
            errMsg.includes('42P01') ||
            errMsg.includes('PGRST205')
          ) {
            onError(new Error('SUPABASE_TABLE_NOT_FOUND'));
          } else {
            onError(new Error(errMsg));
          }
        }
        return;
      }

      // Map Supabase rows to LeaderboardResult
      const parsedDocs: LeaderboardResult[] = data.map((row: any) => ({
        id: String(row.id || row.user_id || row.uid),
        uid: row.user_id || row.uid || '',
        username: row.username || 'anonymous',
        photoURL: row.photo_url || row.photoURL || '',
        wpm: Number(row.wpm || 0),
        rawWpm: Number(row.raw_wpm ?? row.rawWpm ?? 0),
        accuracy: Number(row.accuracy || 0),
        mode: (row.mode as TestMode) || 'time',
        modeValue: Number(row.mode_value ?? row.modeValue ?? 30),
        difficulty: (row.difficulty as Difficulty) || 'easy',
        typingLanguage: (row.typing_language || row.typingLanguage as Language) || 'uzbek',
        date: new Date(row.created_at || row.timestamp || Date.now()),
      }));

      // Combine with local user results to make sure user's freshly completed local test appears
      const localResults = getLocalResults();
      const combinedMap = new Map<string, LeaderboardResult>();

      // Add local results first
      localResults.forEach((r) => combinedMap.set(r.id, r));
      // Add / overwrite with Supabase results
      parsedDocs.forEach((r) => combinedMap.set(r.id, r));

      const combinedList = Array.from(combinedMap.values());
      const processed = filterAndSortResults(combinedList, filters);
      onData(processed);
    } catch (err: any) {
      emitLocalFallback();
      if (onError) onError(err);
    }
  };

  fetchLeaderboard();

  const channel = supabase
    .channel('leaderboard-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () => {
      fetchLeaderboard();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
