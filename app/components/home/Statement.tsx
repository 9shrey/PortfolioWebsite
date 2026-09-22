import ScrollWords from "../motion/ScrollWords";
import Reveal from "../motion/Reveal";

/** Every clause here is lifted from what the projects already claim and
 *  evidence — the shared feature function in Argus, its chronological
 *  holdout, Inferbench's token-identical greedy-output gate. No new facts.
 *
 *  This is the site's only scroll-linked text reveal. One paragraph, chosen
 *  because it's the one worth slowing a reader down for; applied everywhere
 *  the effect stops being expressive and turns into an obstacle. */
const STATEMENT =
  "Train and serve from one shared feature function. A chronological holdout instead of a random split. Token-identical output before any speed claim is made. Most of the time goes into checking the work.";

export default function Statement() {
  return (
    <section className="section">
      <div className="shell">
        <Reveal>
          <p className="micro mb-12">Approach</p>
        </Reveal>

        <ScrollWords
          text={STATEMENT}
          className="display max-w-[22ch] text-[clamp(1.75rem,4.6vw,3.4rem)] leading-[1.15] md:max-w-[24ch]"
        />
      </div>
    </section>
  );
}
