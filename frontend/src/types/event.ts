export interface Event {
  id: number;
  user_id: number;
  event_type_id?: number;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  attendee_name?: string;
  attendee_email?: string;
  location?: string;
  answers?: Record<string, any>;
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
  location?: string;
  answers?: Record<string, any>;
}

export interface EventUpdate extends Partial<EventCreate> {
  is_confirmed?: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  date: Date;
  start_time: string;
  end_time: string;
  event?: {
    attendee_name?: string;
  };
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasEvents: boolean;
  available: boolean;
  timeSlots: TimeSlot[];
}

export interface EventType {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description?: string;
  duration: number;
  color: string;
  is_active: boolean;
  locations?: string[];
  questions?: Question[];
  booking_rules?: BookingRules;
}

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select';
  label: string;
  required: boolean;
  options?: string[];
}

export interface BookingRules {
  buffer_before?: number;    // minutes
  buffer_after?: number;     // minutes
  min_notice?: number;       // minutes
  max_notice?: number;       // minutes
  future_limit?: number;     // days
  min_booking_notice?: number;
  max_bookings_per_day?: number;
}

export interface Location {
  type: string;  // 'google_meet' | 'zoom' | 'in_person' | 'phone'
  details?: Record<string, any>;
}

export interface BookingData {
  eventTypeId: number;
  date: string;
  time: string;
  name: string;
  email: string;
  notes?: string;
  location?: string;
  answers?: Record<string, string>;
}

export interface AvailabilityResponse {
  event_type_id: number;
  available_slots: Array<{
    start: string;
    end: string;
  }>;
}

export interface EventList {
  items: Event[];
  total: number;
  page: number;
  pages: number;
}

export type EventStatus = 'upcoming' | 'past' | 'all';

export interface EventFilters {
  status?: EventStatus;
  page?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface EventTypeCreate {
  name: string;
  description?: string;
  duration: number;
  color?: string;
  locations?: Location[];
  booking_rules?: BookingRules;
}

export interface EventTypeUpdate extends Partial<EventTypeCreate> {
  is_active?: boolean;
}

export interface BookingConfirmation {
  id: number;
  event_type: EventType;
  start_time: string;
  end_time: string;
  attendee_name: string;
  attendee_email: string;
  location: string;
  calendar_links: {
    google?: string;
    outlook?: string;
    ics?: string;
  };
}