export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export enum ModelIds {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
}