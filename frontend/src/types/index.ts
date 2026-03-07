// Core data models for Piritiya frontend

// Message types
export type MessageSender = 'user' | 'bot';
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'syncing';

export interface Message {
  id: string;
  sessionId: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  status: MessageStatus;
  isOffline?: boolean;
}

// Session types
export interface Session {
  id: string;
  farmerId: string;
  startTime: number;
  lastActivity: number;
  messageCount: number;
}

// Settings types
export type Language = 'hi' | 'en';

export interface Settings {
  farmerId: string;
  language: Language;
  voiceInputEnabled: boolean;
  voiceOutputEnabled: boolean;
  lastUpdated: number;
}

// Cached response types
export interface CachedResponse {
  id: string;
  query: string;
  response: string;
  timestamp: number;
  size: number; // in bytes
}

// Pending query types
export interface PendingQuery {
  id: string;
  sessionId: string;
  farmerId: string;
  query: string;
  timestamp: number;
  retryCount: number;
}

// API request/response types
export interface ChatRequest {
  message: string;
  session_id?: string;
  farmer_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  message: string;
}

export interface SoilMoistureData {
  moisture_index: number;
  moisture_category: string;
  trend: string;
  groundwater_status: string;
  groundwater_depth_meters: number;
  depletion_rate_cm_per_year: number;
  measurement_date: string;
  location: string;
  village: string;
  data_source: string;
  s3_raw_data_path: string;
}

export interface CropRecommendation {
  crop_name: string;
  crop_name_hindi: string;
  water_requirement_mm: number;
  duration_days: number;
  expected_yield_quintal_per_hectare: number;
  market_price_per_quintal: number;
  sustainability_score: number;
  reason: string;
}

export interface CropAdviceResponse {
  farmer_id: string;
  season: string;
  location: string;
  moisture_index: number;
  groundwater_status: string;
  recommended_crops: CropRecommendation[];
  crops_to_avoid: CropRecommendation[];
  reasoning: string;
  sustainability_alert: string | null;
  last_updated: string;
}

export interface MarketPrice {
  crop: string;
  crop_hindi: string;
  price_per_quintal: number;
  mandi: string;
  trend: string;
  change_percent: number;
  unit: string;
}

export interface MarketPricesResponse {
  prices: MarketPrice[];
  district: string;
  mandi: string;
  source: string;
  last_updated: string;
  currency: string;
  note: string;
}

// State models
export interface AppState {
  farmerId: string;
  language: Language;
  isOnline: boolean;
  voiceEnabled: boolean;
  isInstalled: boolean;
}

export interface ChatState {
  sessionId: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  pendingQueries: PendingQuery[];
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
}

// Component prop interfaces
export interface VoiceInputProps {
  language: Language;
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

export interface VoiceOutputProps {
  text: string;
  language: Language;
  autoPlay?: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export interface QuickActionsProps {
  language: Language;
  onActionClick: (query: string) => void;
}

export interface ChatInterfaceProps {
  farmerId: string;
  language: Language;
}

export interface SettingsScreenProps {
  onClose: () => void;
}

// Quick action types
export interface QuickAction {
  id: string;
  labelEn: string;
  labelHi: string;
  query: string;
  icon: string;
}

// Error types
export type ErrorType = 'network' | 'api' | 'voice' | 'storage' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  timestamp: number;
  recoverable: boolean;
}
