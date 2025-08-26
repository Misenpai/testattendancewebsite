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
  checkInTime: string;
  checkOutTime?: string;
  sessionType?: 'FORENOON' | 'AFTERNOON';
  attendanceType?: 'FULL_DAY' | 'HALF_DAY';
  isCheckedOut?: boolean;
  location?: string;
  takenLocation?: string;
  photos: Photo[];
  audio: Audio[];
}

export interface User {
  empCode: string;  // Changed from empId
  username: string;
  email: string;
  department: string;
  locationType: 'APPROX' | 'ABSOLUTE';
  isActive: boolean;
  monthlyStatistics?: {
    totalDays: number;
    fullDays: number;
    halfDays: number;
  };
  attendances: Attendance[];
  fieldTrips?: FieldTrip[];
}

export interface FieldTrip {
  startDate: string;
  endDate: string;
  description?: string;
}

export interface ApiResponse {
  success: boolean;
  month: number;
  year: number;
  totalUsers: number;
  data: User[];
}

export interface Filters {
  month: number;
  year: number;
  apiBase: string;
}