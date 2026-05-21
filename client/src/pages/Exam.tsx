import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Shield, ArrowRight, CheckCircle2, XCircle, Award, RotateCcw, ChevronLeft, Clock, AlertTriangle } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { Streamdown } from "streamdown";

export default function Exam() {
  const { gateId } = useParams<{ gateId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [feedback, setFeedback] = useState("");

  const { data: exam } = trpc.course.gateExam.useQuery(
    { gateId: gateId || "" },
    { enabled: !!gateId }
  );

  const submitMutation = trpc.exams.submit.useMutation({
    onSuccess: (data) => {
      setFeedback(data.feedback);
      setShowResult(true);
    }
  });

  // Timer
  useEffect(() => {
    if (!started || showResult) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, showResult]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center cyber-card p-12">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <Button onClick={() => window.location.href = getLoginUrl()}>تسجيل الدخول</Button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4" />
          <div className="h-6 bg-muted rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  const questions = exam.questions;
  const totalQuestions = questions.length;

  const handleAnswer = (answer: number | boolean) => {
    setAnswers(prev => ({ ...prev, [questions[currentQ].id]: answer }));
  };

  const handleSubmit = () => {
    const score = Object.entries(answers).filter(([id, ans]) => {
      const q = questions.find(q => q.id === id);
      return q && ans === q.correctAnswer;
    }).length;
    const passed = score >= Math.ceil(totalQuestions * 0.7);
    submitMutation.mutate({
      gateId: gateId!,
      answers,
      score,
      totalQuestions,
      passed,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
        <div className="cyber-card max-w-lg w-full text-center p-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">اختبار: {exam.gateTitle}</h1>
          <p className="text-muted-foreground mb-6">
            اختبار تقييمي لقياس مدى استيعابك لمحتوى هذا الباب
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-muted-foreground">عدد الأسئلة</div>
              <div className="font-bold text-lg">{totalQuestions}</div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-muted-foreground">المدة</div>
              <div className="font-bold text-lg">10 دقائق</div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-muted-foreground">درجة النجاح</div>
              <div className="font-bold text-lg">70%</div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-muted-foreground">المحاولات</div>
              <div className="font-bold text-lg">غير محدودة</div>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6 text-sm text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>عند النجاح ستحصل على شهادة إتمام لهذا الباب. تأكد من مراجعة الدروس قبل البدء.</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/gates")} className="flex-1">
              العودة
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground"
              onClick={() => setStarted(true)}
            >
              ابدأ الاختبار
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (showResult) {
    const score = Object.entries(answers).filter(([id, ans]) => {
      const q = questions.find(q => q.id === id);
      return q && ans === q.correctAnswer;
    }).length;
    const passed = score >= Math.ceil(totalQuestions * 0.7);

    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
        <div className="cyber-card max-w-lg w-full text-center p-8">
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            passed ? "bg-green-500/20" : "bg-red-500/20"
          }`}>
            {passed ? (
              <Award className="w-10 h-10 text-green-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {passed ? "مبارك! اجتزت الاختبار" : "لم تجتز الاختبار بعد"}
          </h2>
          <p className="text-4xl font-bold text-primary my-4">
            {score}/{totalQuestions}
          </p>
          <div className="progress-cyber mb-6">
            <div
              className="progress-cyber-fill"
              style={{ width: `${(score / totalQuestions) * 100}%` }}
            />
          </div>

          {/* AI Feedback */}
          {feedback && (
            <div className="bg-secondary rounded-xl p-4 mb-6 text-right text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs">تغذية راجعة من المساعد الذكي</span>
              </div>
              <Streamdown>{feedback}</Streamdown>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {passed && (
              <Button
                className="bg-primary text-primary-foreground gap-2"
                onClick={() => navigate("/certificates")}
              >
                <Award className="w-4 h-4" />
                عرض الشهادة
              </Button>
            )}
            {!passed && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setStarted(false);
                  setCurrentQ(0);
                  setAnswers({});
                  setShowResult(false);
                  setTimeLeft(600);
                  setFeedback("");
                }}
              >
                <RotateCcw className="w-4 h-4" />
                إعادة المحاولة
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate("/gates")}>
              العودة للأبواب
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Exam questions
  const currentQuestion = questions[currentQ];

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header with timer */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <span className="text-sm font-medium">اختبار: {exam.gateTitle}</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentQ + 1}/{totalQuestions}
            </span>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono ${
              timeLeft < 60 ? "bg-red-500/20 text-red-400" : "bg-secondary text-foreground"
            }`}>
              <Clock className="w-3 h-3" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Question navigation dots */}
          <div className="flex gap-1.5 justify-center mb-8 flex-wrap">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  idx === currentQ
                    ? "bg-primary text-primary-foreground scale-110"
                    : answers[questions[idx].id] !== undefined
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Question */}
          <div className="cyber-card mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 rounded text-xs ${
                currentQuestion.difficulty === "easy" ? "bg-green-500/20 text-green-400" :
                currentQuestion.difficulty === "medium" ? "bg-amber-500/20 text-amber-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {currentQuestion.difficulty === "easy" ? "سهل" : currentQuestion.difficulty === "medium" ? "متوسط" : "صعب"}
              </span>
            </div>
            <h3 className="text-lg font-bold mb-6 leading-relaxed">{currentQuestion.question}</h3>

            {currentQuestion.type === "truefalse" ? (
              <div className="grid grid-cols-2 gap-4">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => handleAnswer(val)}
                    className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                      answers[currentQuestion.id] === val
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {val ? "صحيح ✓" : "خطأ ✗"}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      answers[currentQuestion.id] === idx
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                      answers[currentQuestion.id] === idx ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground"
                    }`}>
                      {String.fromCharCode(1571 + idx)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ(prev => prev - 1)}
            >
              السابق
            </Button>
            <div className="flex gap-2">
              {currentQ < totalQuestions - 1 ? (
                <Button
                  className="bg-primary text-primary-foreground gap-2"
                  onClick={() => setCurrentQ(prev => prev + 1)}
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < totalQuestions || submitMutation.isPending}
                >
                  {submitMutation.isPending ? "جارٍ التصحيح..." : "تسليم الاختبار"}
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
