import { Language } from '../types';

export type TranslationKey =
  | 'nav_test'
  | 'nav_leaderboard'
  | 'nav_account'
  | 'nav_settings'
  | 'nav_login'
  | 'nav_logout'
  | 'nav_account_settings'
  // Mode Selector
  | 'mode_time'
  | 'mode_words'
  | 'diff_easy'
  | 'diff_medium'
  | 'diff_hard'
  | 'lang_uzbek'
  | 'lang_russian'
  | 'lang_english'
  // Typing Area
  | 'typing_focus_prompt'
  | 'typing_paused_prompt'
  | 'typing_restart_hint'
  | 'typing_live_wpm'
  | 'typing_language_label'
  // Results View
  | 'results_wpm'
  | 'results_acc'
  | 'results_raw'
  | 'results_chars'
  | 'results_time'
  | 'results_consistency'
  | 'results_saved_banner'
  | 'results_guest_banner'
  | 'results_next_test'
  | 'results_restart'
  | 'results_view_leaderboard'
  | 'results_speed_progression'
  | 'results_char_sub'
  | 'results_params_sub'
  | 'results_time_sub'
  | 'results_press_hint'
  // Leaderboard
  | 'lb_title'
  | 'lb_subtitle'
  | 'lb_live'
  | 'lb_today'
  | 'lb_week'
  | 'lb_month'
  | 'lb_all_time'
  | 'lb_all_langs'
  | 'lb_all_modes'
  | 'lb_all_diffs'
  | 'lb_user'
  | 'lb_date'
  | 'lb_empty'
  | 'lb_empty_sub'
  | 'lb_loading'
  | 'filter_today'
  | 'filter_week'
  | 'filter_month'
  | 'filter_all'
  | 'lb_all_languages'
  | 'lb_all_modes_durations'
  | 'lb_time_mode'
  | 'lb_words_mode'
  | 'lb_all_difficulties'
  | 'lb_runs_loaded'
  | 'lb_just_now'
  | 'lb_ago_mins'
  | 'lb_ago_hours'
  | 'lb_ago_days'
  | 'lb_you'
  | 'lb_notice_title'
  | 'lb_notice_copy'
  | 'lb_notice_copied'
  | 'lb_notice_desc'
  // Account
  | 'acc_title'
  | 'acc_subtitle'
  | 'acc_personal_info'
  | 'acc_first_name'
  | 'acc_last_name'
  | 'acc_username'
  | 'acc_email'
  | 'acc_save_changes'
  | 'acc_saving'
  | 'acc_saved'
  | 'acc_stats_title'
  | 'acc_stats_subtitle'
  | 'acc_best_wpm'
  | 'acc_avg_wpm'
  | 'acc_avg_acc'
  | 'acc_tests_completed'
  | 'acc_typing_time'
  | 'acc_progress_title'
  | 'acc_by_language'
  | 'acc_by_difficulty'
  | 'acc_change_photo'
  | 'acc_login_required'
  | 'acc_login_desc'
  // Settings Panel
  | 'settings_title'
  | 'settings_subtitle'
  | 'settings_typing_sound'
  | 'settings_smooth_caret'
  | 'settings_site_language'
  | 'settings_typing_language'
  | 'settings_sound_mute'
  | 'settings_sound_click'
  | 'settings_sound_typewriter'
  | 'settings_sound_mechanical'
  | 'settings_sound_soft_pop'
  | 'settings_sound_beep'
  | 'settings_sound_clack'
  | 'settings_caret_off'
  | 'settings_caret_slow'
  | 'settings_caret_medium'
  | 'settings_caret_fast'
  | 'settings_close'
  // Auth
  | 'auth_title'
  | 'auth_google'
  | 'auth_or'
  | 'auth_username'
  | 'auth_email'
  | 'auth_password'
  | 'auth_sign_in'
  | 'auth_sign_up'
  | 'auth_no_account'
  | 'auth_has_account'
  | 'auth_err_username_taken';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  uzbek: {
    nav_test: 'test',
    nav_leaderboard: 'peshqadamlar',
    nav_account: 'hisob',
    nav_settings: 'sozlamalar',
    nav_login: 'kirish',
    nav_logout: 'chiqish',
    nav_account_settings: 'hisob sozlamalari',

    mode_time: 'vaqt',
    mode_words: "so'zlar",
    diff_easy: 'oson',
    diff_medium: "o'rtacha",
    diff_hard: 'qiyin',
    lang_uzbek: "o'zbekcha",
    lang_russian: 'ruscha',
    lang_english: 'inglizcha',

    typing_focus_prompt: 'yozishni boshlash uchun shu yerga bosing',
    typing_paused_prompt: "sichqoncha harakatlantirildi — test to'xtatildi. davom ettirish uchun yozishni boshlang",
    typing_restart_hint: 'tab + enter - qayta boshlash',
    typing_live_wpm: 'wpm',
    typing_language_label: 'yozish tili',

    results_wpm: 'wpm',
    results_acc: 'aniqlik',
    results_raw: 'xom wpm',
    results_chars: 'belgilar',
    results_time: 'sarflangan vaqt',
    results_consistency: 'barqarorlik',
    results_saved_banner: 'natija umumiy peshqadamlar jadvaliga saqlandi!',
    results_guest_banner: 'natijangizni saqlash uchun google orqali kiring',
    results_next_test: 'keyingi test',
    results_restart: 'qayta boshlash',
    results_view_leaderboard: "peshqadamlarni ko'rish",
    results_speed_progression: "tezlik o'sishi",
    results_char_sub: "to'g'ri / xato / ortiqcha / o'tkazilgan",
    results_params_sub: 'til / qiyinchilik / rejim',
    results_time_sub: 'testning umumiy davomiyligi',
    results_press_hint: 'keyingi test uchun enter yoki esc tugmasini bosing',

    lb_title: 'peshqadamlar jadvali',
    lb_subtitle: "barcha tillar va rejimlar bo'yicha eng yaxshi natijalar",
    lb_live: 'jonli ulanish',
    lb_today: 'bugun',
    lb_week: 'hafta',
    lb_month: 'oy',
    lb_all_time: 'barcha vaqt',
    lb_all_langs: 'barcha tillar',
    lb_all_modes: 'barcha rejimlar',
    lb_all_diffs: 'barcha qiyinchiliklar',
    lb_user: 'foydalanuvchi',
    lb_date: 'sana',
    lb_empty: "bu filtr bo'yicha natijalar hali yo'q",
    lb_empty_sub: "birinchi bo'lib testni yakunlang va 1-o'rinni egallang!",
    lb_loading: 'natijalar yuklanmoqda...',
    filter_today: 'bugun',
    filter_week: 'hafta',
    filter_month: 'oy',
    filter_all: 'barchasi',
    lb_all_languages: 'barcha tillar',
    lb_all_modes_durations: 'barcha rejimlar',
    lb_time_mode: 'vaqt rejimi',
    lb_words_mode: "so'zlar rejimi",
    lb_all_difficulties: 'barcha qiyinchiliklar',
    lb_runs_loaded: 'ta natija',
    lb_just_now: 'hozirgina',
    lb_ago_mins: 'd oldin',
    lb_ago_hours: 's oldin',
    lb_ago_days: 'k oldin',
    lb_you: 'siz',
    lb_notice_title: 'Supabase results jadvalini sozlash',
    lb_notice_copy: 'sql nusxalash',
    lb_notice_copied: 'sql nusxalandi!',
    lb_notice_desc: "Quyida mahalliy natijalar ko'rsatilmoqda. Jonli peshqadamlar jadvali uchun Supabase SQL Editor scriptini bajaring.",

    acc_title: 'hisob sozlamalari va statistikasi',
    acc_subtitle: "profil ma'lumotlarini boshqaring va tezyozarlik ko'rsatkichlarini kuzating",
    acc_personal_info: "shaxsiy ma'lumotlar",
    acc_first_name: 'ism *',
    acc_last_name: 'familiya *',
    acc_username: 'taxallu (username)',
    acc_email: 'elektron pochta',
    acc_save_changes: "o'zgarishlarni saqlash",
    acc_saving: 'saqlanmoqda...',
    acc_saved: 'profil muvaffaqiyatli yangilandi!',
    acc_stats_title: 'shaxsiy yozish statistikasi',
    acc_stats_subtitle: "yozish tezligi, aniqligi va mashqlar hajmining to'liq sharhi",
    acc_best_wpm: 'eng yuqori wpm',
    acc_avg_wpm: "o'rtacha wpm",
    acc_avg_acc: "o'rtacha aniqlik",
    acc_tests_completed: 'bajarilgan testlar',
    acc_typing_time: 'yozish vaqti',
    acc_progress_title: "wpm va aniqlik o'sishi",
    acc_by_language: "tillar bo'yicha",
    acc_by_difficulty: "qiyinchilik bo'yicha",
    acc_change_photo: "rasmni o'zgartirish",
    acc_login_required: 'hisobga kirish talab qilinadi',
    acc_login_desc: "shaxsiy profil va statistikani ko'rish uchun google orqali kiring",

    settings_title: 'sozlamalar',
    settings_subtitle: 'klaviatura ovozlari, kursor va interfeys sozlamalari',
    settings_typing_sound: 'klaviatura ovozi',
    settings_smooth_caret: 'silliq kursor',
    settings_site_language: 'sayt tili (UI)',
    settings_typing_language: 'yozish tili',
    settings_sound_mute: 'ovozsiz',
    settings_sound_click: 'chertish (click)',
    settings_sound_typewriter: 'yozuv mashinkasi',
    settings_sound_mechanical: 'mexanik (mechanical)',
    settings_sound_soft_pop: 'yumshoq (soft pop)',
    settings_sound_beep: 'bipp (beep)',
    settings_sound_clack: 'qarsillash (clack)',
    settings_caret_off: "o'chirilgan",
    settings_caret_slow: 'sekin',
    settings_caret_medium: "o'rtacha",
    settings_caret_fast: 'tez',
    settings_close: 'yopish',

    auth_title: 'qalampir tizimiga kirish',
    auth_google: 'google orqali kirish',
    auth_or: 'yoki pochta orqali',
    auth_username: 'taxallu (username)',
    auth_email: 'elektron pochta',
    auth_password: 'parol',
    auth_sign_in: 'kirish',
    auth_sign_up: "ro'yxatdan o'tish",
    auth_no_account: "hisobingiz yo'qmi?",
    auth_has_account: 'hisobingiz bormi?',
    auth_err_username_taken: 'bu taxallu allaqachon band qilingan',
  },
  russian: {
    nav_test: 'тест',
    nav_leaderboard: 'таблица лидеров',
    nav_account: 'аккаунт',
    nav_settings: 'настройки',
    nav_login: 'войти',
    nav_logout: 'выйти',
    nav_account_settings: 'настройки аккаунта',

    mode_time: 'время',
    mode_words: 'слова',
    diff_easy: 'легко',
    diff_medium: 'средне',
    diff_hard: 'сложно',
    lang_uzbek: 'узбекский',
    lang_russian: 'русский',
    lang_english: 'английский',

    typing_focus_prompt: 'нажмите здесь, чтобы начать печать',
    typing_paused_prompt: 'мышь перемещена — тест приостановлен. начните печатать для продолжения',
    typing_restart_hint: 'tab + enter - перезапустить',
    typing_live_wpm: 'wpm',
    typing_language_label: 'язык ввода',

    results_wpm: 'wpm',
    results_acc: 'точность',
    results_raw: 'чистый wpm',
    results_chars: 'символы',
    results_time: 'прошедшее время',
    results_consistency: 'стабильность',
    results_saved_banner: 'результат сохранен в глобальной таблице лидеров!',
    results_guest_banner: 'войдите через google, чтобы сохранить ваш результат',
    results_next_test: 'следующий тест',
    results_restart: 'перезапустить',
    results_view_leaderboard: 'открыть таблицу лидеров',
    results_speed_progression: 'прогресс скорости',
    results_char_sub: 'верно / ошибка / лишние / пропущено',
    results_params_sub: 'язык / сложность / режим',
    results_time_sub: 'общая длительность теста',
    results_press_hint: 'нажмите enter или esc для следующего теста',

    lb_title: 'глобальный рейтинг',
    lb_subtitle: 'лучшие результаты скоропечатания по языкам и режимам',
    lb_live: 'живая синхронизация',
    lb_today: 'сегодня',
    lb_week: 'неделя',
    lb_month: 'месяц',
    lb_all_time: 'за все время',
    lb_all_langs: 'все языки',
    lb_all_modes: 'все режимы',
    lb_all_diffs: 'все сложности',
    lb_user: 'пользователь',
    lb_date: 'дата',
    lb_empty: 'нет результатов по этому фильтру',
    lb_empty_sub: 'станьте первым, кто завершит тест и займет #1 место!',
    lb_loading: 'загрузка рейтинга...',
    filter_today: 'сегодня',
    filter_week: 'неделя',
    filter_month: 'месяц',
    filter_all: 'все',
    lb_all_languages: 'все языки',
    lb_all_modes_durations: 'все режимы',
    lb_time_mode: 'режим времени',
    lb_words_mode: 'режим слов',
    lb_all_difficulties: 'все сложности',
    lb_runs_loaded: 'результатов',
    lb_just_now: 'только что',
    lb_ago_mins: 'мин назад',
    lb_ago_hours: 'ч назад',
    lb_ago_days: 'дн назад',
    lb_you: 'вы',
    lb_notice_title: 'Настройка таблицы Supabase results',
    lb_notice_copy: 'скопировать sql',
    lb_notice_copied: 'sql скопирован!',
    lb_notice_desc: 'Показаны локальные результаты. Для глобального рейтинга выполните скрипт в Supabase SQL Editor.',

    acc_title: 'настройки аккаунта и статистика',
    acc_subtitle: 'управляйте профилем и отслеживайте прогресс скорости печати',
    acc_personal_info: 'личная информация',
    acc_first_name: 'имя *',
    acc_last_name: 'фамилия *',
    acc_username: 'имя пользователя',
    acc_email: 'электронная почта',
    acc_save_changes: 'сохранить изменения',
    acc_saving: 'сохранение...',
    acc_saved: 'профиль успешно обновлен!',
    acc_stats_title: 'личная статистика печати',
    acc_stats_subtitle: 'полный обзор вашей скорости, точности и количества тестов',
    acc_best_wpm: 'лучший wpm',
    acc_avg_wpm: 'средний wpm',
    acc_avg_acc: 'средняя точность',
    acc_tests_completed: 'пройдено тестов',
    acc_typing_time: 'время печати',
    acc_progress_title: 'прогресс wpm и точности',
    acc_by_language: 'по языкам',
    acc_by_difficulty: 'по сложности',
    acc_change_photo: 'изменить фото',
    acc_login_required: 'требуется вход в аккаунт',
    acc_login_desc: 'войдите через google, чтобы просмотреть профиль и статистику',

    settings_title: 'настройки',
    settings_subtitle: 'звуки клавиш, каретка и язык интерфейса',
    settings_typing_sound: 'звук клавиш',
    settings_smooth_caret: 'плавная каретка',
    settings_site_language: 'язык сайта (UI)',
    settings_typing_language: 'язык печати',
    settings_sound_mute: 'без звука',
    settings_sound_click: 'щелчок (click)',
    settings_sound_typewriter: 'печатная машинка',
    settings_sound_mechanical: 'механика (mechanical)',
    settings_sound_soft_pop: 'мягкий клик (soft pop)',
    settings_sound_beep: 'сигнал (beep)',
    settings_sound_clack: 'клацанье (clack)',
    settings_caret_off: 'выкл',
    settings_caret_slow: 'медленно',
    settings_caret_medium: 'средне',
    settings_caret_fast: 'быстро',
    settings_close: 'закрыть',

    auth_title: 'вход в qalampir',
    auth_google: 'войти через google',
    auth_or: 'или через почту',
    auth_username: 'имя пользователя',
    auth_email: 'электронная почта',
    auth_password: 'пароль',
    auth_sign_in: 'войти',
    auth_sign_up: 'зарегистрироваться',
    auth_no_account: 'нет аккаунта?',
    auth_has_account: 'уже есть аккаунт?',
    auth_err_username_taken: 'это имя пользователя уже занято',
  },
  english: {
    nav_test: 'test',
    nav_leaderboard: 'leaderboard',
    nav_account: 'account',
    nav_settings: 'settings',
    nav_login: 'log in',
    nav_logout: 'log out',
    nav_account_settings: 'account settings',

    mode_time: 'time',
    mode_words: 'words',
    diff_easy: 'easy',
    diff_medium: 'medium',
    diff_hard: 'hard',
    lang_uzbek: 'uzbek',
    lang_russian: 'russian',
    lang_english: 'english',

    typing_focus_prompt: 'click or press any key to focus',
    typing_paused_prompt: 'mouse moved — test paused. start typing to resume',
    typing_restart_hint: 'tab + enter - restart test',
    typing_live_wpm: 'wpm',
    typing_language_label: 'typing language',

    results_wpm: 'wpm',
    results_acc: 'accuracy',
    results_raw: 'raw wpm',
    results_chars: 'characters',
    results_time: 'time elapsed',
    results_consistency: 'consistency',
    results_saved_banner: 'result saved to global leaderboard!',
    results_guest_banner: 'sign in with google to save your score to the global leaderboard',
    results_next_test: 'next test',
    results_restart: 'restart',
    results_view_leaderboard: 'view leaderboard',
    results_speed_progression: 'speed progression',
    results_char_sub: 'correct / incorrect / extra / missed',
    results_params_sub: 'language / difficulty / mode',
    results_time_sub: 'total test duration',
    results_press_hint: 'press enter or esc for next test',

    lb_title: 'global rankings',
    lb_subtitle: 'real-time top typing test scores across languages & modes',
    lb_live: 'live sync active',
    lb_today: 'today',
    lb_week: 'week',
    lb_month: 'month',
    lb_all_time: 'all time',
    lb_all_langs: 'all languages',
    lb_all_modes: 'all modes',
    lb_all_diffs: 'all difficulties',
    lb_user: 'user',
    lb_date: 'date',
    lb_empty: 'no results recorded for this filter yet',
    lb_empty_sub: 'be the first to complete a test in this category to claim #1 rank!',
    lb_loading: 'fetching live rankings...',
    filter_today: 'today',
    filter_week: 'week',
    filter_month: 'month',
    filter_all: 'all',
    lb_all_languages: 'all languages',
    lb_all_modes_durations: 'all modes & durations',
    lb_time_mode: 'time mode',
    lb_words_mode: 'words mode',
    lb_all_difficulties: 'all difficulties',
    lb_runs_loaded: 'runs loaded',
    lb_just_now: 'just now',
    lb_ago_mins: 'm ago',
    lb_ago_hours: 'h ago',
    lb_ago_days: 'd ago',
    lb_you: 'you',
    lb_notice_title: 'Supabase results table setup recommended for global live sync',
    lb_notice_copy: 'copy sql setup',
    lb_notice_copied: 'copied sql!',
    lb_notice_desc: 'Showing local scores below. To enable live multi-user global rankings across all devices, run the setup script.',

    acc_title: 'account settings & stats',
    acc_subtitle: 'manage your profile details and inspect your typing speed metrics over time',
    acc_personal_info: 'personal information',
    acc_first_name: 'first name *',
    acc_last_name: 'surname / last name *',
    acc_username: 'username',
    acc_email: 'email address',
    acc_save_changes: 'save changes',
    acc_saving: 'saving...',
    acc_saved: 'profile updated successfully!',
    acc_stats_title: 'personal typing statistics',
    acc_stats_subtitle: 'comprehensive overview of your typing speed, accuracy, and practice volume',
    acc_best_wpm: 'best wpm',
    acc_avg_wpm: 'average wpm',
    acc_avg_acc: 'avg accuracy',
    acc_tests_completed: 'tests completed',
    acc_typing_time: 'typing time',
    acc_progress_title: 'wpm & accuracy progress',
    acc_by_language: 'by language',
    acc_by_difficulty: 'by difficulty',
    acc_change_photo: 'change photo',
    acc_login_required: 'account login required',
    acc_login_desc: 'please sign in with google to view your personal account profile and typing statistics',

    settings_title: 'settings',
    settings_subtitle: 'customize key sounds, smooth caret motion, and site language',
    settings_typing_sound: 'typing sound',
    settings_smooth_caret: 'smooth caret',
    settings_site_language: 'site language (ui)',
    settings_typing_language: 'typing language',
    settings_sound_mute: 'mute',
    settings_sound_click: 'click',
    settings_sound_typewriter: 'typewriter',
    settings_sound_mechanical: 'mechanical',
    settings_sound_soft_pop: 'soft pop',
    settings_sound_beep: 'beep',
    settings_sound_clack: 'clack',
    settings_caret_off: 'off',
    settings_caret_slow: 'slow',
    settings_caret_medium: 'medium',
    settings_caret_fast: 'fast',
    settings_close: 'close',

    auth_title: 'sign in to qalampir',
    auth_google: 'continue with google',
    auth_or: 'or with email',
    auth_username: 'username',
    auth_email: 'email',
    auth_password: 'password',
    auth_sign_in: 'sign in',
    auth_sign_up: 'create account',
    auth_no_account: "don't have an account?",
    auth_has_account: 'already have an account?',
    auth_err_username_taken: 'username already taken',
  },
};
