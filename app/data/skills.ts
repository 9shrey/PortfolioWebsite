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
    label: "ML / AI",
    note: "From Triton kernels under the model to the FastAPI service in front of it.",
    items: [
      "PyTorch",
      "Triton",
      "CUDA",
      "Scikit-learn",
      "XGBoost",
      "Stable-Baselines3",
      "SHAP",
      "FastAPI",
    ],
  },
  {
    label: "Data Science",
    note: "Feature work and evaluation design — where most of the real risk lives.",
    items: [
      "Pandas",
      "NumPy",
      "Feature Engineering",
      "Time-Series Forecasting",
      "Reinforcement Learning",
    ],
  },
  {
    label: "Tools / Platforms",
    note: "Whatever it takes to make a result reproducible by someone else.",
    items: ["Docker", "Git", "Linux", "MLflow", "CI/CD", "GitHub", "Vercel"],
  },
];
