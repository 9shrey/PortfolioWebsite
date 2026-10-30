export interface SkillGroup {
  label: string;
  /** Short line describing where this group actually gets used, drawn from the
   *  projects and roles already on the site. */
  note: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "Languages",
    note: "Python for everything modelling; TypeScript for the surfaces on top.",
    items: [
      "Python",
      "SQL",
      "C",
      "C++",
      "Java",
      "Go",
      "JavaScript",
      "TypeScript",
      "HTML",
      "CSS",
    ],
  },
  {
    label: "Web / Backend",
    note: "The product around the model: dashboards, APIs, queues and live updates.",
    items: [
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "FastAPI",
      "Flask",
      "Angular",
      "REST APIs",
      "WebSockets",
    ],
  },
  {
    label: "ML / AI",
    note: "From Triton kernels under the model to retrieval and explanations on top of it.",
    items: [
      "PyTorch",
      "Triton",
      "CUDA",
      "Scikit-learn",
      "XGBoost",
      "SHAP",
      "Stable-Baselines3",
      "LangChain",
      "RAG",
      "Pandas",
      "NumPy",
    ],
  },
  {
    label: "Data Science",
    note: "Feature work and evaluation design — where most of the real risk lives.",
    items: [
      "Time-Series Forecasting",
      "Reinforcement Learning",
      "Feature Engineering",
      "Anomaly Detection",
    ],
  },
  {
    label: "Databases / Tools",
    note: "Whatever it takes to make a result reproducible by someone else.",
    items: [
      "PostgreSQL",
      "SQLite",
      "Redis",
      "Docker",
      "Git",
      "Linux",
      "MLflow",
      "CI/CD",
      "Vercel",
    ],
  },
];
