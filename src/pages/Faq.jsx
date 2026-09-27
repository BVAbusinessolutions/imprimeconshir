import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ContentPage from '../components/content/ContentPage';
import Button from '../components/ui/Button';
import useChatStore from '../store/chatStore';

// Respuestas generales: ajustar a las políticas reales de Shirlene (tiempos, anticipos, zonas de envío)
const FAQ = [
  {
    group: 'Cotizaciones',
    items: [
      ['¿Cuánto tarda una cotización?', 'La pre-cotización es al instante en la web o el chat. Un asesor confirma el precio final en minutos en horario de atención.'],
      ['¿La pre-cotización es el precio final?', 'Es una estimación automática. El precio final puede ajustarse por material, acabados, cantidad o condiciones de instalación.'],
      ['¿Por qué algunos trabajos requieren visita?', 'Rotulación vehicular, rótulos corpóreos y stands necesitan medidas exactas en sitio para cotizar sin sorpresas.'],
    ],
  },
  {
    group: 'Archivos y diseño',
    items: [
      ['¿Qué archivo necesito?', 'PDF en alta calidad con textos convertidos a curvas es lo ideal. Revisa la guía de archivos para medidas, resolución y rebase.'],
      ['No tengo diseño, ¿me ayudan?', 'Sí. Podemos adaptar tu logotipo o diseñar la pieza desde cero; el costo de diseño se incluye en la cotización.'],
      ['¿Veo una prueba antes de imprimir?', 'Siempre. Te enviamos una prueba digital y la producción empieza hasta que la apruebes.'],
    ],
  },
  {
    group: 'Pagos, facturas y entregas',
    items: [
      ['¿Cómo se paga?', 'Normalmente con un anticipo para iniciar la producción y el resto contra entrega. Te indicamos las formas de pago al confirmar.'],
      ['¿Emiten factura?', 'Sí, emitimos CFDI. Registra tus datos fiscales en tu perfil o marca "Requiero factura" al cotizar.'],
      ['¿Hacen entregas e instalación?', 'Sí. Organizamos las entregas por zonas y contamos con técnicos para instalar lonas, viniles y rótulos.'],
    ],
  },
];

const FaqJsonLd = () => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.flatMap((g) =>
          g.items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
        ),
      })}
    </script>
  </Helmet>
);

const Faq = () => {
  const openChat = useChatStore((s) => s.open);

  return (
    <ContentPage
      eyebrow="Ayuda"
      title="Preguntas frecuentes"
      description="Lo que más nos preguntan antes de imprimir."
      aside={
        <div className="rounded-3xl bg-surface p-6">
          <p className="font-bold">¿No encuentras tu respuesta?</p>
          <p className="mt-2 text-sm text-muted">Escríbenos por el chat y te respondemos al momento.</p>
          <Button size="sm" className="mt-4" onClick={openChat}>
            Abrir chat
          </Button>
        </div>
      }
    >
      <FaqJsonLd />
      {FAQ.map((g) => (
        <section key={g.group}>
          <h2>{g.group}</h2>
          <div className="not-prose space-y-2">
            {g.items.map(([q, a]) => (
              <details key={q} className="group rounded-2xl bg-surface px-5 py-4 open:pb-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted">
                  {a}{' '}
                  {q === '¿Qué archivo necesito?' && (
                    <Link to="/guia-de-archivos" className="font-semibold text-ink underline underline-offset-4">
                      Ver guía
                    </Link>
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </ContentPage>
  );
};

export default Faq;
