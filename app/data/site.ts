/** Who, what, where: the one place the site's identity lives. The layout's
 *  JSON-LD, the header and footer, /cv, the OG images, the terminal and the
 *  voice agent all read from here, so a title change is a one-line edit. */

export const site = {
  name: "Shrey Singh",
  title: "Software Engineer",
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
  tagline: "I build complete products, with machine learning inside them.",
  pitch:
    ",Building things that matter.",
  knowsAbout: [
    "Full-stack development",
    "React",
    "Next.js",
    "Node.js",
    "FastAPI",
    "PostgreSQL",
    "Redis",
    "Machine learning",
    "MLOps",
    "XGBoost",
    "time-series forecasting",
    "retrieval-augmented generation",
  ],
} as const;
