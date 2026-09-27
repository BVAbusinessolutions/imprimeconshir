import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AdminHeader, Badge, EmptyState, ErrorNote, LoadingBlock, Panel } from '../../components/admin/AdminUI';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import { createItem, listAll } from '../../services/adminService';
import { n8nErrorMessage, sendEmail } from '../../services/n8n';
import { useOperationsSettings, usePublicSettings } from '../../hooks/useSettings';
import { useAuth } from '../../context/AuthContext';
import { EMAIL_TEMPLATES, fillTemplate } from '../../data/emailTemplates';
import { formatDate, mailtoLink } from '../../utils/helpers';

const STATUS_LABEL = { sent: 'Enviado', queued: 'En cola (n8n sin credencial)', manual: 'Abierto en mi correo', invalid: 'No enviado' };

const parseRecipients = (text) =>
  [...new Set(String(text).split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))];

const safeDate = (v) => {
  try {
    return v ? formatDate(v) : '';
  } catch {
    return '';
  }
};

const Emails = () => {
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const { currentUser } = useAuth();
  const { settings: pub } = usePublicSettings();
  const { settings: ops } = useOperationsSettings();

  // Prefill desde otras secciones (p. ej. "Pedir al proveedor" en Inventario)
  const [to, setTo] = useState(params.get('to') ?? '');
  const [subject, setSubject] = useState(params.get('subject') ?? '');
  const [body, setBody] = useState(params.get('body') ?? '');

  const suppliers = useQuery({ queryKey: ['admin', 'suppliers'], queryFn: () => listAll('suppliers') });
  const quotes = useQuery({ queryKey: ['admin', 'quotes'], queryFn: () => listAll('quotes') });
  const history = useQuery({ queryKey: ['admin', 'emails'], queryFn: () => listAll('emails') });

  const groups = [
    ['Técnicos', (ops.technicians ?? []).map((t) => t.email)],
    ['Proveedores', (suppliers.data ?? []).map((s) => s.email)],
    ['Clientes con cotización', (quotes.data ?? []).map((q) => q.contact?.email)],
  ].map(([label, emails]) => [label, [...new Set(emails.filter(Boolean))]]);

  const addRecipients = (emails) => setTo((prev) => parseRecipients(`${prev},${emails.join(',')}`).join(', '));

  const applyTemplate = (id) => {
    const t = EMAIL_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setSubject(t.subject);
    setBody(fillTemplate(t.body, pub));
  };

  const recipients = parseRecipients(to);
  const log = (status, extra = {}) =>
    createItem('emails', { to: recipients, subject, body, status, by: currentUser?.email ?? null, ...extra }).then(() =>
      qc.invalidateQueries({ queryKey: ['admin', 'emails'] })
    );

  const send = useMutation({
    mutationFn: () => sendEmail({ to: recipients, subject, text: body, kind: 'manual' }),
    onSuccess: async (res) => {
      if (res.status === 'invalid') return toast.error(res.message);
      await log(res.sent ? 'sent' : 'queued', { count: res.count });
      if (res.sent) toast.success(`Enviado a ${res.count} destinatario(s).`);
      else toast.info('n8n recibió el correo, pero el envío automático se activa al configurar la credencial. Puedes usar "Abrir en mi correo".');
      if (res.invalid?.length) toast.warn(`Direcciones inválidas: ${res.invalid.join(', ')}`);
    },
    onError: (e) => toast.error(n8nErrorMessage(e)),
  });

  const ready = recipients.length > 0 && subject.trim() && body.trim();

  return (
    <>
      <AdminHeader title="Correos" description="Escribe a clientes, proveedores y técnicos desde un solo lugar. Todo queda en el historial." />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Nuevo correo">
          <div className="space-y-4">
            <Field
              as="select"
              label="Plantilla"
              defaultValue=""
              onChange={(e) => applyTemplate(e.target.value)}
            >
              <option value="">Sin plantilla</option>
              {EMAIL_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Field>
            <div>
              <Field
                as="textarea"
                label="Para"
                hint="Separa los correos con coma"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="[&_textarea]:min-h-16"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {groups.map(([label, emails]) => (
                  <button
                    key={label}
                    type="button"
                    disabled={!emails.length}
                    onClick={() => addRecipients(emails)}
                    className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium hover:border-ink/40 disabled:opacity-40"
                  >
                    + {label} ({emails.length})
                  </button>
                ))}
              </div>
            </div>
            <Field label="Asunto" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Field as="textarea" label="Mensaje" value={body} onChange={(e) => setBody(e.target.value)} className="[&_textarea]:min-h-56" />
            <p className="text-xs text-muted">
              Envía promociones solo a clientes que aceptaron recibirlas, e incluye siempre cómo darse de baja.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => send.mutate()} disabled={!ready || send.isPending}>
                {send.isPending ? 'Enviando…' : `Enviar con n8n${recipients.length ? ` (${recipients.length})` : ''}`}
              </Button>
              <a
                href={ready ? mailtoLink(recipients, subject, body) : undefined}
                aria-disabled={!ready}
                onClick={() => ready && log('manual')}
                className={`inline-flex h-11 items-center rounded-full border border-ink/15 bg-surface px-6 text-[15px] font-semibold ${
                  ready ? 'hover:border-ink/40' : 'pointer-events-none opacity-50'
                }`}
              >
                Abrir en mi correo
              </a>
            </div>
          </div>
        </Panel>

        <Panel title="Historial" className="xl:sticky xl:top-36 xl:self-start">
          {history.isLoading && <LoadingBlock />}
          {history.isError && <ErrorNote>No se pudo cargar el historial.</ErrorNote>}
          {history.data?.length === 0 && <EmptyState>Aún no se ha enviado ningún correo.</EmptyState>}
          <ul className="space-y-3 text-sm">
            {history.data?.slice(0, 20).map((e) => (
              <li key={e.id} className="border-b border-line pb-3 last:border-0">
                <p className="font-medium">{e.subject}</p>
                <p className="truncate text-xs text-muted">
                  {(e.to ?? []).join(', ')} · {safeDate(e.createdAt)}
                </p>
                <p className="mt-1">
                  <Badge tone={e.status === 'sent' ? 'dark' : 'neutral'}>{STATUS_LABEL[e.status] ?? e.status}</Badge>
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
};

export default Emails;
