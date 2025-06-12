// Session-related type definitions

export interface SessionInfo {
  sessionId: string;
  startTime: Date;
  isActive: boolean;
  messageCount: number;
  learningMode: string;
  lastActivity: Date;
}
