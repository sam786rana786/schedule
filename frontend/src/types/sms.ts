// src/types/sms.ts
export type SMSProvider = 'twilio' | 'google' | 'custom';

export interface SMSConfig {
  provider: SMSProvider;
  account_sid?: string;
  auth_token?: string;
  from_number?: string;
  api_key?: string;
  api_url?: string;
}

export interface SMSSubscription extends SMSConfig {
  id: number;
  user_id: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface TwilioConfig extends SMSConfig {
  provider: 'twilio';
  account_sid: string;
  auth_token: string;
  from_number: string;
}

export interface GoogleConfig extends SMSConfig {
  provider: 'google';
  project_id: string;
  credentials: string;
}

export interface CustomConfig extends SMSConfig {
  provider: 'custom';
  api_key: string;
  api_url: string;
}

export type ProviderConfig = TwilioConfig | GoogleConfig | CustomConfig;