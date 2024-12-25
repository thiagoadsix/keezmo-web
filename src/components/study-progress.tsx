type StudyProgressProps = {
  currentQuestion: number;
  totalQuestions: number;
};

export function StudyProgress({ currentQuestion, totalQuestions }: StudyProgressProps) {
  const remainingQuestions = totalQuestions - currentQuestion;

  return (
    <div className="flex items-center gap-2 border border-neutral-800 rounded-md bg-[#10111F] p-2">
      <div className="relative w-8 h-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="stroke-neutral-800 fill-none"
            cx="50"
            cy="50"
            r="45"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            className="stroke-primary fill-none"
            cx="50"
            cy="50"
            r="45"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={
              2 * Math.PI * 45 * (1 - currentQuestion / totalQuestions)
            }
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="50"
            className="fill-white text-xl font-medium"
            dominantBaseline="middle"
            textAnchor="middle"
          >
            {Math.round((currentQuestion / totalQuestions) * 100)}%
          </text>
        </svg>
      </div>
      <span className="text-sm">Faltam {remainingQuestions} questões</span>
    </div>
  );
}