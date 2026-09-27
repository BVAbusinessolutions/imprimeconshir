import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '../ui/Button';
import { BOARD_COLORS, MOCKUP_SCENES } from './mockupScenes';

const MAX_SIZE_MB = 10;

const ACCEPTED_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
};

/** Coloca el logo (o un texto de ejemplo) centrado dentro de una zona. */
const LogoSlot = ({ slot, logoUrl, scale, dark }) => {
  const width = slot.width * scale;
  const height = slot.height * scale;
  const x = slot.x + (slot.width - width) / 2;
  const y = slot.y + (slot.height - height) / 2;

  if (!logoUrl) {
    return (
      <text
        x={slot.x + slot.width / 2}
        y={slot.y + slot.height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Archivo, sans-serif"
        fontWeight={800}
        fontSize={Math.min(slot.height * 0.32, slot.width * 0.16) * scale}
        fill={dark ? '#ffffff' : '#161616'}
        opacity={0.35}
      >
        TU LOGO
      </text>
    );
  }

  return (
    <image
      href={logoUrl}
      x={x}
      y={y}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
    />
  );
};

/**
 * Render conceptual: el cliente carga su logotipo y lo ve sobre mockups estándar.
 * El archivo se procesa solo en el navegador (object URL); no se sube a ningún servidor.
 */
const LogoMockupPreview = ({ className = '' }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [sceneId, setSceneId] = useState(MOCKUP_SCENES[0].id);
  const [boardId, setBoardId] = useState(BOARD_COLORS[0].id);
  const [scale, setScale] = useState(0.8);

  const scene = MOCKUP_SCENES.find((s) => s.id === sceneId);
  const board = BOARD_COLORS.find((b) => b.id === boardId);

  // Liberar la URL temporal al reemplazar el logo o desmontar
  useEffect(() => () => logoUrl && URL.revokeObjectURL(logoUrl), [logoUrl]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    multiple: false,
    noClick: !!logoUrl,
    onDropAccepted: ([file]) => {
      setLogoUrl(URL.createObjectURL(file));
      setFileName(file.name);
    },
    onDropRejected: ([rejection]) => {
      const code = rejection?.errors?.[0]?.code;
      toast.error(
        code === 'file-too-large'
          ? `El archivo supera ${MAX_SIZE_MB} MB.`
          : 'Formato no válido. Usa PNG, JPG, WEBP o SVG.'
      );
    },
  });

  const clearLogo = () => {
    setLogoUrl(null);
    setFileName('');
  };

  // Cada superficie impresa lleva su logo encima, en el mismo orden
  const layers = scene.surfaces.map((s, i) => (
    <g key={i}>
      <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx ?? 2} fill={board.value} />
      {scene.slots[i] && <LogoSlot slot={scene.slots[i]} logoUrl={logoUrl} scale={scale} dark={board.dark} />}
    </g>
  ));

  return (
    <div className={`grid gap-6 lg:grid-cols-[1fr_320px] ${className}`}>
      {/* Escena */}
      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-3xl bg-surface transition-shadow ${
          isDragActive ? 'ring-2 ring-accent' : ''
        } ${logoUrl ? '' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} aria-label="Cargar logotipo" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.svg
            key={scene.id}
            viewBox="0 0 800 500"
            role="img"
            aria-label={`Mockup de ${scene.name} con ${logoUrl ? 'tu logotipo' : 'un logotipo de ejemplo'}`}
            className="block h-auto w-full"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <rect width={800} height={500} fill="#ebebe7" />
            {scene.render(layers)}
          </motion.svg>
        </AnimatePresence>

        {!logoUrl && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-sm text-muted">
            {isDragActive ? 'Suelta tu logotipo aquí' : 'Arrastra tu logotipo o haz clic para cargarlo'}
          </p>
        )}
      </div>

      {/* Controles */}
      <div className="flex flex-col gap-7 rounded-3xl bg-surface p-6">
        <fieldset>
          <legend className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Formato</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {MOCKUP_SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.id === sceneId}
                onClick={() => setSceneId(s.id)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  s.id === sceneId
                    ? 'border-ink bg-ink text-white'
                    : 'border-line text-ink hover:border-ink/40'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Fondo</legend>
          <div className="mt-3 flex gap-2">
            {BOARD_COLORS.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={b.id === boardId}
                onClick={() => setBoardId(b.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  b.id === boardId ? 'border-ink' : 'border-line hover:border-ink/40'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 rounded-full border border-ink/15"
                  style={{ backgroundColor: b.value }}
                />
                {b.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="logo-scale" className="flex justify-between text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            Tamaño
            <span className="tabular-nums">{Math.round(scale * 100)}%</span>
          </label>
          <input
            id="logo-scale"
            type="range"
            min={0.3}
            max={1}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="mt-3 w-full accent-accent"
          />
        </div>

        <div className="mt-auto flex flex-col gap-2">
          {logoUrl ? (
            <>
              <p className="truncate text-sm text-muted" title={fileName}>
                {fileName}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={open} className="flex-1">
                  Cambiar
                </Button>
                <Button variant="ghost" size="sm" onClick={clearLogo} className="flex-1">
                  Quitar
                </Button>
              </div>
            </>
          ) : (
            <Button variant="outline" onClick={open}>
              Cargar logotipo
            </Button>
          )}
          <Button to={`/cotizar?formato=${scene.id}`} className="mt-2">
            Cotizar este formato
          </Button>
          <p className="mt-1 text-xs text-muted">
            Render conceptual. Tu archivo no sale de tu dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoMockupPreview;
