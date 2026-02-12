import Header from "./components/Header";
import Hero from "./components/Hero";
import Sectores from "./components/Sectores";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Location from "./components/Location";
import Footer from "./components/Footer";
import About from "./components/About";

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-white text-black">
      <Header />
      <main>
        <Hero />
        {/* Bridge: transición real sin lavar el Hero */}
        <section className="bg-black">
          <div className="h-24 bg-gradient-to-b from-black via-black/40 to-white" />
        </section>
        <section className="bg-zinc-50">
          <About />
          <Services />
          <Sectores />
          <Contact />
          <Location />
        </section>
      </main>
      <Footer />
    </div>
  );
}
