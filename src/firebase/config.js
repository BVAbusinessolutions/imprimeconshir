import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Los valores se leen de .env (ver .env.example)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// Storage se inicializa en storageService.js y Analytics se carga en diferido,
// para que no formen parte del paquete inicial de la web.
// Analytics no está disponible en todos los entornos (algunos navegadores, bloqueadores, dev sin measurementId)
export const analyticsPromise = firebaseConfig.measurementId
  ? import('firebase/analytics')
      .then(async ({ getAnalytics, isSupported }) => ((await isSupported()) ? getAnalytics(app) : null))
      .catch(() => null)
  : Promise.resolve(null);

export default app;
