export type GoogleCalendarStatus = 'connected' | 'disconnected' | 'expired' | 'error';

export interface GoogleCalendarConnectionStatus {
  connected: boolean;
  status: GoogleCalendarStatus;
  email: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
}

export interface CalendarBusyPeriod {
  start: string;
  end: string;
}
