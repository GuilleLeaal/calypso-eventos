import { useEffect, useState } from "react";
import { motion, AnimatePresence, circOut } from "framer-motion";
import { ArrowUpRight, CalendarCheck, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const nav = [
  { label: "Servicios", href: "/#services", id: "services" },
  { label: "Sectores", href: "/#sectors", id: "sectors" },
  { label: "Nuestra historia", href: "/nuestra-historia", id: "history" },
  { label: "Contacto", href: "/#contact", id: "contact" },
  { label: "Ubicación", href: "/#location", id: "location" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    const updatePathname = () => {
      setPathname(window.location.pathname);
    };

    updatePathname();

    window.addEventListener("popstate", updatePathname);

    return () => {
      window.removeEventListener("popstate", updatePathname);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      if (window.location.pathname !== "/") {
        setActiveId("");
        return;
      }

      const sectionIds = ["services", "sectors", "contact", "location"];
      let current = "";

      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (!section) continue;

        const rect = section.getBoundingClientRect();

        if (rect.top <= 170 && rect.bottom >= 170) {
          current = id;
          break;
        }
      }

      setActiveId(current);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (item: (typeof nav)[number]) => {
    if (item.id === "history") {
      return pathname.includes("nuestra-historia");
    }

    return activeId === item.id;
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 overflow-x-clip">
      <motion.div
        initial={{ y: -26, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: circOut }}
        className={[
          "mx-auto w-full max-w-6xl px-4 transition-all duration-300 md:px-6",
          scrolled ? "pt-3" : "pt-5",
        ].join(" ")}
      >
        <div
          className={[
            "group relative isolate flex w-full min-w-0 items-center justify-between gap-4 overflow-hidden rounded-full border px-5 transition-all duration-300 sm:px-6",
            scrolled
              ? "border-[#d8bd90]/80 bg-[#fff9f0]/94 py-2.5 shadow-[0_16px_45px_rgba(63,42,28,0.14)] backdrop-blur-xl"
              : "border-[#e0c79d]/70 bg-[#fff9f0]/84 py-3.5 shadow-[0_10px_30px_rgba(63,42,28,0.08)] backdrop-blur-xl",
          ].join(" ")}
        >
          {/* Background */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,244,230,0.68))]" />
            <div className="absolute left-0 top-0 h-full w-40 opacity-[0.09] [background-image:radial-gradient(#b98a4f_1.2px,transparent_1.2px)] [background-size:13px_13px]" />
            <div className="absolute right-0 top-0 h-full w-72 bg-[radial-gradient(ellipse_at_top_right,rgba(11,179,166,0.12),transparent_68%)]" />
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#c49a5b]/65 to-transparent" />
            <div className="absolute inset-x-20 bottom-0 h-px bg-gradient-to-r from-transparent via-[#0f5550]/20 to-transparent" />
          </div>

          {/* Logo */}
          <a
            href="/"
            aria-label="Ir al inicio"
            className="group/logo flex min-w-0 shrink-0 items-center"
            onClick={() => setOpen(false)}
          >
            <img
              src={logo}
              alt="Calypso Eventos"
              className="h-8 w-auto max-w-[150px] object-contain transition duration-300 group-hover/logo:scale-[1.02] sm:h-9 sm:max-w-[190px] md:max-w-[210px]"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden min-w-0 items-center justify-center gap-6 lg:flex xl:gap-7">
            {nav.map((item) => {
              const active = isActive(item);

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={[
                    "group/nav relative py-2 text-[12px] font-semibold uppercase tracking-[0.13em] transition-all duration-300 xl:text-[13px]",
                    active
                      ? "text-[#0f5550]"
                      : "text-[#4a382e] hover:text-[#0f5550]",
                  ].join(" ")}
                >
                  <span className="relative z-10">{item.label}</span>

                  <span
                    className={[
                      "absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-gradient-to-r from-[#c49a5b] via-[#e8c17f] to-[#0bb3a6] transition-all duration-300",
                      active
                        ? "w-full opacity-100"
                        : "w-0 opacity-0 group-hover/nav:w-full group-hover/nav:opacity-100",
                    ].join(" ")}
                  />
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden shrink-0 md:block">
            <a
              href="/reservar"
              className="group/cta inline-flex items-center justify-center gap-2 rounded-full bg-[#4a2b17] px-5 py-3 text-xs font-bold uppercase tracking-[0.11em] text-white shadow-[0_14px_32px_rgba(74,43,23,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#351f12]"
            >
              <CalendarCheck size={16} className="text-[#e8c17f]" />
              Reservar
              <ArrowUpRight
                size={15}
                className="transition group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              />
            </a>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8bd90]/80 bg-[#fff4df]/70 text-[#3f3028] shadow-[0_8px_22px_rgba(63,42,28,0.10)] transition hover:bg-[#f2e3cd] lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 -z-10 bg-[#2f241e]/35 backdrop-blur-[2px] lg:hidden"
              aria-label="Cerrar menú"
            />

            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: circOut }}
              className="mx-auto w-full max-w-6xl px-4 pt-3 lg:hidden"
            >
              <div className="relative isolate overflow-hidden rounded-[1.8rem] border border-[#d8bd90]/80 bg-[#fff9f0]/96 shadow-[0_24px_60px_rgba(63,42,28,0.22)] backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 -z-10">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff9f0,#fff1df)]" />
                  <div className="absolute right-0 top-0 h-56 w-56 bg-[radial-gradient(ellipse_at_top_right,rgba(11,179,166,0.13),transparent_68%)]" />
                  <div className="absolute left-0 bottom-0 h-48 w-32 opacity-[0.11] [background-image:radial-gradient(#b98a4f_1.2px,transparent_1.2px)] [background-size:13px_13px]" />
                </div>

                <div className="flex flex-col px-6 py-5">
                  <div className="mb-4 flex items-center justify-between border-b border-[#e0c79d]/80 pb-4">
                    <img
                      src={logo}
                      alt="Calypso Eventos"
                      className="h-8 w-auto max-w-[165px] object-contain"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a6b2f]">
                      Menú
                    </span>
                  </div>

                  <div className="flex flex-col">
                    {nav.map((item) => {
                      const active = isActive(item);

                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={[
                            "group/mobile flex items-center justify-between border-b border-[#e6d2b4]/70 py-4 text-sm font-semibold uppercase tracking-[0.12em] transition",
                            active
                              ? "text-[#0f5550]"
                              : "text-[#3f3028] hover:text-[#0f5550]",
                          ].join(" ")}
                        >
                          <span>{item.label}</span>

                          <ArrowUpRight
                            size={17}
                            className={[
                              "transition group-hover/mobile:translate-x-0.5 group-hover/mobile:-translate-y-0.5",
                              active ? "text-[#0f5550]" : "text-[#b88945]",
                            ].join(" ")}
                          />
                        </a>
                      );
                    })}
                  </div>

                  <a
                    href="/reservar"
                    onClick={() => setOpen(false)}
                    className="mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-[#4a2b17] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_16px_35px_rgba(74,43,23,0.24)] transition hover:bg-[#351f12]"
                  >
                    <CalendarCheck size={18} className="text-[#e8c17f]" />
                    Reservar fecha
                    <ArrowUpRight size={17} />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}