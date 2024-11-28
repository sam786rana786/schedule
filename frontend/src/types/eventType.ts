export interface BookingRules {
    min_notice?: number;
    max_notice?: number;
    buffer_before?: number;
    buffer_after?: number;
    min_booking_notice?: number;
    max_bookings_per_day?: number;
  }
  
  export interface Question {
    id: string;
    type: 'text' | 'textarea' | 'select';
    label: string;
    required: boolean;
    options?: string[];
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