import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="container-shell">
        <SectionHeader
          numeral="IV"
          kicker="Contact"
          title={
            <>
              Have a hard system worth{" "}
              <span className="display-italic text-[var(--accent)]">building</span>?
            </>
          }
          text="Currently building at Agneyas Labs. Always happy to talk ML systems, agentic products, and backend infrastructure — especially the parts that have to survive production."
        />

        <Reveal delay={80}>
          <div className="flex flex-wrap items-center gap-3">
            <a href="mailto:9shrey@gmail.com" className="btn btn-primary">
              9shrey@gmail.com
            </a>
            <a
              href="https://linkedin.com/in/9shrey"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              LinkedIn
            </a>
            <a
              href="/Shrey_Singh_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              Resume
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
