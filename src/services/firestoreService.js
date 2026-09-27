import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ─── Productos ────────────────────────────────────────────────

// Se ordena en el cliente para no depender de un índice compuesto (category + createdAt) en Firestore
export const getProducts = async (category = null) => {
  let q = collection(db, 'products');
  if (category) q = query(q, where('category', '==', category));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
};

export const getProductById = async (id) => {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) throw new Error('Producto no encontrado');
  return { id: snap.id, ...snap.data() };
};

export const createProduct = async (data) => {
  return addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
};

export const updateProduct = async (id, data) => {
  return updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id) => {
  return deleteDoc(doc(db, 'products', id));
};

// ─── Pedidos ──────────────────────────────────────────────────

export const createOrder = async (orderData) => {
  return addDoc(collection(db, 'orders'), {
    ...orderData,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

export const getOrdersByUser = async (uid) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllOrders = async (limitCount = 50) => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateOrderStatus = async (id, status) => {
  return updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
};
