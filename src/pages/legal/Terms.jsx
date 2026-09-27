import { Link } from 'react-router-dom';
import ContentPage from '../../components/content/ContentPage';
import { usePublicSettings } from '../../hooks/useSettings';
import { LEGAL } from '../../data/legal';

/** Términos y condiciones de servicio (borrador base; revisar con un abogado antes de publicar). */
const Terms = () => {
  const { settings } = usePublicSettings();
  const email = settings.email || '[correo de contacto]';

  return (
    <ContentPage eyebrow="Legal" title="Términos y condiciones" updated={LEGAL.updated} description="Las reglas claras de cómo trabajamos.">
      <h2>1. Cotizaciones</h2>
      <ul>
        <li>
          Las <strong>pre-cotizaciones</strong> que genera la web o el chat son estimaciones automáticas. El precio final lo confirma un
          asesor, quien puede ajustarlo por material, acabados, cantidad o condiciones de instalación.
        </li>
        <li>Toda cotización confirmada tiene la vigencia que se indique en ella (7 días naturales si no se especifica).</li>
        <li>Los precios están en pesos mexicanos e incluyen IVA salvo que se indique lo contrario.</li>
      </ul>

      <h2>2. Archivos y diseño</h2>
      <ul>
        <li>
          Revisa la <Link to="/guia-de-archivos">guía de archivos</Link>. Si tu archivo no cumple con la resolución o las medidas, te
          avisaremos antes de imprimir; los ajustes de diseño pueden tener costo.
        </li>
        <li>El cliente declara tener los derechos de uso de logotipos, imágenes y marcas que nos envía.</li>
        <li>Antes de producir te enviaremos una prueba digital; la producción inicia con tu aprobación por escrito (correo o chat).</li>
        <li>Los colores en pantalla pueden variar ligeramente respecto al impreso según el material.</li>
      </ul>

      <h2>3. Pagos y producción</h2>
      <ul>
        <li>Para iniciar la producción se requiere un anticipo (normalmente 50 %), salvo acuerdo distinto por escrito.</li>
        <li>Los tiempos de entrega cuentan a partir de la aprobación de la prueba y el pago del anticipo.</li>
        <li>Si requieres factura, proporciona tus datos fiscales antes del pago.</li>
      </ul>

      <h2>4. Visitas técnicas e instalación</h2>
      <ul>
        <li>Las visitas de medición se agendan según disponibilidad. Si necesitas cambiarla, avísanos con al menos 24 horas.</li>
        <li>
          Para instalar, el cliente debe dar acceso al lugar y contar con los permisos necesarios (por ejemplo, de plaza comercial,
          condominio o municipio).
        </li>
      </ul>

      <h2>5. Cambios, cancelaciones y garantía</h2>
      <ul>
        <li>Los trabajos personalizados no admiten devolución una vez aprobada la prueba y comenzada la producción.</li>
        <li>
          Si un producto presenta un defecto de fabricación, repórtalo dentro de los 5 días hábiles siguientes a la entrega con fotos,
          y lo repondremos o corregiremos.
        </li>
      </ul>

      <h2>6. Contacto</h2>
      <p>
        Dudas sobre estos términos: <a href={`mailto:${email}`}>{email}</a>. Consulta también nuestro{' '}
        <Link to="/aviso-de-privacidad">aviso de privacidad</Link>.
      </p>
      <p className="text-sm text-muted">
        {LEGAL.responsible} · {LEGAL.tradeName}
      </p>
    </ContentPage>
  );
};

export default Terms;
