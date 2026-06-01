
export enum HospitalLevel {
  LEVEL_2 = "Level 2 (Dispensary)",
  LEVEL_3 = "Level 3 (Health Centre)",
  LEVEL_4 = "Level 4 (Sub-County Hospital)",
  LEVEL_5 = "Level 5 (County Referral)",
  LEVEL_6 = "Level 6 (National Referral)"
}

export interface Specialist {
  name: string;
  field: string;
  availableDays: string[];
  isOnDuty: boolean;
}

export interface HospitalResources {
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
  doctorsOnDuty: number;
  nursesOnDuty: number;
  specialists: Specialist[];
}

export interface InsuranceProvider {
  id: string;
  name: string;
  tier: "Public" | "Private" | "Premium";
}

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  level: HospitalLevel;
  contact: string;
  accreditedProviders: string[];
  resources: HospitalResources;
}

export type Language = 'en' | 'sw' | 'ek';
export type UserRole = 'patient' | 'admin' | 'hospital_admin' | 'insurance_provider';

export enum AppMode {
  STANDARD = "Standard",
  LITE = "Lite (Low-Data)"
}

export interface Beneficiary {
  id: string;
  name: string;
  relation: 'Self' | 'Spouse' | 'Child';
  idNumber?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  hospitalId?: string;
  age: number;
  dependents: number;
  monthlyBudget: number;
  priority: 'cost' | 'coverage' | 'maternity';
  beneficiaries: Beneficiary[];
  chronicConditions?: string[]; // New: e.g. ["Diabetes", "Asthma"]
  lifeEvent?: 'none' | 'pregnancy' | 'surgery' | 'elderly_care'; // New
  employmentType?: 'formal' | 'informal' | 'student' | 'unemployed'; // New
  preferredHospitalTier?: 'public' | 'mid-tier' | 'premium'; // New
}

export interface OCRResult {
  provider: string;
  membershipNumber: string;
  expiryDate?: string;
}

export interface PreAuthResponse {
  isCovered: boolean;
  estimatedApprovalRate: number;
  reasoning: string;
  actionRequired: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  hospitalId: string;
  date: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  doctorNote?: string;
  blockchainHash?: string;
}
