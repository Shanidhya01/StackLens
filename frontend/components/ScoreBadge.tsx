interface Props {
  score: number;
}

export default function ScoreBadge({ score }: Props) {
  const color =
    score > 80
      ? "bg-green-500"
      : score > 60
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className={`text-white px-4 py-2 rounded ${color}`}>
      {score}
    </div>
  );
}