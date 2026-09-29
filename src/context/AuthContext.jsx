/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // datos de Firestore (rol, etc.)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeProfile();
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // Perfil en tiempo real: al registrarse, el documento se crea justo después del alta en Auth,
      // y así también se reflejan al instante los cambios de perfil o de rol.
      unsubscribeProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          setUserProfile(snap.exists() ? snap.data() : null);
          setLoading(false);
        },
        (error) => {
          console.error('No se pudo cargar el perfil del usuario:', error);
          setUserProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  const isAdmin = userProfile?.role === 'admin';

  const value = { currentUser, userProfile, isAdmin, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};

export default AuthProvider;
