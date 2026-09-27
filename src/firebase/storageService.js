import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './config';

/**
 * Sube un archivo al Firebase Storage con seguimiento de progreso.
 * @param {File} file - El archivo a subir.
 * @param {string} folder - Carpeta destino en Storage (ej: 'products' o `designs/${uid}` — ver storage.rules).
 * @param {function} onProgress - Callback con porcentaje de progreso (0-100).
 * @returns {Promise<string>} - La URL de descarga del archivo subido.
 */
export const uploadFile = (file, folder = 'uploads', onProgress = () => {}) => {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${ext}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

/**
 * Elimina un archivo de Firebase Storage a partir de su URL.
 * @param {string} fileUrl - URL completa del archivo a eliminar.
 */
export const deleteFile = async (fileUrl) => {
  const fileRef = ref(storage, fileUrl);
  await deleteObject(fileRef);
};
