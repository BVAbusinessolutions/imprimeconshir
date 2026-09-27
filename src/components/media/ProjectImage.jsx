const tones = [
  'from-[#e3e3df] to-[#d3d3ce]',
  'from-[#dcdcd7] to-[#cacac4]',
  'from-[#e7e6e1] to-[#d8d6cf]',
  'from-[#d9d9d5] to-[#c6c6c0]',
];

/**
 * Imagen de proyecto (protagonista del estilo Fotobook).
 * Sin `src` muestra un placeholder neutro con la etiqueta; con `showLabel` la etiqueta va sobre la foto.
 * Se anima al hacer hover si algún ancestro tiene la clase `group`.
 */
const ProjectImage = ({ src, alt = '', label, showLabel = false, tone = 0, className = '' }) => {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-line ${className}`}>
        <img
          src={src}
          alt={alt || label || ''}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {showLabel && label && (
          <>
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
            <span className="font-display absolute bottom-4 left-4 text-xs font-semibold tracking-[0.18em] text-white uppercase">
              {label}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt || label || 'Imagen pendiente'}
      className={`relative overflow-hidden bg-gradient-to-br ${tones[tone % tones.length]} ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent 0 22px, rgb(255 255 255 / 0.35) 22px 23px)',
        }}
      />
      {label && (
        <span className="font-display absolute bottom-4 left-4 text-xs font-semibold tracking-[0.18em] text-ink/45 uppercase">
          {label}
        </span>
      )}
    </div>
  );
};

export default ProjectImage;
