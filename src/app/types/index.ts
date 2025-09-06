// src/app/types/index.ts

export interface Photo {
  url: string;
  type?: string;
}

export interface Audio {
  url: string;
  duration?: number;
}

// Update the Attendance interface
export interface Attendance {
  date: string;
  checkinTime: string;
  checkoutTime?: string;  // This can be null now
  sessionType?: 'FN' | 'AF';
  attendanceType?: 'FULL_DAY' | 'HALF_DAY';  // Can be null if not checked out
  locationType?: 'CAMPUS' | 'FIELDTRIP';
  takenLocation?: string;
  
  // Single photo/audio instead of arrays
  photo?: {
    url: string;
  } | null;
  audio?: {
    url: string;
    duration?: number;
  } | null;
  
  location?: {
    takenLocation?: string;
    latitude?: number | null;
    longitude?: number | null;
    county?: string | null;
    state?: string | null;
    postcode?: string | null;
    address?: string | null;
  };
  
  // Computed properties for UI
  isCheckedOut?: boolean;
  isFullDay?: boolean;
  isHalfDay?: boolean;
}

export interface User {
  employeeNumber: string;
  username: string;
  empClass: string;
  dateOfResign?: string;
  projects: {
    projectCode: string;
    department: string;
  }[];
  hasActiveFieldTrip: boolean;
  monthlyStatistics: {
    totalDays: number;
    fullDays: number;
    halfDays: number;
    notCheckedOut: number;
  };
  attendances: Attendance[];
}

export interface FieldTrip {
  startDate: string;
  endDate: string;
  description?: string;
}

export interface PIUser {
  principalInvestigatorKey: string;
  username: string;
  projectCode: string;
  projects?: string[];
}

export interface ApiResponse {
  success: boolean;
  month: number;
  year: number;
  totalUsers: number;
  data: User[];
}

export interface CalendarDay {
  date: string;
  isHoliday: boolean;
  isWeekend: boolean;
  description?: string;
  attendances: {
    [employeeNumber: string]: {
      present: boolean;
      type: 'FULL_DAY' | 'HALF_DAY' | 'IN_PROGRESS';
      username: string;
    };
  };
}

export interface AuthUser {
  username: string;
  projectCode: string;
  projects: string[];
  token: string;
}