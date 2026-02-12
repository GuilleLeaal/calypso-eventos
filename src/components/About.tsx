import { motion, circOut } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import salon from "../assets/FotoPinar.jpg";

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* LEFT – clean + strong */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: circOut }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs tracking-[0.22em] uppercase text-black/60">
              <Sparkles size={14} className="text-calypso" />
              Sobre nosotros
            </div>

            <h2 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight">
              Un espacio para <span className="text-calypso">celebrar</span> con
              calma.
            </h2>

            <p className="mt-5 text-black/70 leading-relaxed max-w-md">
              En Calypso Eventos combinamos estética, naturaleza y orden
              para que tu celebración sea simple de organizar y hermosa de vivir.
            </p>

            <div className="mt-8">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-medium text-black/70 hover:text-black transition"
              >
                Consultar disponibilidad
                <ArrowUpRight size={16} className="text-calypso" />
              </a>
            </div>
          </motion.div>

          {/* RIGHT – image hero card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05, ease: circOut }}
            className="relative lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.15)]">
              
              <img
                src={salon}
                alt="Calypso Eventos exterior"
                className="h-[520px] w-full object-cover"
              />

              {/* soft overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              {/* floating text */}
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="font-display text-2xl tracking-tight">
                  Natural. Flexible. Cálido.
                </div>
                <div className="mt-2 text-sm text-white/80 max-w-sm">
                  Espacio adaptable, buena circulación y acompañamiento real en cada evento.
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
