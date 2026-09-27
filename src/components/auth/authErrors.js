/** Mensajes legibles para los errores de Firebase Auth. */
export const authErrorMessage = (error) => {
  const messages = {
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'Correo o contraseña incorrectos.',
    'auth/email-already-in-use': 'Ya existe una cuenta con este correo. Inicia sesión.',
    'auth/weak-password': 'La contraseña es muy débil.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
    'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de terminar.',
    'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
  };
  return messages[error?.code] ?? 'No pudimos completar la operación. Intenta de nuevo.';
};
