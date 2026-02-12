import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function LegalModal({ open, title, children, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center p-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f16] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow */}
              <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-24 w-[70%] rounded-full bg-[#11c5b7]/15 blur-3xl" />

              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-sm text-white/50">Calypso Eventos</p>
                  <h2 className="text-lg font-semibold text-white">{title}</h2>
                </div>

                <button
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:border-white/20 hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="relative max-h-[70vh] overflow-y-auto px-5 py-5 text-sm leading-relaxed text-white/70 sm:px-6">
                {children}
                <p className="mt-8 text-xs text-white/40">
                  Última actualización: Febrero 2026
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                <button
                  onClick={onClose}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#11c5b7] to-[#0ea5e9] px-5 py-3 text-sm font-semibold text-[#061016] shadow-lg shadow-[#11c5b7]/10 transition hover:shadow-[#11c5b7]/20"
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
