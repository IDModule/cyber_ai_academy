import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Shield, ArrowRight, ChevronLeft, ChevronRight, BookOpen, Lightbulb, AlertTriangle, Code, CheckCircle2, MessageCircle } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import AIChat from "@/components/AIChat";

const CONTENT_ICONS: Record<string, React.ReactNode> = {
  text: <BookOpen className="w-5 h-5" />,
  tip: <Lightbulb className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  example: <Code className="w-5 h-5" />,
  interactive: <MessageCircle className="w-5 h-5" />,
};

const CONTENT_STYLES: Record<string, string> = {
  text: "border-border",
  tip: "border-green-500/30 bg-green-500/5",
  warning: "border-red-500/30 bg-red-500/5",
  example: "border-amber-500/30 bg-amber-500/5",
  interactive: "border-purple-500/30 bg-purple-500/5",
};

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [showAI, setShowAI] = useState(false);

  const { data: lesson, isLoading } = trpc.course.lesson.useQuery(
    { lessonId: lessonId || "" },
    { enabled: !!lessonId }
  );

  const progressMutation = trpc.progress.update.useMutation();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4" />
          <div className="h-6 bg-muted rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">الدرس غير موجود</h2>
          <Button onClick={() => navigate("/gates")}>العودة للأبواب</Button>
        </div>
      </div>
    );
  }

  const totalSections = lesson.content.length;
  const isLastSection = currentSection === totalSections - 1;

  const handleComplete = () => {
    progressMutation.mutate({
      lessonId: lesson.id,
      gateId: lesson.gateId,
      completed: true,
      score: 100,
    });
    navigate(`/exercises/${lesson.id}`);
  };

  const currentContent = lesson.content[currentSection];

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/gates")}>
              <ArrowRight className="w-4 h-4 ml-1" />
              الأبواب
            </Button>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">{lesson.gateTitle}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowAI(!showAI)}
          >
            <MessageCircle className="w-4 h-4" />
            المساعد الذكي
          </Button>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Lesson header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-muted-foreground">{lesson.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>المدة: {lesson.duration}</span>
              <span>|</span>
              <span>القسم {currentSection + 1} من {totalSections}</span>
            </div>
            {/* Progress */}
            <div className="mt-4 progress-cyber">
              <div
                className="progress-cyber-fill"
                style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
              />
            </div>
          </div>

          {/* Objectives */}
          {currentSection === 0 && (
            <div className="cyber-card mb-6 border-primary/30">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                أهداف الدرس
              </h3>
              <ul className="space-y-2">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1">●</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content section */}
          <div className={`cyber-card ${CONTENT_STYLES[currentContent.type]} mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-primary">
                {CONTENT_ICONS[currentContent.type]}
              </div>
              {currentContent.title && (
                <h3 className="text-lg font-bold">{currentContent.title}</h3>
              )}
            </div>
            <div className="text-foreground/90 leading-relaxed whitespace-pre-line text-base">
              {currentContent.body}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              disabled={currentSection === 0}
              onClick={() => setCurrentSection(prev => prev - 1)}
              className="gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>

            {isLastSection ? (
              <Button
                className="gap-2 bg-primary text-primary-foreground"
                onClick={handleComplete}
              >
                إكمال الدرس والانتقال للتمارين
                <ChevronLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="gap-2 bg-primary text-primary-foreground"
                onClick={() => setCurrentSection(prev => prev + 1)}
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* AI Chat */}
      {showAI && (
        <AIChat
          context={`الدرس الحالي: ${lesson.title} - ${currentContent.title || ""}`}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}
