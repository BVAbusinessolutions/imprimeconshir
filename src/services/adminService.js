/**
 * Acceso a datos del panel administrativo (Firestore). Las reglas limitan todo esto a admins.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const byNewest = (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
const withId = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

// ─── Genéricos ────────────────────────────────────────────────

export const listAll = async (name) => withId(await getDocs(collection(db, name))).sort(byNewest);

export const createItem = (name, data) => addDoc(collection(db, name), { ...data, createdAt: serverTimestamp() });

export const updateItem = (name, id, data) => updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() });

export const deleteItem = (name, id) => deleteDoc(doc(db, name, id));

// ─── Logística ────────────────────────────────────────────────

/** Entregas de un mes. `date` se guarda como 'yyyy-MM-dd', así el rango de texto funciona sin índices extra. */
export const getDeliveriesForMonth = async (yearMonth) => {
  const q = query(
    collection(db, 'deliveries'),
    where('date', '>=', `${yearMonth}-01`),
    where('date', '<=', `${yearMonth}-31`)
  );
  return withId(await getDocs(q)).sort((a, b) =>
    `${a.date} ${a.timeWindow ?? ''}`.localeCompare(`${b.date} ${b.timeWindow ?? ''}`)
  );
};
