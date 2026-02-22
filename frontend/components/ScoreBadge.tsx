interface Props {
  score: number;
}

export default function ScoreBadge({ score }: Props) {
  const color =
    score > 80
      ? "#34d399"
      : score > 60
      ? "#fbbf24"
      : "#f87171";

  return (
    <div
      className="px-3 py-1.5 rounded text-xs font-semibold"
      style={{
        color,
        background: `${color}1a`,
        border: `1px solid ${color}40`,
        minWidth: "44px",
        textAlign: "center",
      }}
    >
      {score}
    </div>
  );
}