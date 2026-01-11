import { useMemo } from 'react'
import { Check, Palette } from 'lucide-react'

import { useUiStore, type ThemeId } from '@shared/stores/uiStore'

export function TemasPage() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const themeId = useUiStore((s) => s.themeId)
  const setThemeId = useUiStore((s) => s.setThemeId)

  const themes = useMemo(
    () =>
      [
        {
          id: 'default' as const,
          name: 'Clásico',
          subtitle: 'Minimal neutro',
          preview: {
            backgroundColor: '#f5f5f7',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.10) 1px, rgba(0,0,0,0) 0), repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 14px)',
            backgroundSize: '18px 18px, auto',
            color: '#0b0b0d',
            accent: '#0b0b0d',
          },
        },
        {
          id: 'ocean' as const,
          name: 'Océano',
          subtitle: 'Azul fresco',
          preview: {
            backgroundColor: '#f2f7ff',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(10,132,255,0.18) 1px, rgba(0,0,0,0) 0), radial-gradient(circle at 20% 10%, rgba(10,132,255,0.18), rgba(0,0,0,0) 46%), repeating-linear-gradient(135deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 14px)',
            backgroundSize: '18px 18px, auto, auto',
            color: '#071017',
            accent: '#0a84ff',
          },
        },
        {
          id: 'mint' as const,
          name: 'Menta',
          subtitle: 'Verde suave',
          preview: {
            backgroundColor: '#eefbf7',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(24,169,153,0.18) 1px, rgba(0,0,0,0) 0), radial-gradient(circle at 75% 12%, rgba(24,169,153,0.16), rgba(0,0,0,0) 52%), repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 16px)',
            backgroundSize: '18px 18px, auto, auto',
            color: '#071017',
            accent: '#18a999',
          },
        },
        {
          id: 'sunset' as const,
          name: 'Atardecer',
          subtitle: 'Naranja + rosa',
          preview: {
            backgroundColor: '#fff5f1',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,90,31,0.18) 1px, rgba(0,0,0,0) 0), radial-gradient(circle at 22% 12%, rgba(255,90,31,0.16), rgba(0,0,0,0) 46%), radial-gradient(circle at 88% 22%, rgba(255,59,130,0.12), rgba(0,0,0,0) 52%)',
            backgroundSize: '18px 18px, auto, auto',
            color: '#071017',
            accent: '#ff5a1f',
          },
        },
        {
          id: 'grape' as const,
          name: 'Uva',
          subtitle: 'Púrpura',
          preview: {
            backgroundColor: '#f7f3ff',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(124,58,237,0.18) 1px, rgba(0,0,0,0) 0), radial-gradient(circle at 18% 12%, rgba(124,58,237,0.16), rgba(0,0,0,0) 52%), repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 14px)',
            backgroundSize: '18px 18px, auto, auto',
            color: '#071017',
            accent: '#7c3aed',
          },
        },
        {
          id: 'forest' as const,
          name: 'Bosque',
          subtitle: 'Verde intenso',
          preview: {
            backgroundColor: '#f1fbf4',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(15,138,59,0.18) 1px, rgba(0,0,0,0) 0), radial-gradient(circle at 74% 10%, rgba(15,138,59,0.16), rgba(0,0,0,0) 54%), repeating-linear-gradient(135deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 20px)',
            backgroundSize: '18px 18px, auto, auto',
            color: '#071017',
            accent: '#0f8a3b',
          },
        },
        {
          id: 'sand' as const,
          name: 'Arena',
          subtitle: 'Cálido',
          preview: {
            backgroundColor: '#fff7ea',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(193,106,31,0.16) 1px, rgba(0,0,0,0) 0), radial-gradient(circle at 70% 10%, rgba(193,106,31,0.12), rgba(0,0,0,0) 56%), repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 16px)',
            backgroundSize: '18px 18px, auto, auto',
            color: '#071017',
            accent: '#c16a1f',
          },
        },
        {
          id: 'rose' as const,
          name: 'Rosa',
          subtitle: 'Vibrante',
          preview: {
            backgroundColor: '#fff2f6',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,45,85,0.16) 1px, rgba(0,0,0,0) 0), radial-gradient(circle at 22% 12%, rgba(255,45,85,0.14), rgba(0,0,0,0) 54%), repeating-linear-gradient(135deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 18px)',
            backgroundSize: '18px 18px, auto, auto',
            color: '#071017',
            accent: '#ff2d55',
          },
        },
        {
          id: 'slate' as const,
          name: 'Pizarra',
          subtitle: 'Frío moderno',
          preview: {
            backgroundColor: '#f3f5f7',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(37,99,235,0.12) 1px, rgba(0,0,0,0) 0), repeating-linear-gradient(135deg, rgba(0,0,0,0.035) 0px, rgba(0,0,0,0.035) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 16px)',
            backgroundSize: '18px 18px, auto',
            color: '#071017',
            accent: '#2563eb',
          },
        },
        {
          id: 'neon' as const,
          name: 'Neón',
          subtitle: 'Cian eléctrico',
          preview: {
            backgroundColor: '#f0fdff',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0,229,255,0.14) 1px, rgba(0,0,0,0) 0), radial-gradient(circle at 18% 8%, rgba(0,229,255,0.18), rgba(0,0,0,0) 52%), repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 14px)',
            backgroundSize: '18px 18px, auto, auto',
            color: '#071017',
            accent: '#00e5ff',
          },
        },
        {
          id: 'mono' as const,
          name: 'Mono',
          subtitle: 'Alto contraste',
          preview: {
            backgroundColor: '#f7f7f7',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.09) 1px, rgba(0,0,0,0) 0), repeating-linear-gradient(135deg, rgba(0,0,0,0.045) 0px, rgba(0,0,0,0.045) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 14px)',
            backgroundSize: '18px 18px, auto',
            color: '#0b0b0d',
            accent: '#0b0b0d',
          },
        },
      ] satisfies Array<{
        id: ThemeId
        name: string
        subtitle: string
        preview: {
          backgroundColor: string
          backgroundImage: string
          backgroundSize: string
          color: string
          accent: string
        }
      }>,
    [],
  )

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Temas</h1>
        <p className="mt-2 text-sm tracking-tight text-[color:var(--muted)]">Personalizá la apariencia de la aplicación.</p>
      </div>

      <div className="animate-slide-in-up space-y-4">
        <div className="max-w-3xl rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-[0_10px_30px_var(--shadow)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--outline-bg)]">
              <Palette className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Apariencia</div>
              <div className="mt-1 text-xs tracking-tight text-[color:var(--muted)]">Elegí un estilo y alterná el modo claro/oscuro.</div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs tracking-tight text-[color:var(--muted)]">Modo</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={[
                  'flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-semibold tracking-tight transition-transform active:scale-[0.98]',
                  theme === 'light'
                    ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]'
                    : 'border-[color:var(--border)] bg-[color:var(--outline-bg)] text-[color:var(--text)] hover:bg-[color:var(--outline-hover-bg)]',
                ].join(' ')}
              >
                Claro
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={[
                  'flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-semibold tracking-tight transition-transform active:scale-[0.98]',
                  theme === 'dark'
                    ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]'
                    : 'border-[color:var(--border)] bg-[color:var(--outline-bg)] text-[color:var(--text)] hover:bg-[color:var(--outline-hover-bg)]',
                ].join(' ')}
              >
                Oscuro
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {themes.map((t) => {
            const active = themeId === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setThemeId(t.id)}
                className={[
                  'group relative overflow-hidden rounded-3xl border p-5 text-left shadow-[0_10px_30px_var(--shadow)] transition-transform active:scale-[0.99]',
                  active ? 'border-[color:var(--primary-bg)]' : 'border-[color:var(--border)]',
                ].join(' ')}
              >
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    backgroundColor: t.preview.backgroundColor,
                    backgroundImage: t.preview.backgroundImage,
                    backgroundSize: t.preview.backgroundSize,
                  }}
                />
                <div className="absolute inset-0 bg-[color:var(--card-bg)]/70 group-hover:bg-[color:var(--card-bg)]/62" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold tracking-tight">{t.name}</div>
                    <div className="mt-1 truncate text-xs tracking-tight text-[color:var(--muted)]">{t.subtitle}</div>
                  </div>
                  {active ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]">
                      <Check className="h-4 w-4" strokeWidth={2} />
                    </div>
                  ) : (
                    <div
                      className="h-9 w-9 rounded-2xl border"
                      style={{ borderColor: t.preview.accent, backgroundColor: `${t.preview.accent}20` }}
                    />
                  )}
                </div>

                <div className="relative mt-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)]/65 p-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold tracking-tight text-[color:var(--muted)]">Vista previa</div>
                    <div className="h-2 w-10 rounded-full" style={{ backgroundColor: t.preview.accent }} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="h-8 rounded-xl border border-[color:var(--border)] bg-[color:var(--outline-bg)]" />
                    <div className="h-8 rounded-xl" style={{ backgroundColor: t.preview.accent, opacity: 0.85 }} />
                    <div className="h-8 rounded-xl border border-[color:var(--border)] bg-[color:var(--outline-bg)]" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="max-w-3xl rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5 text-xs tracking-tight text-[color:var(--muted)] shadow-[0_10px_30px_var(--shadow)]">
          El fondo y los acentos cambian automáticamente según el tema elegido.
        </div>
      </div>
    </div>
  )
}
