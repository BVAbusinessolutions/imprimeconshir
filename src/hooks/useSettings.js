import { useQuery } from '@tanstack/react-query';
import { getOperationsSettings, getPublicSettings } from '../services/settingsService';
import { OPERATIONS_DEFAULTS, PUBLIC_DEFAULTS } from '../data/settingsDefaults';

const TEN_MINUTES = 10 * 60 * 1000;

/** Contacto público del negocio. Si Firestore no responde, usa los valores por defecto. */
export const usePublicSettings = () => {
  const q = useQuery({ queryKey: ['settings', 'public'], queryFn: getPublicSettings, staleTime: TEN_MINUTES });
  return { ...q, settings: q.data ?? PUBLIC_DEFAULTS };
};

/** Configuración operativa (zonas, mensajeros, técnicos, alertas). Solo admin. */
export const useOperationsSettings = () => {
  const q = useQuery({ queryKey: ['settings', 'operations'], queryFn: getOperationsSettings, staleTime: TEN_MINUTES });
  return { ...q, settings: q.data ?? OPERATIONS_DEFAULTS };
};
