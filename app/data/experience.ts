export interface Role {
  company: string;
  title: string;
  location: string;
  from: string;
  to: string;
  points: string[];
  stack: string[];
  /** Pulled out for the timeline's readout column. Every figure below appears
   *  verbatim in one of the bullet points — nothing new is asserted here. */
  metrics?: { value: string; label: string }[];
}

export const roles: Role[] = [
  {
    company: "Agneyas Labs",
    title: "Machine Learning Ops Engineer",
    location: "Bengaluru",
    from: "2026",
    to: "Present",
    points: [
      "Built and deployed an internal AutoML platform (Angular, Flask) that trains and benchmarks multiple algorithms per dataset, surfaces the strongest performer, and lets users run predictions and persist both models and results — in use by an internal team of 10–12.",
      "Developing a hybrid battery digital twin on proprietary EV cycling data: an equivalent-circuit model constrains known physics (terminal voltage, internal resistance, capacity fade) while a learned residual network absorbs nonlinear aging, cell-to-cell variance, and thermal effects.",
    ],
    stack: ["Angular", "Flask", "Python"],
    metrics: [{ value: "10–12", label: "Daily internal users" }],
  },
  {
    company: "NetApp",
    title: "Machine Learning Intern",
    location: "Bengaluru",
    from: "2025",
    to: "2026",
    points: [
      "Built a one-click forecasting pipeline supporting $150M+ in quarterly revenue planning across 1.5M+ records.",
      "Lifted commission forecast accuracy 15% for 4,900+ sales reps with XGBoost ensembles — MAPE down to 6–10% on 60+ engineered features.",
      "Added cold-start logic, quantile forecasts, and scenario modelling while cutting the end-to-end run from 8 hours to 2.",
    ],
    stack: ["Python", "XGBoost", "Time series", "Batch ML"],
    metrics: [
      { value: "$150M+", label: "Quarterly planning supported" },
      { value: "+15%", label: "Forecast accuracy" },
      { value: "8h → 2h", label: "Pipeline runtime" },
    ],
  },
];
