import { useEffect, useState } from "react";
import { motion, AnimatePresence, circOut } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const nav = [
  { label: "Sobre nosotros", href: "#about" },
  { label: "Servicios", href: "#services" },
  { label: "Sectores", href: "#sectors" },
  { label: "Contacto", href: "#contact" },
  { label: "Ubicación", href: "#location" },
];


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 overflow-x-clip">
      <motion.div
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: circOut }}
        className="mx-auto max-w-6xl w-full px-4 pt-5"
      >
        <div
          className={[
            "group w-full min-w-0",
            "relative isolate flex items-center justify-between gap-3",
            "rounded-2xl border px-4 sm:px-6 py-3 sm:py-4",
            "overflow-hidden",
            scrolled
              ? "bg-white/80 backdrop-blur-xl border-black/10 shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
              : "bg-white/60 backdrop-blur-md border-black/10",
          ].join(" ")}
        >
          {/* ✅ Glow seguro: sin inset negativo */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <div className="absolute left-1/2 top-[-40px] h-[140px] w-[360px] -translate-x-1/2 rounded-full bg-calypso/18 blur-3xl" />
          </div>

          {/* Logo */}
          <a href="#top" className="flex items-center shrink-0">
            <img
              src={logo}
              alt="Calypso Eventos"
              className="h-10 sm:h-11 md:h-10 w-auto max-w-[160px] sm:max-w-[220px] md:max-w-[240px] object-contain"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 min-w-0">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-sm tracking-wide text-black/70 hover:text-black transition"
              >
                {item.label}
                <span className="absolute left-0 -bottom-1 h-px w-0 bg-calypso transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block shrink-0">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-black/90 transition"
            >
              Reservar fecha <span className="ml-2 text-calypso">●</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden shrink-0 inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/80 backdrop-blur p-2"
            aria-label="Abrir menú"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: circOut }}
            className="md:hidden mx-auto max-w-6xl w-full px-4"
          >
            <div className="mt-3 rounded-2xl border border-black/10 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="flex flex-col p-6 gap-4">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-sm text-black/80 hover:text-calypso transition"
                  >
                    {item.label}
                  </a>
                ))}

                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
                >
                  Reservar fecha <span className="ml-2 text-calypso">●</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
