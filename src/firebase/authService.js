import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();

/**
 * Registra un nuevo usuario con email y contraseña y crea su perfil en Firestore.
 */
export const registerUser = async (email, password, displayName, { marketingOptIn = false } = {}) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email,
    displayName,
    role: 'customer', // Roles: 'customer' | 'admin'
    marketingOptIn: !!marketingOptIn,
    privacyAcceptedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return user;
};

/**
 * Inicia sesión con email y contraseña.
 */
export const loginUser = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

/**
 * Inicia sesión con Google.
 */
export const loginWithGoogle = async () => {
  const { user } = await signInWithPopup(auth, googleProvider);
  // Crear perfil solo si es la primera vez (no sobrescribir el rol de un usuario existente)
  const userRef = doc(db, 'users', user.uid);
  const profileSnap = await getDoc(userRef);
  if (!profileSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'customer',
      marketingOptIn: false,
      // Las pantallas de acceso con Google indican que continuar implica aceptar el aviso de privacidad
      privacyAcceptedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }
  return user;
};

/**
 * Cierra sesión del usuario actual.
 */
export const logoutUser = () => signOut(auth);

/**
 * Envía un correo de recuperación de contraseña.
 */
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
