export default function PrivacidadContent() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-base font-semibold text-white">1. Datos que Recopilamos</h3>
        <p className="mt-2">A través del formulario o medios digitales podemos recopilar:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>Nombre</li>
          <li>Teléfono</li>
          <li>Fecha del evento</li>
          <li>Tipo de evento</li>
          <li>Mensaje enviado</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white">2. Finalidad del Uso</h3>
        <p className="mt-2">
          La información se utiliza exclusivamente para responder consultas, coordinar disponibilidad y brindar
          asesoramiento comercial.
        </p>
        <p className="mt-2">No compartimos, vendemos ni cedemos datos personales a terceros.</p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white">3. Seguridad</h3>
        <p className="mt-2">
          Los datos enviados son tratados con confidencialidad y utilizados únicamente para fines vinculados
          a la actividad de Calypso Eventos.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white">4. Cookies</h3>
        <p className="mt-2">
          El sitio puede utilizar herramientas básicas de análisis para mejorar la experiencia. Estas herramientas
          no recopilan información personal sensible.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white">5. Contacto</h3>
        <p className="mt-2">
          Para consultas relacionadas con privacidad, puede comunicarse a través de los medios disponibles en el sitio.
        </p>
      </section>
    </div>
  );
}
