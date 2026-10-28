import { BudgetButton } from "./BudgetInquiry";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import { useHeroMode } from "./home/heroMode";

const nav = [
  { label: "Servicios", href: "/#services", id: "services" },
  { label: "Recorrido", href: "/#recorrido", id: "recorrido" },
  { label: "Espacios", href: "/#sectors", id: "sectors" },
  { label: "Ubicación", href: "/#location", id: "location" },
  { label: "Historia", href: "/nuestra-historia", id: "history" },
  { label: "Contacto", href: "/contacto", id: "contact" },
];

const SECTION_IDS = ["services", "recorrido", "sectors", "location"];

export default function Header() {
  const { pathname } = useLocation();
  const heroMode = useHeroMode();
  const [overHero, setOverHero] = useState(pathname === "/");
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const hero = pathname === "/" ? document.getElementById("inicio") : null;
      setOverHero(Boolean(hero && hero.getBoundingClientRect().bottom > 72));

      if (pathname !== "/") {
        setActiveId("");
        return;
      }

      let current = "";

      for (const id of SECTION_IDS) {
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
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const dark = (overHero || open) && heroMode === "night" && pathname === "/";

  const isActive = (item: (typeof nav)[number]) => {
    if (item.id === "history") return pathname.includes("nuestra-historia");
    if (item.id === "contact") return pathname === "/contacto";
    return activeId === item.id;
  };

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 font-texto transition-colors duration-700",
        dark ? "bg-night text-paper" : "bg-paper text-ink",
        overHero && !open ? "" : dark ? "border-b border-night-line" : "border-b border-ink/10",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-10 lg:h-[72px] lg:px-14 xl:px-20">
        <a href="/" aria-label="Calypso Eventos, ir al inicio" className="shrink-0">
          <img
            src={logo}
            alt="Calypso Eventos"
            className={[
              "h-7 w-auto transition-[filter] duration-700 lg:h-8",
              dark ? "invert" : "",
            ].join(" ")}
          />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex xl:gap-9">
          {nav.map((item) => {
            const active = isActive(item);

            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "text-[15px] font-medium underline-offset-[7px] transition-colors duration-300",
                  active
                    ? "underline decoration-2"
                    : "no-underline hover:underline hover:decoration-1",
                  dark
                    ? "decoration-calypso hover:text-paper"
                    : "decoration-calypso hover:text-calypso-700",
                  !active && dark ? "text-paper/80" : "",
                  !active && !dark ? "text-ink-soft" : "",
                ].join(" ")}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <BudgetButton
            className={[
              "hidden items-center gap-2 rounded-md px-5 py-2.5 text-[15px] font-semibold transition-colors duration-300 sm:inline-flex",
              dark
                ? "bg-calypso text-ink hover:bg-[#25c3b6]"
                : "bg-calypso text-ink hover:bg-[#25c3b6]",
            ].join(" ")}
          >
            Consultar presupuesto
          </BudgetButton>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            className={[
              "inline-flex h-11 items-center gap-2 rounded-md border px-3 text-[15px] font-semibold transition-colors lg:hidden",
              dark ? "border-night-line" : "border-ink/15",
            ].join(" ")}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="menu-movil"
          className={[
            "fixed inset-x-0 bottom-0 top-16 overflow-y-auto px-5 pb-10 pt-6 sm:px-10 lg:hidden",
            dark ? "bg-night text-paper" : "bg-paper text-ink",
          ].join(" ")}
        >
          <nav aria-label="Menú móvil">
            <ul className={["divide-y border-y", dark ? "divide-night-line border-night-line" : "divide-ink/10 border-ink/10"].join(" ")}>
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 font-titular text-[2rem] leading-none"
                  >
                    {item.label}
                    <ArrowRight size={20} aria-hidden="true" className={dark ? "text-calypso" : "text-calypso-700"} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <BudgetButton
            onClick={() => setOpen(false)}
            className={[
              "mt-8 flex items-center justify-center gap-3 rounded-md px-6 py-4 text-base font-semibold",
              "bg-calypso text-ink",
            ].join(" ")}
          >
            Consultar presupuesto
            <ArrowRight size={18} aria-hidden="true" />
          </BudgetButton>
        </div>
      )}
    </header>
  );
}
