import { Moment } from 'moment';

export interface RemoteFileInfo {
  path: string;
  hash: string;
  size: number;
}

export interface LogConfig {
  channels: LogEntry['channels'];
}

export interface LogEntry {
  level: 'log' | 'warn' | 'error';
  message: string;
  channels: ('file' | 'log' | 'main')[];
}

export interface PatchNote {
  body: string;
  name: string;
  published_at: Moment;
}

export interface ScenarioLUA {
  author?: string;
  name?: string;
  description?: string;
  map_version: string;
  size?: number;
  players?: number;
}
