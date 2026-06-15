// src/pages/LegalPageLayout.tsx
import type { ReactNode } from "react";
import logo from "../assets/Logo2.png";

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
  return (
    <main className="relative overflow-hidden bg-[#17110d] text-[#f8efe2]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-calypso/12 blur-3xl" />
        <div className="absolute right-[-120px] bottom-[20%] h-72 w-72 rounded-full bg-[#e8c17f]/10 blur-3xl" />
      </div>

      <section className="relative mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <a href="/" aria-label="Volver al inicio" className="inline-flex">
          <img
            src={logo}
            alt="Calypso Eventos"
            className="h-10 w-auto max-w-[210px] object-contain brightness-0 invert"
          />
        </a>

        <div className="mt-10 rounded-[2rem] border border-[#f8efe2]/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur sm:p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e8c17f]">
            Calypso Eventos
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#f8efe2]/68">
            {description}
          </p>

          <div className="mt-8 border-t border-[#f8efe2]/10 pt-8">
            {children}
          </div>
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center rounded-full border border-[#f8efe2]/18 px-5 py-3 text-sm font-semibold text-[#f8efe2]/82 transition hover:border-[#e8c17f]/55 hover:text-white"
          >
            Volver al inicio
          </a>
        </div>
      </section>
    </main>
  );
}