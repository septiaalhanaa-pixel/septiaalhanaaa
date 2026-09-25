import { 
  Vessel, Port, Route, Commodity, Customer, Booking, VoyageLog, User, 
  NotificationLog, DatabaseConfig, BookingStatus, TrackingEvent 
} from '../types';
import { 
  INITIAL_VESSELS, INITIAL_PORTS, INITIAL_ROUTES, INITIAL_COMMODITIES, 
  INITIAL_CUSTOMERS, INITIAL_BOOKINGS, INITIAL_VOYAGES, INITIAL_USERS, 
  INITIAL_NOTIFICATIONS 
} from './initialData';

const DB_PREFIX = 'nauticalog_db_v1_';
const KEYS = {
  VESSELS: `${DB_PREFIX}vessels`,
  PORTS: `${DB_PREFIX}ports`,
  ROUTES: `${DB_PREFIX}routes`,
  COMMODITIES: `${DB_PREFIX}commodities`,
  CUSTOMERS: `${DB_PREFIX}customers`,
  BOOKINGS: `${DB_PREFIX}bookings`,
  VOYAGES: `${DB_PREFIX}voyages`,
  USERS: `${DB_PREFIX}users`,
  NOTIFICATIONS: `${DB_PREFIX}notifications`,
  CURRENT_USER: `${DB_PREFIX}current_user`,
  CONFIG: `${DB_PREFIX}config`,
};

// Real-time synchronization bus across browser tabs
const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('nauticalog_sync_channel') : null;

// Helper to safely read from localStorage
function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

// Helper to safely write to localStorage & notify
function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (syncChannel) {
      syncChannel.postMessage({ key, timestamp: Date.now() });
    }
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Initialize database with default data if empty
export function initDatabase(): void {
  if (!localStorage.getItem(KEYS.VESSELS)) {
    setStorage(KEYS.VESSELS, INITIAL_VESSELS);
  }
  if (!localStorage.getItem(KEYS.PORTS)) {
    setStorage(KEYS.PORTS, INITIAL_PORTS);
  }
  if (!localStorage.getItem(KEYS.ROUTES)) {
    setStorage(KEYS.ROUTES, INITIAL_ROUTES);
  }
  if (!localStorage.getItem(KEYS.COMMODITIES)) {
    setStorage(KEYS.COMMODITIES, INITIAL_COMMODITIES);
  }
  if (!localStorage.getItem(KEYS.CUSTOMERS)) {
    setStorage(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }
  if (!localStorage.getItem(KEYS.BOOKINGS)) {
    setStorage(KEYS.BOOKINGS, INITIAL_BOOKINGS);
  }
  if (!localStorage.getItem(KEYS.VOYAGES)) {
    setStorage(KEYS.VOYAGES, INITIAL_VOYAGES);
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    setStorage(KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    setStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    setStorage(KEYS.CURRENT_USER, INITIAL_USERS[0]); // Default to Admin
  }
  if (!localStorage.getItem(KEYS.CONFIG)) {
    const initialConfig: DatabaseConfig = {
      provider: 'local_storage',
      supabaseUrl: '',
      supabaseAnonKey: '',
      neonConnectionString: '',
      firebaseProjectId: '',
      isConnected: true,
      lastSyncedAt: new Date().toISOString()
    };
    setStorage(KEYS.CONFIG, initialConfig);
  }
}

// Broadcast listener helper
export function onDataChange(callback: () => void): () => void {
  if (!syncChannel) return () => {};
  const handler = () => callback();
  syncChannel.addEventListener('message', handler);
  return () => syncChannel.removeEventListener('message', handler);
}

// ======================== AUTH & USERS ========================
export const authService = {
  getCurrentUser(): User | null {
    return getStorage<User | null>(KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },
  setCurrentUser(user: User | null): void {
    setStorage(KEYS.CURRENT_USER, user);
  },
  getAllUsers(): User[] {
    return getStorage<User[]>(KEYS.USERS, INITIAL_USERS);
  },
  login(email: string, _password?: string): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      this.setCurrentUser(found);
      return { success: true, user: found };
    }
    // Auto demo login fallback for new emails
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0].toUpperCase(),
      role: 'ops_manager',
      companyName: 'PT Samudera Logistik Nusantara'
    };
    const updated = [...users, newUser];
    setStorage(KEYS.USERS, updated);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },
  register(name: string, email: string, role: User['role'], companyName?: string): User {
    const users = this.getAllUsers();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      role,
      companyName: companyName || 'PT Samudera Logistik Nusantara'
    };
    setStorage(KEYS.USERS, [...users, newUser]);
    this.setCurrentUser(newUser);
    return newUser;
  },
  logout(): void {
    setStorage(KEYS.CURRENT_USER, null);
  }
};

