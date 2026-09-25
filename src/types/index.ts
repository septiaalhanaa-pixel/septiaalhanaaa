export type UserRole = 'admin' | 'ops_manager' | 'finance' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  avatar?: string;
}

export type VesselType = 'Container' | 'Bulk Carrier' | 'Tanker' | 'Ro-Ro' | 'Tug & Barge' | 'LCT';
export type VesselStatus = 'Underway' | 'In Port' | 'At Anchor' | 'Maintenance' | 'Loading' | 'Discharging';

export interface Vessel {
  id: string;
  name: string;
  callSign: string;
  imoNumber: string;
  mmsi: string;
  type: VesselType;
  capacityTEU: number;
  capacityDWT: number;
  yearBuilt: number;
  speedKnots: number;
  maxSpeedKnots: number;
  status: VesselStatus;
  currentLat: number;
  currentLng: number;
  heading: number; // 0 - 360 degrees
  currentPortId?: string;
  destinationPortId?: string;
  currentRouteId?: string;
  captain: string;
  crewCount: number;
  fuelLevelPct: number;
  fuelBunkerType: 'MGO' | 'HFO' | 'VLSFO' | 'LNG';
  fuelConsumptionPerNM: number; // in Liters
  nextMaintenanceDate: string;
  notes?: string;
  image?: string;
}

export interface Port {
  id: string;
  code: string;
  name: string;
  city: string;
  province: string;
  country: string;
  coordinates: [number, number]; // [lat, lng]
  berthCapacity: number;
  maxDraftMeters: number;
  craneCount: number;
  operationalHours: string;
  contactPhone: string;
  status: 'Operasional' | 'Padat / Congested' | 'Perbaikan / Maintenance';
}

export interface Route {
  id: string;
  code: string;
  name: string;
  originPortId: string;
  destinationPortId: string;
  distanceNM: number; // Nautical Miles
  estimatedHours: number;
  waypoints: [number, number][]; // [lat, lng] list
  baseRatePerTEU: number; // IDR
  baseRatePerTon: number; // IDR
  status: 'Aktif' | 'Nonaktif' | 'Waspada Cuaca';
}

export type CargoCategory = 'Container FCL' | 'Container LCL' | 'Curah Kering (Bulk)' | 'Curah Cair (Liquid)' | 'Reefer / Pendingin' | 'General Cargo' | 'Kendaraan / Heavy Lift';

export interface Commodity {
  id: string;
  code: string;
  name: string;
  category: CargoCategory;
  unit: 'TEU' | 'FEU' | 'Ton' | 'CBM' | 'Unit';
  tariffPerUnit: number; // IDR
  handlingFee: number; // IDR
  insuranceRatePct: number; // %
  requiresReefer: boolean;
  dangerousGoodsClass?: string; // IMO Class e.g. "Class 3 - Flammable" or "-"
  description?: string;
}

export interface Customer {
  id: string;
  code: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  taxId: string; // NPWP
  paymentTerms: 'Cash Before Loading' | 'Net 14 Days' | 'Net 30 Days' | 'Net 45 Days';
  creditLimit: number; // IDR
  totalShipments: number;
  status: 'Aktif' | 'Suspended' | 'Prospek';
}

export type BookingStatus = 'Draft' | 'Confirmed' | 'Loading' | 'In Transit' | 'Arrived' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Belum Bayar' | 'DP Dibayar' | 'Lunas';

export interface TrackingEvent {
  id: string;
  timestamp: string;
  status: BookingStatus;
  locationName: string;
  coordinates?: [number, number];
  description: string;
  updatedBy: string;
  notifiedCustomer: boolean;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. BKG-2025-0891
  blNumber: string; // Bill of Lading e.g. BL-SML-25-0012
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  vesselId: string;
  vesselName: string;
  routeId: string;
  originPortId: string;
  destinationPortId: string;
  departureDate: string;
  estimatedArrivalDate: string;
  actualArrivalDate?: string;
  status: BookingStatus;
  commodityId: string;
  commodityName: string;
  cargoCategory: CargoCategory;
  quantity: number; // e.g. 10 TEU or 500 Ton
  quantityUnit: string;
  grossWeightTon: number;
  volumeCBM: number;
  containerNumbers?: string[]; // e.g. ["TEMU9821430", "SMLU1234901"]
  sealNumbers?: string[];
  freightTotal: number;
  handlingTotal: number;
  insuranceCost: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'Bank Transfer' | 'Letter of Credit (L/C)' | 'Giro' | 'Cash';
  trackingEvents: TrackingEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoyageLog {
  id: string;
  voyageNumber: string; // e.g. VOY-2025-04A
  vesselId: string;
  vesselName: string;
  routeId: string;
  originPortId: string;
  destinationPortId: string;
  etd: string;
  eta: string;
  actualDeparture?: string;
  actualArrival?: string;
  currentLat: number;
  currentLng: number;
  heading: number;
  speedKnots: number;
  distanceTraveledNM: number;
  totalDistanceNM: number;
  fuelConsumptionLiters: number;
  weatherCondition: 'Cerah Berawan' | 'Hujan Ringan' | 'Gelombang Tinggi (2.5m)' | 'Badai / Ombak Ekstrem' | 'Tenang';
  seaStateBft: number; // Beaufort Scale 1 - 12
  engineRpm: number;
  status: 'Scheduled' | 'Sailing' | 'Arrived' | 'Delayed' | 'Docking';
  captainReport?: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  recipientPhone: string;
  recipientEmail: string;
  customerName: string;
  bookingNumber: string;
  type: 'whatsapp' | 'email' | 'sms';
  title: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
  directWhatsAppUrl?: string;
}

export interface DatabaseConfig {
  provider: 'local_storage' | 'supabase' | 'neon_pg' | 'firebase';
  supabaseUrl: string;
  supabaseAnonKey: string;
  neonConnectionString: string;
  firebaseProjectId: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  tableStats?: {
    vessels: number;
    ports: number;
    routes: number;
    commodities: number;
    customers: number;
    bookings: number;
    voyages: number;
  };
}
