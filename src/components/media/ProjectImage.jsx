const tones = [
  'from-[#e3e3df] to-[#d3d3ce]',
  'from-[#dcdcd7] to-[#cacac4]',
  'from-[#e7e6e1] to-[#d8d6cf]',
  'from-[#d9d9d5] to-[#c6c6c0]',
];

/**
 * Imagen de proyecto (protagonista del estilo Fotobook).
 * Mientras no haya foto real muestra un placeholder neutro con la etiqueta.
 * Se anima al hacer hover si algún ancestro tiene la clase `group`.
 */
const ProjectImage = ({ src, alt = '', label, tone = 0, className = '' }) => {
  if (src) {
    return (
      <div className={`overflow-hidden bg-line ${className}`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
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
