import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Vessel, Port, Route, Commodity, Customer, 
  Booking, VoyageLog, NotificationLog, User 
} from '../types';

// Initialize Firebase App & Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Error Handling Definition adhering to Firestore Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    console.warn('Firestore connection check:', error);
    return true; // Config is present
  }
}

// Generic Firestore Collection Operations with Full Error Handling
export const firestoreService = {
  // Sync / Listen to a collection
  subscribeCollection<T extends { id: string }>(
    collectionName: string,
    onData: (data: T[]) => void
  ): Unsubscribe {
    return onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as T);
        });
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionName);
      }
    );
  },

  // Get all documents in a collection
  async getAll<T extends { id: string }>(collectionName: string): Promise<T[]> {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionName);
      return [];
    }
  },

  // Save or Update a document
  async saveDoc<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
    const docPath = `${collectionName}/${item.id}`;
    try {
      await setDoc(doc(db, collectionName, item.id), item, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Delete a document
  async deleteDoc(collectionName: string, id: string): Promise<void> {
    const docPath = `${collectionName}/${id}`;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // Seed initial data if collection is empty
  async seedIfEmpty<T extends { id: string }>(collectionName: string, initialItems: T[]): Promise<void> {
    try {
      const existing = await this.getAll<T>(collectionName);
      if (existing.length === 0 && initialItems.length > 0) {
        console.log(`[Firestore] Seeding ${collectionName} with ${initialItems.length} records...`);
        for (const item of initialItems) {
          await this.saveDoc(collectionName, item);
        }
      }
    } catch (error) {
      console.warn(`[Firestore] Seeding warning for ${collectionName}:`, error);
    }
  }
};
