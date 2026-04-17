export default function Marquee() {
  const items = [
    "TIME SERIES",
    "FORECASTING",
    "XGBOOST",
    "LIGHTGBM",
    "PYTORCH",
    "FEATURE ENGINEERING",
    "MLOPS",
    "REGRESSION",
    "PANDAS",
    "GO · REDIS · DOCKER",
    "$1B+ REVENUE PREDICTED",
    "6–10% MAPE",
  ];
  const line = items.concat(items);
  return (
    <div className="relative border-y border-[color:var(--rule)] overflow-hidden py-6 md:py-8">
      <div className="flex whitespace-nowrap marquee-track will-change-transform">
        {line.map((t, i) => (
          <span
            key={i}
            className="display-italic text-3xl md:text-5xl px-8 text-[color:var(--fg)]"
          >
            {t}{" "}
            <span className="text-[color:var(--fg-mute)] not-italic mx-4">
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
