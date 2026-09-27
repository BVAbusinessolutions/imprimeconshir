/**
 * Contenido público administrable: portafolio de proyectos y testimonios.
 */
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const byOrder = (a, b) =>
  Number(!!b.featured) - Number(!!a.featured) || (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);

export const getProjects = async () => {
  const snap = await getDocs(collection(db, 'projects'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder);
};

/** Solo testimonios publicados (las reglas no dejan leer los demás a visitantes). */
export const getPublishedTestimonials = async () => {
  const snap = await getDocs(query(collection(db, 'testimonials'), where('published', '==', true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder);
};
