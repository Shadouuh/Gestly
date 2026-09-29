import React from 'react';
import { Sparkles } from 'lucide-react';
import sectionBackground from '../../assets/hero/background.png';
import defaultHeroImage from '../../assets/hero/hero-image.png';

const badgeStyles = {
  blue: 'bg-blue-50/90 border-blue-100 text-blue-700',
  emerald: 'bg-emerald-50/90 border-emerald-100 text-emerald-700',
  violet: 'bg-violet-50/90 border-violet-100 text-violet-700',
  amber: 'bg-amber-50/90 border-amber-100 text-amber-700',
  slate: 'bg-white/80 border-slate-200 text-slate-600',
};

/**
 * Hero de sección marketing: fondo decorativo + copy izquierda + ilustración suelta derecha.
 */
const PageSectionHero = ({
  badgeIcon: BadgeIcon = Sparkles,
  badgeLabel,
  badgeVariant = 'blue',
  title,
  titleHighlight,
  description,
  chips = [],
  imageSrc = defaultHeroImage,
  imageAlt = 'Gestly',
  align = 'left',
}) => {
  const isCenter = align === 'center';

  return (
    <section className="relative border-b border-slate-200/60 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <img
          src={sectionBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className={`absolute inset-0 ${
            isCenter
              ? 'bg-gradient-to-b from-white/90 via-white/75 to-white/50'
              : 'bg-gradient-to-r from-white/92 via-white/70 to-white/20 lg:from-white/88 lg:via-white/55 lg:to-transparent'
          }`}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 py-5 sm:py-6 md:py-7">
        <div
          className={`grid lg:grid-cols-[1.1fr_0.9fr] gap-4 lg:gap-6 items-center min-h-0 ${
            isCenter ? 'text-center' : ''
          }`}
        >
          <div className={`relative z-10 space-y-2.5 sm:space-y-3 ${isCenter ? 'mx-auto max-w-xl' : 'max-w-xl'}`}>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.7rem] font-semibold backdrop-blur-sm ${
                badgeStyles[badgeVariant] || badgeStyles.blue
              } ${isCenter ? 'mx-auto' : ''}`}
            >
              <BadgeIcon size={12} strokeWidth={2.5} />
              {badgeLabel}
            </div>

            <h1 className="font-display font-bold text-[1.45rem] sm:text-[1.6rem] lg:text-[1.72rem] leading-[1.14] tracking-tight text-slate-900">
              {title}
              {titleHighlight && (
                <>
                  {' '}
                  <span className="text-blue-600">{titleHighlight}</span>
                </>
              )}
            </h1>

            {description && (
              <p
                className={`text-[0.82rem] sm:text-[0.85rem] text-slate-600 leading-relaxed max-w-md ${
                  isCenter ? 'mx-auto' : ''
                }`}
              >
                {description}
              </p>
            )}

            {chips.length > 0 && (
              <div
                className={`flex flex-wrap gap-1.5 pt-0.5 ${isCenter ? 'justify-center' : ''}`}
              >
                {chips.map(({ icon: Icon, label, active }) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.68rem] font-medium border backdrop-blur-sm transition-colors ${
                      active
                        ? 'bg-blue-50/95 border-blue-200 text-blue-700'
                        : 'bg-white/85 border-slate-200/90 text-slate-600 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={12}
                        className={active ? 'text-blue-600' : 'text-slate-400'}
                        strokeWidth={2.25}
                      />
                    )}
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-10 flex justify-center lg:justify-end items-end pointer-events-none">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-auto max-w-[min(100%,240px)] sm:max-w-[260px] lg:max-w-[300px] max-h-[140px] sm:max-h-[165px] lg:max-h-[185px] object-contain object-bottom object-right select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageSectionHero;
