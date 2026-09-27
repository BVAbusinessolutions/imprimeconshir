import { Link } from 'react-router-dom';
import ContentPage from '../../components/content/ContentPage';
import { usePublicSettings } from '../../hooks/useSettings';
import { LEGAL } from '../../data/legal';

/**
 * Aviso de privacidad integral (borrador base, conforme a la legislación mexicana de protección
 * de datos personales en posesión de particulares). Debe revisarlo un abogado antes de publicar.
 */
const Privacy = () => {
  const { settings } = usePublicSettings();
  const email = settings.email || '[correo de privacidad]';
  const address = settings.address || '[domicilio]';

  return (
    <ContentPage eyebrow="Legal" title="Aviso de privacidad" updated={LEGAL.updated} description="Cómo tratamos y protegemos tus datos personales.">
      <h2>1. Responsable</h2>
      <p>
        {LEGAL.responsible}, con nombre comercial <strong>{LEGAL.tradeName}</strong> y domicilio en {address}, es responsable del
        tratamiento de tus datos personales. Para cualquier tema de privacidad escríbenos a <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>2. Datos que recabamos</h2>
      <ul>
        <li>
          <strong>Identificación y contacto:</strong> nombre, correo electrónico, teléfono y dirección de entrega o de la visita técnica.
        </li>
        <li>
          <strong>Facturación:</strong> RFC, razón social, régimen fiscal, uso de CFDI y código postal fiscal, solo si solicitas factura.
        </li>
        <li>
          <strong>Proyecto:</strong> archivos de diseño o logotipos que nos envías, medidas y detalles del trabajo.
        </li>
        <li>
          <strong>Conversaciones:</strong> los mensajes que escribes en el chat de la web.
        </li>
        <li>
          <strong>Navegación:</strong> datos técnicos y estadísticos de uso del sitio (páginas visitadas, dispositivo), de forma agregada.
        </li>
      </ul>
      <p>No recabamos datos personales sensibles.</p>

      <h2>3. Finalidades</h2>
      <h3>Necesarias para el servicio</h3>
      <ul>
        <li>Elaborar pre-cotizaciones y cotizaciones.</li>
        <li>Agendar y realizar visitas técnicas de medición o instalación.</li>
        <li>Producir, entregar e instalar tus pedidos, y darles seguimiento.</li>
        <li>Emitir facturas y cumplir obligaciones fiscales.</li>
        <li>Atender dudas, aclaraciones y garantías.</li>
      </ul>
      <h3>Adicionales (puedes negarte)</h3>
      <ul>
        <li>Enviarte promociones, novedades y encuestas de satisfacción.</li>
      </ul>
      <p>
        Puedes negarte a las finalidades adicionales desmarcando la casilla correspondiente al registrarte o cotizar, desde{' '}
        <Link to="/perfil">Mi perfil</Link>, o escribiendo a <a href={`mailto:${email}`}>{email}</a>. Negarte no afecta el servicio.
      </p>

      <h2>4. Con quién compartimos tus datos</h2>
      <p>No vendemos tus datos. Para operar usamos proveedores que los tratan por cuenta nuestra y bajo nuestras instrucciones:</p>
      <ul>
        <li>Alojamiento, base de datos, autenticación y archivos (Google Firebase).</li>
        <li>Automatización de procesos, como cotizaciones y avisos (plataforma n8n).</li>
        <li>Asistente de inteligencia artificial del chat, que procesa los mensajes para responderte.</li>
        <li>Envío de correos y mensajes de notificación.</li>
        <li>Mensajería y personal técnico que realiza entregas o visitas, solo con los datos necesarios para ello.</li>
      </ul>
      <p>Algunos de estos proveedores pueden almacenar datos fuera de México. También podremos compartir datos cuando lo exija una autoridad competente.</p>

      <h2>5. Derechos ARCO y revocación del consentimiento</h2>
      <p>
        Tienes derecho a <strong>acceder</strong> a tus datos, <strong>rectificarlos</strong>, <strong>cancelarlos</strong> u{' '}
        <strong>oponerte</strong> a su uso, así como a revocar tu consentimiento o limitar su uso. Envía tu solicitud a{' '}
        <a href={`mailto:${email}`}>{email}</a> con tu nombre, un medio para responderte, una identificación y la descripción de lo que
        solicitas. Te responderemos en un máximo de {LEGAL.arcoResponseDays} días hábiles.
      </p>

      <h2>6. Conservación y seguridad</h2>
      <p>
        Conservamos tus datos mientras sean necesarios para las finalidades descritas y para cumplir obligaciones legales y fiscales.
        Aplicamos medidas de seguridad administrativas, técnicas y físicas, como acceso restringido por roles y comunicaciones cifradas.
      </p>

      <h2>7. Cookies y tecnologías similares</h2>
      <p>
        Usamos almacenamiento local del navegador para mantener tu sesión, tu carrito y la conversación del chat, y herramientas de
        estadística para mejorar el sitio. Puedes borrar estos datos desde la configuración de tu navegador.
      </p>

      <h2>8. Cambios a este aviso</h2>
      <p>Publicaremos cualquier cambio en esta misma página, indicando la fecha de la última actualización.</p>
    </ContentPage>
  );
};

export default Privacy;
