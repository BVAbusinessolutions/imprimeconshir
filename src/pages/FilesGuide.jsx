import { Link } from 'react-router-dom';
import ContentPage from '../components/content/ContentPage';
import Button from '../components/ui/Button';

const MATERIALS = [
  ['Lona front', 'Exterior: fachadas, eventos, espectaculares', 'Económica y resistente a la intemperie; con ojillos o bolsa para bastidor.'],
  ['Lona mesh (microperforada)', 'Exterior con viento: bardas, andamios', 'Deja pasar el aire y reduce el riesgo de desprendimiento.'],
  ['Vinil impreso', 'Vidrios, muros, vehículos, cajas de luz', 'Adherible, brillante o mate; puede llevar laminado para mayor duración.'],
  ['Vinil microperforado', 'Ventanas y medallones de vehículos', 'Se ve la imagen por fuera y permite visibilidad desde adentro.'],
  ['Vinil de corte', 'Rotulación, letras y logotipos de un color', 'Colores sólidos sin fondo; muy durable.'],
  ['Rígidos (PVC, coroplast, acrílico)', 'Señalización, stands, displays', 'Superficie firme para interiores o piezas que se manipulan.'],
  ['Papel y cartulina', 'Papelería, cajas, material POP', 'Diferentes gramajes y acabados: mate, brillante, barniz o laminado.'],
];

const aside = (
  <div className="rounded-3xl bg-surface p-6">
    <p className="font-bold">¿Tu archivo no cumple?</p>
    <p className="mt-2 text-sm text-muted">Envíanos lo que tengas y te decimos cómo mejorarlo, o lo preparamos por ti.</p>
    <Button to="/cotizar" size="sm" className="mt-4">
      Cotizar con mi archivo
    </Button>
  </div>
);

const FilesGuide = () => (
  <ContentPage
    eyebrow="Antes de imprimir"
    title="Guía de archivos"
    description="Cómo preparar tu diseño para que salga perfecto a la primera."
    aside={aside}
  >
    <h2>Formato</h2>
    <ul>
      <li>
        <strong>Preferido:</strong> PDF en alta calidad. También recibimos AI, EPS, SVG, PSD, TIFF, PNG y JPG.
      </li>
      <li>
        <strong>Textos convertidos a curvas</strong> (o fuentes incrustadas en el PDF) para que no cambie la tipografía.
      </li>
      <li>Logotipos preferentemente en vector (AI, EPS, SVG o PDF vectorial).</li>
    </ul>

    <h2>Tamaño y resolución</h2>
    <ul>
      <li>
        Diseña <strong>a tamaño real o a escala</strong> (p. ej. 1:10) indicando la medida final.
      </li>
      <li>
        <strong>Pequeño formato</strong> (tarjetas, volantes, cajas): 300 dpi al tamaño final.
      </li>
      <li>
        <strong>Gran formato</strong>: 100–150 dpi al tamaño real suele bastar para piezas que se ven a más de 2 metros; para vistas
        cercanas (stands, displays), usa 150–300 dpi.
      </li>
      <li>Evita imágenes descargadas de internet o capturas de pantalla: casi siempre se ven pixeladas al ampliarlas.</li>
    </ul>

    <h2>Color</h2>
    <ul>
      <li>
        Trabaja en <strong>CMYK</strong>. Si envías RGB lo convertimos, pero algunos colores muy brillantes pueden verse más apagados.
      </li>
      <li>Si tu marca usa colores Pantone, indícalo para igualarlos lo más posible.</li>
      <li>Para negros intensos en áreas grandes usa negro enriquecido (C40 M30 Y30 K100).</li>
    </ul>

    <h2>Márgenes y rebase</h2>
    <ul>
      <li>
        <strong>Rebase (sangrado):</strong> 3 mm por lado en pequeño formato y 2–5 cm en lonas y viniles de gran formato.
      </li>
      <li>
        <strong>Zona segura:</strong> deja textos y logotipos al menos a 5 mm del borde (10 cm en lonas con ojillos o bastidor).
      </li>
      <li>En rotulación vehicular, evita poner textos sobre manijas, juntas y molduras; lo revisamos en la visita técnica.</li>
    </ul>

    <h2>Materiales más comunes</h2>
    <table>
      <thead>
        <tr>
          <th scope="col">Material</th>
          <th scope="col">Ideal para</th>
          <th scope="col">Notas</th>
        </tr>
      </thead>
      <tbody>
        {MATERIALS.map(([name, use, note]) => (
          <tr key={name}>
            <td className="font-medium">{name}</td>
            <td>{use}</td>
            <td className="text-muted">{note}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h2>Cómo enviarlo</h2>
    <p>
      Adjunta tu archivo al <Link to="/cotizar">cotizar</Link> (hasta 25 MB por archivo, con tu cuenta iniciada). Si pesa más,
      compártelo por un enlace de Google Drive, Dropbox o WeTransfer en las notas de la cotización.
    </p>
  </ContentPage>
);

export default FilesGuide;
