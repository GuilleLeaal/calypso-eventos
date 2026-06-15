// src/pages/PrivacidadPage.tsx
import LegalPageLayout from "./LegalPageLayout";
import PrivacidadContent from "../components/legal/PrivacidadContent";

export default function PrivacidadPage() {
  return (
    <LegalPageLayout
      title="Política de Privacidad"
      description="Información sobre cómo Calypso Eventos recopila, utiliza y protege los datos enviados a través de este sitio web y sus canales digitales de contacto."
    >
      <PrivacidadContent />
    </LegalPageLayout>
  );
}