// ======================== VESSELS / ARMADA (CRUD) ========================
export const vesselService = {
  getAll(): Vessel[] {
    return getStorage<Vessel[]>(KEYS.VESSELS, INITIAL_VESSELS);
  },
  getById(id: string): Vessel | undefined {
    return this.getAll().find(v => v.id === id);
  },
  create(data: Omit<Vessel, 'id'>): Vessel {
    const items = this.getAll();
    const newItem: Vessel = {
      ...data,
      id: `ves-${Date.now().toString(36)}`
    };
    setStorage(KEYS.VESSELS, [newItem, ...items]);
    return newItem;
  },
  update(id: string, updates: Partial<Vessel>): Vessel | null {
    const items = this.getAll();
    const index = items.findIndex(v => v.id === id);
    if (index === -1) return null;
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    setStorage(KEYS.VESSELS, items);
    return updated;
  },
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(v => v.id !== id);
    if (filtered.length === items.length) return false;
    setStorage(KEYS.VESSELS, filtered);
    return true;
  }
};

// ======================== PORTS / PELABUHAN (CRUD) ========================
export const portService = {
  getAll(): Port[] {
    return getStorage<Port[]>(KEYS.PORTS, INITIAL_PORTS);
  },
  getById(id: string): Port | undefined {
    return this.getAll().find(p => p.id === id);
  },
  create(data: Omit<Port, 'id'>): Port {
    const items = this.getAll();
    const newItem: Port = {
      ...data,
      id: `prt-${Date.now().toString(36)}`
    };
    setStorage(KEYS.PORTS, [newItem, ...items]);
    return newItem;
  },
  update(id: string, updates: Partial<Port>): Port | null {
    const items = this.getAll();
    const index = items.findIndex(p => p.id === id);
    if (index === -1) return null;
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    setStorage(KEYS.PORTS, items);
    return updated;
  },
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(p => p.id !== id);
    if (filtered.length === items.length) return false;
    setStorage(KEYS.PORTS, filtered);
    return true;
  }
};

// ======================== ROUTES / RUTE (CRUD) ========================
export const routeService = {
  getAll(): Route[] {
    return getStorage<Route[]>(KEYS.ROUTES, INITIAL_ROUTES);
  },
  getById(id: string): Route | undefined {
    return this.getAll().find(r => r.id === id);
  },
  create(data: Omit<Route, 'id'>): Route {
    const items = this.getAll();
    const newItem: Route = {
      ...data,
      id: `rot-${Date.now().toString(36)}`
    };
    setStorage(KEYS.ROUTES, [newItem, ...items]);
    return newItem;
  },
  update(id: string, updates: Partial<Route>): Route | null {
    const items = this.getAll();
    const index = items.findIndex(r => r.id === id);
    if (index === -1) return null;
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    setStorage(KEYS.ROUTES, items);
    return updated;
  },
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(r => r.id !== id);
    if (filtered.length === items.length) return false;
    setStorage(KEYS.ROUTES, filtered);
    return true;
  }
};

// ======================== COMMODITIES / KOMODITAS & TARIF (CRUD) ========================
export const commodityService = {
  getAll(): Commodity[] {
    return getStorage<Commodity[]>(KEYS.COMMODITIES, INITIAL_COMMODITIES);
  },
  getById(id: string): Commodity | undefined {
    return this.getAll().find(c => c.id === id);
  },
  create(data: Omit<Commodity, 'id'>): Commodity {
    const items = this.getAll();
    const newItem: Commodity = {
      ...data,
      id: `cmd-${Date.now().toString(36)}`
    };
    setStorage(KEYS.COMMODITIES, [newItem, ...items]);
    return newItem;
  },
  update(id: string, updates: Partial<Commodity>): Commodity | null {
    const items = this.getAll();
    const index = items.findIndex(c => c.id === id);
    if (index === -1) return null;
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    setStorage(KEYS.COMMODITIES, items);
    return updated;
  },
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(c => c.id !== id);
    if (filtered.length === items.length) return false;
    setStorage(KEYS.COMMODITIES, filtered);
    return true;
  }
};

