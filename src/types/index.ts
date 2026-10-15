export interface Message {
  id: string;
  sender: 'user' | 'persona' | 'system';
  text: string;
  time: string; // e.g. "14:32"
  date: string; // e.g. "2026-10-15"
  read: boolean;
  image?: string; // base64 data url for plate photos
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface UserProfile {
  name: string;
  goal: string;
  routine: string;
  mealTimes: string;
  usualFood: string;
  triggers: string;
  conditions: string;
  restrictions: string;
  memoryNotes: string[];
  summary: string;
  lastActiveTimestamp?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  morningTime: string;
  eveningTime: string;
}

export type ThemeMode = 'system' | 'dark' | 'light';
