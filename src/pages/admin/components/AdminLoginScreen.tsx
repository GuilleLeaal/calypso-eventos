import type { Dispatch, FormEvent, SetStateAction } from "react";
import { motion, circOut } from "framer-motion";
import { ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

type LoginFormValues = {
  email: string;
  password: string;
};

export function AdminLoginScreen({
  loginForm,
  setLoginForm,
  loginLoading,
  loginError,
  onSubmit,
}: {
  loginForm: LoginFormValues;
  setLoginForm: Dispatch<SetStateAction<LoginFormValues>>;
  loginLoading: boolean;
  loginError: string;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <main className="relative min-h-[100svh] overflow-x-clip bg-[#f6f0e7] pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-130px] top-[-120px] h-80 w-80 rounded-full bg-[#0BB3A6]/12 blur-3xl" />
        <div className="absolute right-[-140px] bottom-[-130px] h-96 w-96 rounded-full bg-[#e8c17f]/14 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-md px-6 pb-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#087d75] transition hover:text-[#0BB3A6]"
        >
          <ArrowLeft size={17} />
          Volver al sitio
        </Link>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: circOut }}
          className="mt-8 rounded-[1.8rem] border border-[#dfc8ab] bg-[#fff9f0]/86 p-7 shadow-[0_22px_60px_rgba(90,64,50,0.12)] backdrop-blur"
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#0BB3A6]/12 text-[#0BB3A6]">
            <Lock size={25} />
          </div>

          <h1 className="mt-5 font-display text-4xl text-[#2f241e]">
            Admin Calypso
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#5c473b]">
            Acceso privado para gestionar solicitudes y reservas.
          </p>

          <div className="mt-7 space-y-5">
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Email
              </span>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="admin@calypso.com"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#6d5748]">
                Contraseña
              </span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                className="input-contact"
                placeholder="••••••••"
              />
            </label>
          </div>

          {loginError && (
            <p className="mt-5 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0BB3A6] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_18px_42px_rgba(11,179,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[#099f94] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShieldCheck size={18} />
            )}
            Entrar
          </button>
        </motion.form>
      </section>
    </main>
  );
}