// ======================== CUSTOMERS / PELANGGAN (CRUD) ========================
export const customerService = {
  getAll(): Customer[] {
    return getStorage<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },
  getById(id: string): Customer | undefined {
    return this.getAll().find(c => c.id === id);
  },
  create(data: Omit<Customer, 'id' | 'totalShipments'>): Customer {
    const items = this.getAll();
    const newItem: Customer = {
      ...data,
      totalShipments: 0,
      id: `cst-${Date.now().toString(36)}`
    };
    setStorage(KEYS.CUSTOMERS, [newItem, ...items]);
    return newItem;
  },
  update(id: string, updates: Partial<Customer>): Customer | null {
    const items = this.getAll();
    const index = items.findIndex(c => c.id === id);
    if (index === -1) return null;
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    setStorage(KEYS.CUSTOMERS, items);
    return updated;
  },
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(c => c.id !== id);
    if (filtered.length === items.length) return false;
    setStorage(KEYS.CUSTOMERS, filtered);
    return true;
  }
};

// ======================== BOOKINGS & TRANSAKSI (CRUD) ========================
export const bookingService = {
  getAll(): Booking[] {
    return getStorage<Booking[]>(KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },
  getById(id: string): Booking | undefined {
    return this.getAll().find(b => b.id === id);
  },
  getByBLNumber(blOrBkg: string): Booking | undefined {
    const clean = blOrBkg.trim().toUpperCase();
    return this.getAll().find(
      b => b.blNumber.toUpperCase() === clean || b.bookingNumber.toUpperCase() === clean
    );
  },
  create(data: Omit<Booking, 'id' | 'bookingNumber' | 'blNumber' | 'createdAt' | 'updatedAt' | 'trackingEvents'>): Booking {
    const items = this.getAll();
    const year = new Date().getFullYear();
    const seq = (items.length + 1).toString().padStart(4, '0');
    const bookingNumber = `BKG-${year}-${seq}`;
    const blNumber = `BL-SML-${year.toString().slice(-2)}-${seq}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const initialTracking: TrackingEvent = {
      id: `trk-${Date.now()}`,
      timestamp: now,
      status: data.status || 'Confirmed',
      locationName: 'Kantor Operasional Samudera',
      description: `Surat Muatan & Booking ${bookingNumber} berhasil diterbitkan dalam sistem.`,
      updatedBy: 'Admin Ops',
      notifiedCustomer: true
    };

    const newBooking: Booking = {
      ...data,
      id: `bkg-${Date.now().toString(36)}`,
      bookingNumber,
      blNumber,
      trackingEvents: [initialTracking],
      createdAt: now,
      updatedAt: now
    };

    setStorage(KEYS.BOOKINGS, [newBooking, ...items]);

    // Dispatch automatic customer notification
    dispatchAutomatedCustomerNotification(newBooking, initialTracking);

    // Update customer shipment count
    if (data.customerId) {
      const cust = customerService.getById(data.customerId);
      if (cust) {
        customerService.update(data.customerId, { totalShipments: (cust.totalShipments || 0) + 1 });
      }
    }

    return newBooking;
  },
  update(id: string, updates: Partial<Booking>): Booking | null {
    const items = this.getAll();
    const index = items.findIndex(b => b.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = { ...items[index], ...updates, updatedAt: now };
    items[index] = updated;
    setStorage(KEYS.BOOKINGS, items);
    return updated;
  },
  updateStatus(id: string, newStatus: BookingStatus, locationName: string, description: string, updatedBy = 'Admin Ops'): Booking | null {
    const booking = this.getById(id);
    if (!booking) return null;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    
    const newEvent: TrackingEvent = {
      id: `trk-${Date.now()}`,
      timestamp: now,
      status: newStatus,
      locationName,
      description,
      updatedBy,
      notifiedCustomer: true
    };

    const updatedEvents = [...booking.trackingEvents, newEvent];
    const updated = this.update(id, {
      status: newStatus,
      trackingEvents: updatedEvents,
      updatedAt: now
    });

    if (updated) {
      dispatchAutomatedCustomerNotification(updated, newEvent);
    }

    return updated;
  },
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(b => b.id !== id);
    if (filtered.length === items.length) return false;
    setStorage(KEYS.BOOKINGS, filtered);
    return true;
  }
};

// ======================== VOYAGES & AIS LOG (CRUD) ========================
export const voyageService = {
  getAll(): VoyageLog[] {
    return getStorage<VoyageLog[]>(KEYS.VOYAGES, INITIAL_VOYAGES);
  },
  getById(id: string): VoyageLog | undefined {
    return this.getAll().find(v => v.id === id);
  },
  create(data: Omit<VoyageLog, 'id' | 'updatedAt'>): VoyageLog {
    const items = this.getAll();
    const newItem: VoyageLog = {
      ...data,
      id: `voy-${Date.now().toString(36)}`,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setStorage(KEYS.VOYAGES, [newItem, ...items]);
    return newItem;
  },
  update(id: string, updates: Partial<VoyageLog>): VoyageLog | null {
    const items = this.getAll();
    const index = items.findIndex(v => v.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = { ...items[index], ...updates, updatedAt: now };
    items[index] = updated;
    setStorage(KEYS.VOYAGES, items);
    return updated;
  },
  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(v => v.id !== id);
    if (filtered.length === items.length) return false;
    setStorage(KEYS.VOYAGES, filtered);
    return true;
  }
};

// ======================== NOTIFICATIONS ========================
export const notificationService = {
  getAll(): NotificationLog[] {
    return getStorage<NotificationLog[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  create(notif: Omit<NotificationLog, 'id' | 'timestamp'>): NotificationLog {
    const items = this.getAll();
    const newItem: NotificationLog = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setStorage(KEYS.NOTIFICATIONS, [newItem, ...items]);
    return newItem;
  }
};

// Auto Notification Trigger Helper
function dispatchAutomatedCustomerNotification(booking: Booking, event: TrackingEvent): void {
  const phone = (booking.customerWhatsapp || booking.customerPhone || '').replace(/[^0-9]/g, '');
  const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
  
  let emoji = '🚢';
  if (event.status === 'Loading') emoji = '🏗️';
  if (event.status === 'In Transit') emoji = '🌊';
  if (event.status === 'Arrived') emoji = '⚓';
  if (event.status === 'Delivered') emoji = '✅';

  const title = `${emoji} [NOTIFIKASI MARITIM] Status Muatan ${booking.bookingNumber} (${event.status})`;
  const msgBody = `Yth. ${booking.customerName},\n\nUpdate status muatan kapal Anda:\n📦 No. B/L: ${booking.blNumber}\n🚢 Kapal: ${booking.vesselName}\n📍 Posisi/Lokasi: ${event.locationName}\n📋 Status: ${event.status}\n📝 Keterangan: ${event.description}\n\nLacak posisi realtime peta kapal: ${window.location.origin}/#track=${booking.blNumber}\n\nTerima kasih,\nPT Samudera Logistik Nusantara`;

  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgBody)}` : undefined;

  notificationService.create({
    recipientPhone: cleanPhone || '6281200000000',
    recipientEmail: `${booking.customerId}@client.id`,
    customerName: booking.customerName,
    bookingNumber: booking.bookingNumber,
    type: 'whatsapp',
    title,
    message: msgBody,
    status: 'delivered',
    directWhatsAppUrl: waUrl
  });
}

// ======================== DATABASE SETTINGS & MULTI-DB SYNC ========================
export const dbConfigService = {
  getConfig(): DatabaseConfig {
    return getStorage<DatabaseConfig>(KEYS.CONFIG, {
      provider: 'local_storage',
      supabaseUrl: '',
      supabaseAnonKey: '',
      neonConnectionString: '',
      firebaseProjectId: '',
      isConnected: true,
      lastSyncedAt: new Date().toISOString()
    });
  },
  saveConfig(config: Partial<DatabaseConfig>): DatabaseConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config, lastSyncedAt: new Date().toISOString() };
    setStorage(KEYS.CONFIG, updated);
    return updated;
  },
  exportAllDataJson(): string {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      vessels: vesselService.getAll(),
      ports: portService.getAll(),
      routes: routeService.getAll(),
      commodities: commodityService.getAll(),
      customers: customerService.getAll(),
      bookings: bookingService.getAll(),
      voyages: voyageService.getAll(),
      notifications: notificationService.getAll()
    };
    return JSON.stringify(payload, null, 2);
  },
  importAllDataJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.vessels) setStorage(KEYS.VESSELS, data.vessels);
      if (data.ports) setStorage(KEYS.PORTS, data.ports);
      if (data.routes) setStorage(KEYS.ROUTES, data.routes);
      if (data.commodities) setStorage(KEYS.COMMODITIES, data.commodities);
      if (data.customers) setStorage(KEYS.CUSTOMERS, data.customers);
      if (data.bookings) setStorage(KEYS.BOOKINGS, data.bookings);
      if (data.voyages) setStorage(KEYS.VOYAGES, data.voyages);
      if (data.notifications) setStorage(KEYS.NOTIFICATIONS, data.notifications);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  },
  resetToDefault(): void {
    setStorage(KEYS.VESSELS, INITIAL_VESSELS);
    setStorage(KEYS.PORTS, INITIAL_PORTS);
    setStorage(KEYS.ROUTES, INITIAL_ROUTES);
    setStorage(KEYS.COMMODITIES, INITIAL_COMMODITIES);
    setStorage(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setStorage(KEYS.BOOKINGS, INITIAL_BOOKINGS);
    setStorage(KEYS.VOYAGES, INITIAL_VOYAGES);
    setStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStorage(KEYS.USERS, INITIAL_USERS);
  }
};
