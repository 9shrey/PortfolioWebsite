/** Who, what, where: the one place the site's identity lives. The layout's
 *  JSON-LD, the header and footer, /cv, the OG images, the terminal and the
 *  voice agent all read from here, so a title change is a one-line edit. */

export const site = {
  name: "Shrey Singh",
  title: "ML Systems Engineer",
  location: "Bengaluru, India",
  url: "https://9shrey.vercel.app",
  email: "9shrey@gmail.com",
  resume: "/Shrey_Singh_Resume.pdf",
  links: {
    github: "https://github.com/9shrey",
    linkedin: "https://linkedin.com/in/9shrey",
  },
  /** The first sentence a recruiter reads. Every number in it is measured
   *  and appears in a case study or role below. */
  tagline: "I make models fast and measurable.",
  pitch:
    "A Triton kernel that took batched LLM decode from 87 to 451 tok/s, a benchmark that grades structured-output contracts without an LLM judge, and forecasting pipelines behind $150M+ in quarterly planning at NetApp.",
  knowsAbout: [
    "GPU kernels",
    "Triton",
    "CUDA",
    "LLM inference",
    "LLM evaluation",
    "MLOps",
    "PyTorch",
    "XGBoost",
    "time-series forecasting",
  ],
} as const;
