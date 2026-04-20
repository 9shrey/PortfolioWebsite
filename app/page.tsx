import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Toolkit from "./components/Toolkit";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Cursor from "./components/Cursor";
import ScrollProgress from "./components/ScrollProgress";
import SectionRail from "./components/SectionRail";
import Marquee from "./components/Marquee";

export default function Home() {
  return (
    <>
      <Cursor />
      <ScrollProgress />
      <SectionRail />
      <Nav />
      <main>
        <Hero />
        <Marquee
          items={[
            "FORECASTING",
            "REGRESSION",
            "RUST",
            "GO",
            "PYTHON",
            "PIPELINES",
            "SHIPS THINGS",
          ]}
        />
        <About />
        <Projects />
        <Marquee
          reverse
          items={[
            "AVAILABLE · 2026",
            "BENGALURU · IST",
            "ML · BACKEND · SYSTEMS",
            "LET'S BUILD",
          ]}
        />
        <Toolkit />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
