export interface Role {
  company: string;
  title: string;
  location: string;
  from: string;
  to: string;
  points: string[];
  stack: string[];
  /** Pulled out as callouts. Every figure appears in one of the points
   *  above it; nothing new is asserted here. */
  metrics?: { value: string; label: string }[];
}

export const roles: Role[] = [
  {
    company: "Agneyas Labs",
    title: "Machine Learning Ops Engineer",
    location: "Bengaluru",
    from: "Jul 2026",
    to: "Present",
    points: [
      "Built and deployed an internal AutoML platform (Angular, Flask) that trains and benchmarks multiple algorithms per dataset, surfaces the strongest, and persists models, predictions and results. In use by an internal team of 10–12.",
      "Developing a hybrid battery digital twin on proprietary EV cycling data: an equivalent-circuit model constrains the known physics (terminal voltage, internal resistance, capacity fade) while a learned residual network absorbs nonlinear aging, cell-to-cell variance and thermal effects.",
    ],
    stack: ["Python", "Flask", "Angular", "PyTorch"],
    metrics: [{ value: "10–12", label: "internal users" }],
  },
  {
    company: "NetApp",
    title: "Machine Learning Intern",
    location: "Bengaluru",
    from: "Jun 2025",
    to: "May 2026",
    points: [
      "Built and deployed a one-click forecasting pipeline for $150M+ in quarterly revenue planning over 1.5M+ records.",
      "Improved sales-commission forecast accuracy by 15% with an XGBoost ensemble, bringing MAPE to 6–10% for GTM financial accruals across 4,900+ sales representatives.",
      "Designed the preprocessing, training, validation and batch-inference workflow, cutting the end-to-end run from 6–8 hours to 2.",
    ],
    stack: ["Python", "XGBoost", "Time series", "Batch inference"],
    metrics: [
      { value: "$150M+", label: "quarterly planning" },
      { value: "+15%", label: "forecast accuracy" },
      { value: "6–8h → 2h", label: "pipeline runtime" },
    ],
  },
];

export const education = {
  school: "Manipal Institute of Technology",
  degree: "B.Tech, Computer Science and Engineering (AI & ML)",
  location: "Manipal",
  from: "Sep 2022",
  to: "Jul 2026",
  grade: "CGPA 8.22",
} as const;
