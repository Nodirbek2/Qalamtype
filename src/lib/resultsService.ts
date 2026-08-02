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

/**
 * Saves a completed typing test result to Supabase 'results' table.
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
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured. Test result saved locally in session.');
    return `local_${Date.now()}`;
  }

  try {
    const { data: inserted, error } = await supabase
      .from('results')
      .insert([data])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase save error:', error.message);
      return undefined;
    }
    return inserted?.id;
  } catch (err) {
    console.error('Failed to save test result to Supabase:', err);
    return undefined;
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
      } else {
        console.warn('Supabase avatar upload warning:', uploadError.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, using fallback:', err);
    }
  }

  // Fallback to compressed data URL
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

/**
 * Subscribes to real-time test results for a specific user via Supabase.
 */
export function subscribeToUserResults(
  uid: string,
  onData: (results: LeaderboardResult[]) => void,
  onError?: (err: Error) => void
) {
  if (!isSupabaseConfigured) {
    onData([]);
    return () => {};
  }

  const fetchUserResults = async () => {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('uid', uid)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('User results fetch error:', error.message);
      if (onError) onError(new Error(error.message));
      return;
    }

    const parsedDocs: LeaderboardResult[] = (data || []).map((row: any) => ({
      id: String(row.id || row.uid),
      uid: row.uid || '',
      username: row.username || '',
      photoURL: row.photoURL || '',
      wpm: Number(row.wpm || 0),
      rawWpm: Number(row.rawWpm || 0),
      accuracy: Number(row.accuracy || 0),
      mode: (row.mode as TestMode) || 'time',
      modeValue: Number(row.modeValue || 30),
      difficulty: (row.difficulty as Difficulty) || 'easy',
      typingLanguage: (row.typingLanguage as Language) || 'uzbek',
      date: new Date(row.created_at || row.timestamp || Date.now()),
    }));

    onData(parsedDocs);
  };

  fetchUserResults();

  const channel = supabase
    .channel(`user-results-${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'results', filter: `uid=eq.${uid}` },
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
 * Subscribes to real-time leaderboard updates with multi-filtering support via Supabase.
 */
export function subscribeToLeaderboard(
  filters: LeaderboardFilters,
  onData: (results: LeaderboardResult[]) => void,
  onError?: (err: Error) => void
) {
  if (!isSupabaseConfigured) {
    onData([]);
    return () => {};
  }

  const fetchLeaderboard = async () => {
    let query = supabase
      .from('results')
      .select('*')
      .order('wpm', { ascending: false })
      .limit(150);

    if (filters.language !== 'all') {
      query = query.eq('typingLanguage', filters.language);
    }
    if (filters.difficulty !== 'all') {
      query = query.eq('difficulty', filters.difficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Leaderboard fetch error:', error.message);
      if (onError) onError(new Error(error.message));
      return;
    }

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

    (data || []).forEach((row: any) => {
      const docDate = new Date(row.created_at || row.timestamp || Date.now());

      if (cutoffDate && docDate < cutoffDate) {
        return;
      }

      if (filters.language !== 'all' && row.typingLanguage !== filters.language) {
        return;
      }

      if (filters.difficulty !== 'all' && row.difficulty !== filters.difficulty) {
        return;
      }

      if (filters.modeFilter !== 'all') {
        if (filters.modeFilter === 'time' && row.mode !== 'time') return;
        if (filters.modeFilter === 'words' && row.mode !== 'words') return;

        if (filters.modeFilter.startsWith('time_')) {
          const val = parseInt(filters.modeFilter.replace('time_', ''), 10);
          if (row.mode !== 'time' || Number(row.modeValue) !== val) return;
        }

        if (filters.modeFilter.startsWith('words_')) {
          const val = parseInt(filters.modeFilter.replace('words_', ''), 10);
          if (row.mode !== 'words' || Number(row.modeValue) !== val) return;
        }
      }

      parsedDocs.push({
        id: String(row.id || row.uid),
        uid: row.uid || '',
        username: row.username || 'anonymous',
        photoURL: row.photoURL || '',
        wpm: Number(row.wpm || 0),
        rawWpm: Number(row.rawWpm || 0),
        accuracy: Number(row.accuracy || 0),
        mode: (row.mode as TestMode) || 'time',
        modeValue: Number(row.modeValue || 30),
        difficulty: (row.difficulty as Difficulty) || 'easy',
        typingLanguage: (row.typingLanguage as Language) || 'uzbek',
        date: docDate,
      });
    });

    parsedDocs.sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    });

    onData(parsedDocs.slice(0, 100));
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
