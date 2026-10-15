import { UserProfile, Message, NotificationSettings, ThemeMode } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'si_user_profile',
  MESSAGES: 'si_chat_messages',
  NOTIFICATIONS: 'si_notifications',
  THEME: 'si_theme_mode',
  DISMISSED_INSTALL: 'si_dismiss_install',
  SAVED_CHIPS: 'si_saved_chips',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  goal: '',
  routine: '',
  mealTimes: '',
  usualFood: '',
  triggers: '',
  conditions: '',
  restrictions: '',
  memoryNotes: [],
  summary: '',
  lastActiveTimestamp: Date.now(),
};

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: false,
  morningTime: '08:00',
  eveningTime: '21:00',
};

// IndexedDB Helper for deep history persistence
const DB_NAME = 'SegredoInsulinaDB';
const STORE_NAME = 'messages_history';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMessagesToIndexedDB(messages: Message[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const msg of messages) {
      store.put(msg);
    }
  } catch (e) {
    // silently fallback to localStorage
  }
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMessages(messages: Message[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    saveMessagesToIndexedDB(messages);
  } catch (e) {
    console.error('Error saving messages:', e);
  }
}

export function loadSavedChips(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_CHIPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChips(chips: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_CHIPS, JSON.stringify(chips));
  } catch {}
}

export function loadThemeMode(): ThemeMode {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
    return val || 'system';
  } catch {
    return 'system';
  }
}

export function saveThemeMode(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {}
}

export function isInstallPromptDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.DISMISSED_INSTALL) === 'true';
  } catch {
    return false;
  }
}

export function setInstallPromptDismissed(dismissed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DISMISSED_INSTALL, dismissed ? 'true' : 'false');
  } catch {}
}

export function loadNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return DEFAULT_NOTIFICATIONS;
    return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(settings));
  } catch {}
}

export function exportAllData(): string {
  const data = {
    profile: loadProfile(),
    messages: loadMessages(),
    notifications: loadNotificationSettings(),
    exportedAt: new Date().toISOString(),
    appName: 'Segredo da Insulina',
    persona: 'Helena',
  };
  return JSON.stringify(data, null, 2);
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.THEME);
    localStorage.removeItem(STORAGE_KEYS.DISMISSED_INSTALL);
    localStorage.removeItem(STORAGE_KEYS.SAVED_CHIPS);
  } catch {}
}
