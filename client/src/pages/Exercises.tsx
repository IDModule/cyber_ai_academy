import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Shield, ArrowRight, CheckCircle2, XCircle, ChevronLeft, RotateCcw, Award } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useMemo } from "react";

export default function Exercises() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const { data: lesson } = trpc.course.lesson.useQuery(
    { lessonId: lessonId || "" },
    { enabled: !!lessonId }
  );

  const submitMutation = trpc.exercises.submit.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center cyber-card p-12">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">سجّل الدخول</h2>
          <Button onClick={() => window.location.href = getLoginUrl()}>تسجيل الدخول</Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4" />
          <div className="h-6 bg-muted rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  const exercises = lesson.exercises;
  const totalQuestions = exercises.length;
  const currentExercise = exercises[currentQ];

  const handleAnswer = (answer: number | boolean) => {
    setSelectedAnswer(answer);
    const correct = answer === currentExercise.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
    setAnswers(prev => ({ ...prev, [currentExercise.id]: answer }));
  };

  const handleNext = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (currentQ < totalQuestions - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      // Calculate score
      const score = Object.entries(answers).filter(([id, ans]) => {
        const ex = exercises.find(e => e.id === id);
        return ex && ans === ex.correctAnswer;
      }).length + (isCorrect ? 1 : 0);
      
      const passed = score >= Math.ceil(totalQuestions * 0.6);
      submitMutation.mutate({
        lessonId: lesson.id,
        exerciseId: `${lesson.id}-exercises`,
        answers,
        score,
        totalQuestions,
        passed,
      });
      setShowResult(true);
    }
  };

  const score = useMemo(() => {
    if (!showResult) return 0;
    return Object.entries(answers).filter(([id, ans]) => {
      const ex = exercises.find(e => e.id === id);
      return ex && ans === ex.correctAnswer;
    }).length;
  }, [showResult, answers, exercises]);

  const handleRetry = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  if (showResult) {
    const passed = score >= Math.ceil(totalQuestions * 0.6);
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
        <div className="cyber-card max-w-md w-full text-center p-8">
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            passed ? "bg-green-500/20" : "bg-red-500/20"
          }`}>
            {passed ? (
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {passed ? "أحسنت!" : "حاول مرة أخرى"}
          </h2>
          <p className="text-muted-foreground mb-4">
            حصلت على {score} من {totalQuestions}
          </p>
          <div className="progress-cyber mb-6">
            <div
              className="progress-cyber-fill"
              style={{ width: `${(score / totalQuestions) * 100}%` }}
            />
          </div>
          <div className="flex flex-col gap-3">
            {!passed && (
              <Button variant="outline" onClick={handleRetry} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                إعادة المحاولة
              </Button>
            )}
            <Button
              className="bg-primary text-primary-foreground gap-2"
              onClick={() => navigate(`/exam/${lesson.gateId}`)}
            >
              <Award className="w-4 h-4" />
              الانتقال للاختبار
            </Button>
            <Button variant="ghost" onClick={() => navigate("/gates")}>
              العودة للأبواب
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/lesson/${lessonId}`)}>
            <ArrowRight className="w-4 h-4 ml-1" />
            العودة للدرس
          </Button>
          <span className="text-sm text-muted-foreground">
            السؤال {currentQ + 1} من {totalQuestions}
          </span>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">تمارين: {lesson.title}</span>
              <span className="text-primary">{currentQ + 1}/{totalQuestions}</span>
            </div>
            <div className="progress-cyber">
              <div className="progress-cyber-fill" style={{ width: `${((currentQ + 1) / totalQuestions) * 100}%` }} />
            </div>
          </div>

          {/* Question */}
          <div className="cyber-card mb-6">
            {currentExercise.scenario && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-4 text-sm text-muted-foreground italic">
                {currentExercise.scenario}
              </div>
            )}
            <div className="flex items-start gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                {currentQ + 1}
              </span>
              <h3 className="text-lg font-bold leading-relaxed">{currentExercise.question}</h3>
            </div>

            {/* Options */}
            {currentExercise.type === "truefalse" ? (
              <div className="grid grid-cols-2 gap-4">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    disabled={showExplanation}
                    onClick={() => handleAnswer(val)}
                    className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                      showExplanation
                        ? val === currentExercise.correctAnswer
                          ? "border-green-500 bg-green-500/10 text-green-400"
                          : selectedAnswer === val
                            ? "border-red-500 bg-red-500/10 text-red-400"
                            : "border-border opacity-50"
                        : selectedAnswer === val
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {val ? "صحيح ✓" : "خطأ ✗"}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {currentExercise.options?.map((option, idx) => (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      showExplanation
                        ? idx === currentExercise.correctAnswer
                          ? "border-green-500 bg-green-500/10"
                          : selectedAnswer === idx
                            ? "border-red-500 bg-red-500/10"
                            : "border-border opacity-50"
                        : selectedAnswer === idx
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                      showExplanation && idx === currentExercise.correctAnswer
                        ? "border-green-500 text-green-400"
                        : showExplanation && selectedAnswer === idx
                          ? "border-red-500 text-red-400"
                          : "border-muted-foreground/30 text-muted-foreground"
                    }`}>
                      {String.fromCharCode(1571 + idx)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showExplanation && idx === currentExercise.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    )}
                    {showExplanation && selectedAnswer === idx && idx !== currentExercise.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className={`cyber-card mb-6 ${isCorrect ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-400" />
                )}
                <span className="font-bold">
                  {isCorrect ? "إجابة صحيحة!" : "إجابة خاطئة"}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{currentExercise.explanation}</p>
            </div>
          )}

          {/* Next button */}
          {showExplanation && (
            <div className="flex justify-end">
              <Button
                className="bg-primary text-primary-foreground gap-2"
                onClick={handleNext}
              >
                {currentQ < totalQuestions - 1 ? "السؤال التالي" : "عرض النتيجة"}
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
