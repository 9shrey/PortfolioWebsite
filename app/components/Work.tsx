import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function Work() {
  return (
    <section id="work" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          numeral="II"
          kicker="FIELDWORK"
          title={
            <>
              One lab coat, <span className="display-italic">many</span>{" "}
              forecasts.
            </>
          }
          lede="Selected professional experience. Where the models stopped being toys and started being infrastructure."
        />

        <div className="mt-14 md:mt-20">
          <Reveal>
            <div className="grid md:grid-cols-12 gap-8 md:gap-10 border-t border-[color:var(--rule)] pt-10">
              <div className="md:col-span-3">
                <p className="micro">JUN 2025 — PRESENT</p>
                <p className="micro micro-dim mt-2">BENGALURU, IN</p>
              </div>
              <div className="md:col-span-9">
                <h3 className="display text-3xl md:text-5xl">
                  Machine Learning Intern
                  <br />
                  <span className="display-italic text-[color:var(--fg-dim)]">
                    NetApp.
                  </span>
                </h3>

                <ul className="mt-8 space-y-5 text-[color:var(--fg-dim)] leading-relaxed text-[15px] md:text-[17px]">
                  <li className="grid grid-cols-[auto_1fr] gap-4">
                    <span className="micro pt-1.5 whitespace-nowrap">
                      · 01
                    </span>
                    <span>
                      Built a{" "}
                      <span className="text-[color:var(--fg)]">
                        time-series forecasting system
                      </span>{" "}
                      predicting over $1B in revenue from 1.5M+ records —
                      consumed directly by business planning &amp;
                      forecasting workflows.
                    </span>
                  </li>
                  <li className="grid grid-cols-[auto_1fr] gap-4">
                    <span className="micro pt-1.5 whitespace-nowrap">
                      · 02
                    </span>
                    <span>
                      Developed a commission forecasting model for{" "}
                      <span className="text-[color:var(--fg)]">4,900+ users</span>{" "}
                      achieving 6–10% MAPE using XGBoost and LightGBM
                      ensembles.
                    </span>
                  </li>
                  <li className="grid grid-cols-[auto_1fr] gap-4">
                    <span className="micro pt-1.5 whitespace-nowrap">
                      · 03
                    </span>
                    <span>
                      Designed{" "}
                      <span className="text-[color:var(--fg)]">
                        scalable ML pipelines
                      </span>{" "}
                      for preprocessing, training, validation, and batch
                      inference — production-ready, reproducible, and
                      monitored.
                    </span>
                  </li>
                  <li className="grid grid-cols-[auto_1fr] gap-4">
                    <span className="micro pt-1.5 whitespace-nowrap">
                      · 04
                    </span>
                    <span>
                      Delivered model outputs to sales and finance teams,
                      enabling data-driven forecasting and strategic
                      decisions across the org.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid md:grid-cols-12 gap-8 md:gap-10 border-t border-[color:var(--rule)] pt-10 mt-14">
              <div className="md:col-span-3">
                <p className="micro">OCT 2022 — PRESENT</p>
                <p className="micro micro-dim mt-2">MANIPAL, IN</p>
              </div>
              <div className="md:col-span-9">
                <h3 className="display text-3xl md:text-5xl">
                  B.Tech · CSE (AI &amp; ML)
                  <br />
                  <span className="display-italic text-[color:var(--fg-dim)]">
                    Manipal Institute of Technology.
                  </span>
                </h3>
                <p className="mt-6 text-[color:var(--fg-dim)] leading-relaxed text-[15px] md:text-[17px] max-w-2xl">
                  CGPA 8.22. Coursework across Data Structures, Machine
                  Learning, Deep Learning, Computer Vision, Artificial
                  Intelligence, Operating Systems, and Database Management
                  Systems.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
