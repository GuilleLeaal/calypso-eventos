import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Sectores from "./components/Sectores";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Location from "./components/Location";
import Footer from "./components/Footer";
import NuestraHistoria from "./pages/NuestraHistoria";
import ReviewPage from "./pages/ReviewPage";
import ReviewsPreview from "./components/ReviewsPreview";
import ReservationPage from "./pages/ReservationPage";
import AdminReservationsPage from "./pages/AdminReservationsPage";
function Home() {
  return (
    <main>
      <Hero />

      <ReviewsPreview />

      <section className="bg-rustic-ivory">
        <Services />
        <Sectores />
        <Contact />
        <Location />
      </section>
    </main>
  );
}

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-rustic-ivory text-rustic-espresso">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nuestra-historia" element={<NuestraHistoria />} />
        <Route path="/dejar-resena" element={<ReviewPage />} />
        <Route path="/reservar" element={<ReservationPage />} />
        <Route path="/admin-calypso" element={<AdminReservationsPage />} />
      </Routes>

      <Footer />
    </div>
  );
}
