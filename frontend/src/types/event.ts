export interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  attendee_name?: string;
  attendee_email?: string;
  is_confirmed: boolean;
  created_at: string;
}

export interface EventCreate {
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  attendee_name?: string;
  attendee_email?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  event?: Event;
  date: Date;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasEvents: boolean;
  available: boolean;
  timeSlots: TimeSlot[];
}

export interface EventUpdate extends Partial<EventCreate> {
  is_confirmed?: boolean
}