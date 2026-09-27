import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { OPERATIONS_DEFAULTS, PUBLIC_DEFAULTS } from '../data/settingsDefaults';

const read = async (id, defaults) => {
  const snap = await getDoc(doc(db, 'settings', id));
  return { ...defaults, ...(snap.exists() ? snap.data() : {}) };
};

/** Contacto público (lectura abierta). */
export const getPublicSettings = () => read('public', PUBLIC_DEFAULTS);

/** Configuración operativa (solo admin). */
export const getOperationsSettings = () => read('operations', OPERATIONS_DEFAULTS);

export const savePublicSettings = (data) => setDoc(doc(db, 'settings', 'public'), { ...data, updatedAt: serverTimestamp() }, { merge: true });

export const saveOperationsSettings = (data) =>
  setDoc(doc(db, 'settings', 'operations'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
