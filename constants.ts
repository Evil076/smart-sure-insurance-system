
import { Hospital, HospitalLevel, InsuranceProvider } from './types';

export const INSURANCE_PROVIDERS: InsuranceProvider[] = [
  { id: "p1", name: "NHIF (Social Health Authority)", tier: "Public" },
  { id: "p2", name: "Britam Insurance", tier: "Private" },
  { id: "p3", name: "Jubilee Health", tier: "Private" },
  { id: "p4", name: "UAP Old Mutual", tier: "Private" },
  { id: "p5", name: "Madison Insurance", tier: "Private" },
];

export const KISII_HOSPITALS: Hospital[] = [
  {
    id: "h1",
    name: "Kisii Teaching & Referral Hospital (KTRH)",
    latitude: -0.6784,
    longitude: 34.7731,
    level: HospitalLevel.LEVEL_5,
    contact: "058-30005",
    accreditedProviders: ["p1", "p2", "p3", "p4", "p5"],
    resources: {
      totalBeds: 450,
      availableBeds: 12,
      icuBeds: 5,
      doctorsOnDuty: 45,
      nursesOnDuty: 120,
      specialists: [
        { name: "Dr. Nyasani", field: "Gynecologist", availableDays: ["Mon", "Tue", "Thu"], isOnDuty: true },
        { name: "Dr. Mogaka", field: "Dentist", availableDays: ["Wed", "Fri"], isOnDuty: false }
      ]
    }
  },
  {
    id: "h2",
    name: "Oasis Specialist Hospital",
    latitude: -0.6751,
    longitude: 34.7712,
    level: HospitalLevel.LEVEL_4,
    contact: "0720 000000",
    accreditedProviders: ["p2", "p3", "p4"],
    resources: {
      totalBeds: 120,
      availableBeds: 34,
      icuBeds: 8,
      doctorsOnDuty: 12,
      nursesOnDuty: 30,
      specialists: [
        { name: "Dr. Kwamboka", field: "Pediatrician", availableDays: ["Mon", "Wed", "Fri"], isOnDuty: true },
        { name: "Dr. Omari", field: "Cardiologist", availableDays: ["Tue", "Sat"], isOnDuty: true }
      ]
    }
  },
  {
    id: "h3",
    name: "Christamarianne Mission Hospital",
    latitude: -0.6865,
    longitude: 34.7798,
    level: HospitalLevel.LEVEL_4,
    contact: "0711 111111",
    accreditedProviders: ["p1", "p2", "p4"],
    resources: {
      totalBeds: 80,
      availableBeds: 5,
      icuBeds: 2,
      doctorsOnDuty: 8,
      nursesOnDuty: 22,
      specialists: [
        { name: "Dr. Bitange", field: "Gynecologist", availableDays: ["Mon", "Wed"], isOnDuty: false }
      ]
    }
  },
  {
    id: "h4",
    name: "RAM Hospital",
    latitude: -0.6766,
    longitude: 34.7741,
    level: HospitalLevel.LEVEL_5,
    contact: "0700 123456",
    accreditedProviders: ["p1", "p2", "p3", "p4", "p5"],
    resources: {
      totalBeds: 200,
      availableBeds: 45,
      icuBeds: 10,
      doctorsOnDuty: 15,
      nursesOnDuty: 40,
      specialists: [
        { name: "Dr. Onyango", field: "Surgeon", availableDays: ["Mon-Fri"], isOnDuty: true },
        { name: "Dr. Patel", field: "ENT", availableDays: ["Tue", "Thu"], isOnDuty: true }
      ]
    }
  },
  {
    id: "h5",
    name: "Bosongo Hospital",
    latitude: -0.6643,
    longitude: 34.7546,
    level: HospitalLevel.LEVEL_4,
    contact: "0722 987654",
    accreditedProviders: ["p2", "p3", "p4"],
    resources: {
      totalBeds: 100,
      availableBeds: 20,
      icuBeds: 4,
      doctorsOnDuty: 10,
      nursesOnDuty: 25,
      specialists: [
        { name: "Dr. Makori", field: "Dermatologist", availableDays: ["Wed"], isOnDuty: false },
        { name: "Dr. Kemunto", field: "Pediatrician", availableDays: ["Mon", "Sat"], isOnDuty: true }
      ]
    }
  },
  {
    id: "h6",
    name: "Nyangena Hospital",
    latitude: -0.6624,
    longitude: 34.7491,
    level: HospitalLevel.LEVEL_4,
    contact: "0733 555555",
    accreditedProviders: ["p1", "p2"],
    resources: {
      totalBeds: 150,
      availableBeds: 60,
      icuBeds: 6,
      doctorsOnDuty: 14,
      nursesOnDuty: 35,
      specialists: [
        { name: "Dr. Ochieng", field: "Orthopedic", availableDays: ["Thu"], isOnDuty: true }
      ]
    }
  },
  {
    id: "h7",
    name: "Tabaka Mission Hospital",
    latitude: -0.7445,
    longitude: 34.6665,
    level: HospitalLevel.LEVEL_4,
    contact: "0720 111222",
    accreditedProviders: ["p1", "p4", "p5"],
    resources: {
      totalBeds: 180,
      availableBeds: 80,
      icuBeds: 5,
      doctorsOnDuty: 9,
      nursesOnDuty: 28,
      specialists: [
        { name: "Dr. Sister Maria", field: "General Physician", availableDays: ["Mon-Sat"], isOnDuty: true }
      ]
    }
  },
  {
    id: "h8",
    name: "Mediforte Hospital",
    latitude: -0.6568,
    longitude: 34.7695,
    level: HospitalLevel.LEVEL_4,
    contact: "0712 345678",
    accreditedProviders: ["p2", "p3"],
    resources: {
      totalBeds: 60,
      availableBeds: 15,
      icuBeds: 3,
      doctorsOnDuty: 6,
      nursesOnDuty: 18,
      specialists: [
        { name: "Dr. Ahmed", field: "Ophthalmologist", availableDays: ["Tue", "Fri"], isOnDuty: true }
      ]
    }
  }
];

export const MOCK_POLICY_TEXT = `
NHIF Outpatient Benefits (2024):
- Coverage includes consultation, laboratory tests, drugs, and minor procedures.
- Pre-authorization is required for specialized imaging (MRI/CT).

Britam Health Policy:
- Maternity cover has a 10-month waiting period.
- Access to private facilities in Kisii like Oasis and Ram is supported for Gold members.
`;
export const KISII_CENTER = { lat: -0.6817, lng: 34.7758 };
