// src/pages/LegalPageLayout.tsx
import type { ReactNode } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useLocation } from "react-router-dom";

type LegalPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function LegalPageLayout({
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  const { pathname } = useLocation();

  return (
    <main className="bg-paper pb-12 pt-28 font-texto text-ink lg:pb-16 lg:pt-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <header className="border-l-2 border-calypso pl-6 sm:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-calypso-700">
            Calypso Eventos
          </p>

          <h1 className="mt-5 max-w-4xl font-titular text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-[1.08] tracking-[-0.025em]">
            {title}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {description}
          </p>
        </header>

        <nav aria-label="Documentos legales" className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-b border-ink/20 pb-4 text-sm sm:mt-12">
          {[
            { href: "/privacidad", label: "Política de Privacidad" },
            { href: "/terminos", label: "Términos y Condiciones" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`rounded-sm underline-offset-8 transition-colors hover:text-calypso-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-700 ${pathname === href ? "font-semibold text-calypso-700 underline decoration-2" : "text-ink-soft"}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <article aria-label={title} className="mx-auto max-w-3xl py-10 sm:py-12 [&>div]:space-y-8 [&>div]:text-base [&>div]:leading-[1.8] [&>div]:text-ink-soft [&_h3]:font-titular [&_h3]:text-xl [&_h3]:font-normal [&_h3]:leading-snug [&_h3]:text-ink sm:[&_h3]:text-2xl [&_section+section]:border-t [&_section+section]:border-ink/10 [&_section+section]:pt-8 [&_ul]:marker:text-calypso-700">
          {children}
        </article>

        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-ink/20 pt-6 text-sm font-semibold">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-sm text-ink-soft transition hover:text-calypso-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-700"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Volver al inicio
          </a>
          <a href="/contacto" className="inline-flex items-center gap-2 rounded-sm text-calypso-700 transition hover:text-calypso-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calypso-700">
            Contacto
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </main>
  );
}
