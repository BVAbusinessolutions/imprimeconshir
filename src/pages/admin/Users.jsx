import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AdminHeader, Badge, EmptyState, ErrorNote, LoadingBlock } from '../../components/admin/AdminUI';
import { listAll, updateItem } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABEL = { admin: 'Administrador', customer: 'Cliente' };

/**
 * Gestión de roles: dar o quitar acceso al panel.
 * Las reglas de Firestore impiden que un admin se quite el rol a sí mismo.
 */
const Users = () => {
  const qc = useQueryClient();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [confirming, setConfirming] = useState(null); // uid pendiente de confirmar
  const users = useQuery({ queryKey: ['admin', 'users'], queryFn: () => listAll('users') });

  const setRole = useMutation({
    mutationFn: ({ uid, role }) =>
      updateItem('users', uid, { role, roleChangedBy: currentUser?.email ?? null, roleChangedAt: new Date().toISOString() }),
    onSuccess: (_, { role }) => {
      toast.success(role === 'admin' ? 'Ahora es administrador.' : 'Se quitó el acceso al panel.');
      setConfirming(null);
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('No se pudo cambiar el rol.'),
  });

  const term = search.trim().toLowerCase();
  const list = (users.data ?? [])
    .filter((u) => !term || [u.displayName, u.email].some((v) => String(v ?? '').toLowerCase().includes(term)))
    .sort((a, b) => Number(b.role === 'admin') - Number(a.role === 'admin') || String(a.email).localeCompare(String(b.email)));
  const adminCount = (users.data ?? []).filter((u) => u.role === 'admin').length;

  return (
    <>
      <AdminHeader
        title="Usuarios"
        description="Da o quita acceso al panel. Los administradores ven clientes, finanzas y toda la operación."
        actions={
          <label className="text-sm">
            <span className="sr-only">Buscar usuario</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo"
              className="w-64 max-w-full rounded-xl border border-line bg-surface px-3 py-2 focus:border-ink focus:outline-none"
            />
          </label>
        }
      />

      <p className="mb-6 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
        Da acceso solo a personas de confianza. Para evitar quedarte fuera, no puedes quitarte el rol a ti mismo; pídeselo a otro
        administrador. Hay <strong className="text-ink">{adminCount}</strong> administrador{adminCount === 1 ? '' : 'es'}.
      </p>

      {users.isLoading && <LoadingBlock className="h-40" />}
      {users.isError && <ErrorNote />}
      {!users.isLoading && list.length === 0 && <EmptyState>{term ? 'Sin coincidencias.' : 'Aún no hay usuarios registrados.'}</EmptyState>}

      <ul className="space-y-2">
        {list.map((u) => {
          const isSelf = u.id === currentUser?.uid;
          const isAdminUser = u.role === 'admin';
          const nextRole = isAdminUser ? 'customer' : 'admin';
          return (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-4">
              <div className="min-w-0">
                <p className="font-semibold">
                  {u.displayName || u.email} {isSelf && <Badge>Tú</Badge>}{' '}
                  <Badge tone={isAdminUser ? 'dark' : 'neutral'}>{ROLE_LABEL[u.role] ?? u.role ?? 'Sin rol'}</Badge>
                </p>
                <p className="truncate text-sm text-muted">
                  {u.email}
                  {u.roleChangedBy && ` · rol cambiado por ${u.roleChangedBy}`}
                </p>
              </div>

              {isSelf ? (
                <span className="text-xs text-muted">No puedes cambiar tu propio rol</span>
              ) : confirming === u.id ? (
                <span className="flex items-center gap-3 text-sm">
                  <span className="text-muted">{isAdminUser ? '¿Quitar acceso al panel?' : '¿Dar acceso total al panel?'}</span>
                  <button
                    type="button"
                    onClick={() => setRole.mutate({ uid: u.id, role: nextRole })}
                    disabled={setRole.isPending}
                    className="font-semibold text-accent"
                  >
                    Sí, confirmar
                  </button>
                  <button type="button" onClick={() => setConfirming(null)} className="text-muted">
                    No
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(u.id)}
                  className="rounded-full border border-ink/15 bg-paper px-4 py-1.5 text-sm font-semibold hover:border-ink/40"
                >
                  {isAdminUser ? 'Quitar admin' : 'Hacer admin'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Users;
