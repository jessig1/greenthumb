import type { ReactNode } from 'react'
import { Check, Leaf, Sparkles, Sprout, SunMedium } from 'lucide-react'

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-primary p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full border border-white/10 bg-white/5" />
        <div className="pointer-events-none absolute right-20 bottom-20 size-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 size-72 rounded-full bg-lime-300/10 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white/12 backdrop-blur">
            <Leaf className="size-6" />
          </span>
          <div>
            <p className="text-xl font-semibold tracking-[-0.04em]">GreenThumb</p>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-white/55 uppercase">Garden companion</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-lime-300/15 text-lime-200">
            <Sparkles className="size-6" />
          </div>
          <h2 className="text-4xl font-semibold tracking-[-0.05em] xl:text-5xl">
            A healthier garden starts with knowing what it needs.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65">
            Plan every space, keep your plants organized, and get practical guidance tailored to what you grow.
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-2 gap-3 text-sm text-white/75">
            {['Track every garden', 'Build a plant inventory', 'Identify from a photo', 'Get tailored care help'].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-lime-300/15 text-lime-200">
                  <Check className="size-3" />
                </span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-5 text-xs text-white/45">
          <span className="flex items-center gap-1.5"><Sprout className="size-4" /> Plan</span>
          <span className="flex items-center gap-1.5"><SunMedium className="size-4" /> Grow</span>
          <span className="flex items-center gap-1.5"><Leaf className="size-4" /> Thrive</span>
        </div>
      </section>

      <main className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-8 lg:bg-card/65">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15">
              <Leaf className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-[-0.04em]">GreenThumb</span>
          </div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
