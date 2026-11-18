import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/Logo2.png";
import headerBrand from "../assets/logo.png";
import "./PublicPageIntro.css";

export default function PublicPageIntro({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(() =>
    !pathname.startsWith("/admin-calypso") &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const handoffRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    if (!visible) return;
    const content = contentRef.current;
    const backdrop = backdropRef.current;
    const brand = logoRef.current;
    const handoff = handoffRef.current;
    const headerLogo = content?.querySelector<HTMLImageElement>("[data-intro-logo]");
    if (!content || !backdrop || !brand || !handoff || !headerLogo) return;

    let cancelled = false;
    const animations: Animation[] = [];
    const timers: number[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Bloqueamos la interacción, conservando la barra y el ancho de la página.
    const preventScroll = (event: Event) => event.preventDefault();
    const preventScrollKeys = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        event.preventDefault();
      }
    };
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventScrollKeys);

    function finish() {
      if (!cancelled) setVisible(false);
    }

    function onResize() {
      // La primera navegación puede ajustar el viewport antes de pintar el logo.
      // Recién cancelamos si ya hay una trayectoria calculada que quedó obsoleta.
      if (animations.length > 0) finish();
    }

    const delay = (duration: number) => new Promise<void>((resolve) => {
      timers.push(window.setTimeout(resolve, duration));
    });

    async function reveal() {
      // La primera descarga del logo puede demorar más que una carga con caché.
      const heroPhoto = content!.querySelector<HTMLImageElement>("#inicio img:not([aria-hidden='true'])");
      await Promise.all([
        Promise.race([
          Promise.allSettled([brand!.decode(), headerLogo!.decode()]),
          delay(5000),
        ]),
        Promise.race([
          heroPhoto?.decode().catch(() => undefined),
          delay(2000),
        ]),
      ]);
      if (cancelled) return;

      // Contamos la presentación después de cargar la marca, para que se vea
      // completa antes del cierre incluso en una primera visita sin caché.
      await delay(1050);
      if (cancelled) return;

      const start = brand!.getBoundingClientRect();
      const target = headerLogo!.getBoundingClientRect();
      const centerX = target.left + target.width / 2;
      const centerY = target.top + target.height / 2;
      const scale = Math.min(target.width / start.width, target.height / start.height);
      const translateX = centerX - start.width * scale / 2 - start.left;
      const translateY = centerY - start.height * scale / 2 - start.top;
      const bounds = backdrop!.getBoundingClientRect();
      const localCenterX = centerX - bounds.left;
      const localCenterY = centerY - bounds.top;
      const radius = Math.hypot(
        Math.max(localCenterX, bounds.width - localCenterX),
        Math.max(localCenterY, bounds.height - localCenterY),
      );
      const finalRadius = Math.hypot(target.width, target.height) / 2 + 14;
      const timing = { duration: 780, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" as const };

      // El círculo tiene su propio centro en el logo, en coordenadas del overlay.
      // Escalamos esa figura sin trasladarla hacia la esquina de la pantalla.
      Object.assign(backdrop!.style, {
        inset: "auto",
        left: `${localCenterX - radius}px`,
        top: `${localCenterY - radius}px`,
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: "50%",
      });

      // El logo completo y la marca del encabezado tienen proporciones distintas.
      // La escala es uniforme; el relevo se hace con un fundido entre las marcas.
      Object.assign(handoff!.style, {
        left: `${target.left}px`,
        top: `${target.top}px`,
        width: `${target.width}px`,
        height: `${target.height}px`,
        filter: window.getComputedStyle(headerLogo!).filter,
      });
      animations.push(brand!.animate([
        { transform: "translate(0, 0) scale(1)", opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.55 },
        { transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`, opacity: 0, offset: 1 },
      ], timing));
      animations.push(handoff!.animate([
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 0.65 },
        { opacity: 1, offset: 1 },
      ], timing));
      const curtain = backdrop!.animate([
        { transform: "scale(1)", offset: 0, easing: "cubic-bezier(0.65, 0, 0.35, 1)" },
        { transform: `scale(${finalRadius / radius})`, offset: 0.78, easing: "ease-in" },
        { transform: "scale(0)", offset: 1 },
      ], { duration: 1120, fill: "forwards" });
      animations.push(curtain);
      await curtain.finished;
      finish();
    }

    // También libera la página si cambia el tamaño o falla una animación.
    timers.push(window.setTimeout(finish, 8000));
    window.addEventListener("resize", onResize);
    reducedMotion.addEventListener("change", finish);
    void reveal().catch(finish);

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      animations.forEach((animation) => animation.cancel());
      window.removeEventListener("resize", onResize);
      reducedMotion.removeEventListener("change", finish);
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScrollKeys);
    };
  }, [visible, pathname]);

  return (
    <>
      <div ref={contentRef} className="public-intro-content" inert={visible}>
        {children}
      </div>
      {visible && (
        <div className="public-intro">
          <div ref={backdropRef} className="public-intro__backdrop" aria-hidden="true" />
          <div className="public-intro__center" aria-hidden="true">
            <img ref={logoRef} src={logo} width={6060} height={3549} alt="" className="public-intro__logo" />
          </div>
          <img ref={handoffRef} src={headerBrand} width={6060} height={1924} alt="" className="public-intro__handoff" aria-hidden="true" />
          <span role="status" className="sr-only">Cargando Calypso Eventos</span>
        </div>
      )}
    </>
  );
}
