/* The home page's personality sections. Every story and rule here comes
   from a project repo's findings.md, README or committed data. Nothing is
   paraphrased into a stronger claim than the source makes. */

export interface Lie {
  /** What the evidence looked like at first. */
  looked: string;
  /** What it turned out to be. */
  was: string;
  /** What changed in how I work because of it. */
  now: string;
  project: string;
  slug: string;
  /** A short scrawl in the margin. */
  scrawl: string;
}

export const lies: Lie[] = [
  {
    looked: "A 6.6× faster kernel.",
    was: "Relative error of 6×10². Triton's autotuner re-ran a non-idempotent atomic_add into the same output buffer once per config, so every trial summed into the answer. Correct when called once; wrong only when benchmarked.",
    now: "The correctness check runs immediately before every timing, not once at the end.",
    project: "Inferbench",
    slug: "inferbench",
    scrawl: "fast + wrong",
  },
  {
    looked: "A GPU idling at 345 MHz, causing a flat 1.3 ms floor.",
    was: "Kernel dispatch. The card ramps to 1425 MHz the moment work arrives, so the idle reading described a state that never existed during the measurement.",
    now: "Clock and temperature are sampled on every measurement, not once at the start.",
    project: "Inferbench",
    slug: "inferbench",
    scrawl: "wrong hypothesis",
  },
  {
    looked: "A flaky test. Failed once in the full suite, passed alone.",
    was: "Split-K atomics land in an unspecified order and fp32 addition isn't associative: 2 of 400 calls differed by 1.9×10⁻⁶. The test asserted a property the algorithm never had.",
    now: "Assert a bound that sits six orders of magnitude below the bug the test exists to catch.",
    project: "Inferbench",
    slug: "inferbench",
    scrawl: "it was telling the truth",
  },
  {
    looked: "Models that can’t handle unions at the hardest schema tier.",
    was: "Honest abstentions. A null in a oneOf slot is reported under the oneOf keyword, so the grader filed refusals as union failures. A failing test caught it before a single API call was spent.",
    now: "Check for null before dispatching on the failing keyword. The taxonomy is the instrument.",
    project: "SchemaBench",
    slug: "schemabench",
    scrawl: "a clean number, wrong heading",
  },
  {
    looked: "A hard schema failure: zero-length output.",
    was: "A reasoning model that spent its entire 2,000-token budget thinking and had nothing left to answer with.",
    now: "Any finish_reason = length is classed as truncated, never as invalid.",
    project: "SchemaBench",
    slug: "schemabench",
    scrawl: "harness bug, not model bug",
  },
  {
    looked: "A 5% speedup at batch 1.",
    was: "Noise. The first run had a coefficient of variation of 0.092; the tightened re-run gave 1.01×.",
    now: "Report the re-run. A 5% win in a convenient direction is a small lie.",
    project: "Inferbench",
    slug: "inferbench",
    scrawl: "1.05× → 1.01×",
  },
];

export interface Rule {
  text: string;
  /** Where the rule shows up in the work. */
  where: string;
}

export const rules: Rule[] = [
  { text: "Check it’s correct right before you time it.", where: "Inferbench · a correctness gate before every timed run" },
  { text: "Run the control where the fix should do nothing.", where: "Inferbench · batch 32 at 0.99×, prefill at 0.97–1.08×" },
  { text: "Report the baseline when it wins.", where: "RL Arbitrage · the z-score baseline edges out the RL policy" },
  { text: "Mock first. The first real call is the experiment.", where: "SchemaBench · built against a mock under a 50 request/day cap" },
  { text: "Don’t call an outage a failure.", where: "SchemaBench · 502s are excluded from every schema metric" },
  { text: "Say where the idea came from.", where: "Inferbench · the diagnosis replicates prior work; the fix is new" },
  { text: "Decline the fight you’d lose.", where: "Inferbench · batch 1 stays on cuBLAS, where it’s already at 85%" },
];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "What do you want to work on?",
    a: "Software engineering, full stack or backend, ideally on a product with machine learning in it.",
  },
  {
    q: "Why should I believe your numbers?",
    a: "Every figure on this site traces to a public repo, and the repos keep the controls, the failed runs and the caveats. Pick one and check.",
  },
  {
    q: "What are you bad at?",
    a: "Generalising past the machine in front of me. Inferbench is tuned for one model on one GPU, and I can’t yet tell you whether it holds on a GTX 1660.",
  },
  {
    q: "Is that 0.99 ROC-AUC real?",
    a: "On synthetic data, yes. Synthetic fraud is more separable than real fraud, and the Argus README says so in the same breath as the number.",
  },
  {
    q: "Where are you now?",
    a: "MLOps engineer at Agneyas Labs in Bengaluru since July 2026, building an internal AutoML platform and a hybrid battery digital twin.",
  },
  {
    q: "What’s the fun mode?",
    a: "A small operating system with a terminal, an arcade and a cinema. Recruiters can skip it. Everyone else shouldn’t.",
  },
];
