
export type Role = 'user' | 'assistant' | 'system';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'video' | 'audio';
  attachments?: string[];
  videoUri?: string;
  thinking?: string;
  sources?: Array<{ title: string; uri: string }>;
  groundingMetadata?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export enum ModelType {
  REASONING = 'gemini-3-pro-preview',
  FLASH = 'gemini-3-flash-preview',
  VOICE = 'gemini-2.5-flash-native-audio-preview-12-2025',
  IMAGE = 'gemini-2.5-flash-image',
  VIDEO = 'veo-3.1-fast-generate-preview'
}

export type CognitiveMode = 'balanced' | 'precise' | 'creative' | 'god-mode';
export type PersonalityType = 'stoic' | 'friendly' | 'academic' | 'mentor';

export interface AppConfig {
  useSearch: boolean;
  useMaps: boolean;
  thinkingBudget: number;
  temperature: number;
  cognitiveMode: CognitiveMode;
  personality: PersonalityType;
}
