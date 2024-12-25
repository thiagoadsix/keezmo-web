import { Check, X } from "lucide-react";

type QuestionOptionProps = {
  option: string;
  isCorrect: boolean;
  isSelected: boolean;
  isAnswerConfirmed: boolean;
  onClick: () => void;
};

export function QuestionOption({
  option,
  isCorrect,
  isSelected,
  isAnswerConfirmed,
  onClick,
}: QuestionOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={isAnswerConfirmed}
      className={`p-4 rounded-lg text-left transition-colors flex flex-col items-start gap-2 ${
        isAnswerConfirmed
          ? isCorrect
            ? "bg-green-500/20 text-green-500"
            : isSelected
              ? "bg-red-500/20 text-red-500"
              : "bg-neutral-800/50 text-neutral-400"
          : isSelected
            ? "bg-white/10 border border-white/20"
            : "hover:bg-white/5 bg-neutral-800/30"
      }`}
    >
      {isAnswerConfirmed && isSelected && (
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <>
              <Check className="h-5 w-5 text-green-500" />
              <span>Resposta correta</span>
            </>
          ) : (
            <>
              <X className="h-5 w-5 text-red-500" />
              <span>Resposta incorreta</span>
            </>
          )}
        </div>
      )}
      {isAnswerConfirmed && isCorrect && !isSelected && (
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>Resposta correta</span>
        </div>
      )}
      <span>{option}</span>
    </button>
  );
}