import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';

export function createPersistentFirestore(firebaseApp: FirebaseApp): Firestore {
  try {
    return initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(firebaseApp);
  }
}

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {} as any;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDb1TyxHb7JV6cDlDv8OqEsA03LVsftdzY",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "tag-in-der-praxis-kahla.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "tag-in-der-praxis-kahla",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "tag-in-der-praxis-kahla.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "77639235687",
  appId: env.VITE_FIREBASE_APP_ID || "1:77639235687:web:1bac4df8ec78b2073dfcc2"
};

const existingDefaultApp = getApps().find((a) => a.name === '[DEFAULT]');
export const app = existingDefaultApp || initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = createPersistentFirestore(app);
