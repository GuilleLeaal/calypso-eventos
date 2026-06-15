// src/pages/TerminosPage.tsx
import LegalPageLayout from "./LegalPageLayout";
import TerminosContent from "../components/legal/TerminosContent";

export default function TerminosPage() {
  return (
    <LegalPageLayout
      title="Términos y Condiciones"
      description="Condiciones generales de uso del sitio web de Calypso Eventos, consultas, solicitudes de reserva, enlaces externos y contenido publicado."
    >
      <TerminosContent />
    </LegalPageLayout>
  );
}