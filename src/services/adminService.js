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
  runTransaction,
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

// ─── Inventario ───────────────────────────────────────────────

/**
 * Registra una entrada (+) o salida (−) y ajusta la existencia en una sola transacción,
 * así el historial y el saldo nunca quedan desfasados. No permite existencias negativas.
 */
export const recordInventoryMovement = (item, delta, reason, user) =>
  runTransaction(db, async (tx) => {
    const ref = doc(db, 'inventory', item.id);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('El insumo ya no existe.');
    const current = Number(snap.data().stock) || 0;
    const next = current + Number(delta);
    if (next < 0) throw new Error(`Solo hay ${current} ${item.unit ?? ''} en existencia.`);
    tx.update(ref, { stock: next, updatedAt: serverTimestamp() });
    tx.set(doc(collection(db, 'inventoryMovements')), {
      itemId: item.id,
      itemName: item.name,
      unit: item.unit ?? '',
      delta: Number(delta),
      stockAfter: next,
      reason: reason || (delta > 0 ? 'Entrada' : 'Salida'),
      by: user?.email ?? null,
      createdAt: serverTimestamp(),
    });
    return next;
  });
