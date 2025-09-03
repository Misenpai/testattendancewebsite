// src/app/types/index.ts
export interface Photo {
  url: string;
  type?: string;
}

export interface Audio {
  url: string;
  duration?: number;
}

export interface Attendance {
  date: string;
  checkinTime: string;
  checkoutTime?: string;
  sessionType?: 'FN' | 'AF';
  isFullDay?: boolean;
  isHalfDay?: boolean;
  isCheckedOut?: boolean;
  location?: string;
  takenLocation?: string;
  photos: Photo[];
  audio: Audio[];
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