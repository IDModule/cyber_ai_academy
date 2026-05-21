import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Shield, Lock, AlertTriangle, ChevronLeft, BookOpen, ClipboardCheck, Award, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const GATE_ICONS: Record<string, React.ReactNode> = {
  Shield: <Shield className="w-8 h-8" />,
  Lock: <Lock className="w-8 h-8" />,
  AlertTriangle: <AlertTriangle className="w-8 h-8" />,
};

export default function Gates() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: gates, isLoading } = trpc.course.gates.useQuery();
  const { data: progress } = trpc.progress.get.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <div className="text-center cyber-card p-12 max-w-md">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">سجّل الدخول للمتابعة</h2>
          <p className="text-muted-foreground mb-6">يجب تسجيل الدخول للوصول إلى المحتوى التعليمي</p>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => window.location.href = getLoginUrl()}
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  const getGateProgress = (gateId: string, lessons: any[]) => {
    if (!progress) return 0;
    const gateLessons = progress.filter(p => p.gateId === gateId && p.completed);
    return Math.round((gateLessons.length / lessons.length) * 100);
  };

  const isLessonCompleted = (lessonId: string) => {
    if (!progress) return false;
    return progress.some(p => p.lessonId === lessonId && p.completed);
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowRight className="w-4 h-4 ml-1" />
              الرئيسية
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              لوحة التحكم
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/certificates")}>
              شهاداتي
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">الأبواب التعليمية</h1>
            <p className="text-muted-foreground text-lg">
              اختر بابًا لبدء رحلة التعلم. أكمل الدروس والتمارين ثم اجتز الاختبار للحصول على الشهادة.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="cyber-card animate-pulse h-48" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8">
              {gates?.map((gate, index) => {
                const progressPercent = getGateProgress(gate.id, gate.lessons);
                return (
                  <div key={gate.id} className="cyber-card relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-l ${gate.color}`} />
                    
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      {/* Gate icon & info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gate.color} flex items-center justify-center text-white shrink-0`}>
                          {GATE_ICONS[gate.icon] || <Shield className="w-8 h-8" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground mb-1">الباب {index + 1}</div>
                          <h2 className="text-xl font-bold mb-2">{gate.title}</h2>
                          <p className="text-muted-foreground mb-4">{gate.description}</p>
                          
                          {/* Progress bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">التقدم</span>
                              <span className="text-primary font-medium">{progressPercent}%</span>
                            </div>
                            <div className="progress-cyber">
                              <div className="progress-cyber-fill" style={{ width: `${progressPercent}%` }} />
                            </div>
                          </div>

                          {/* Lessons list */}
                          <div className="space-y-2">
                            {gate.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                                onClick={() => navigate(`/lesson/${lesson.id}`)}
                              >
                                <div className="flex items-center gap-3">
                                  <BookOpen className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">{lesson.title}</span>
                                  {isLessonCompleted(lesson.id) && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">مكتمل</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{lesson.duration}</span>
                                  <ChevronLeft className="w-3 h-3" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => navigate(`/exercises/${gate.lessons[0].id}`)}
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          التمارين
                        </Button>
                        <Button
                          size="sm"
                          className={`gap-2 bg-gradient-to-l ${gate.color} text-white border-0`}
                          onClick={() => navigate(`/exam/${gate.id}`)}
                        >
                          <Award className="w-4 h-4" />
                          الاختبار
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
