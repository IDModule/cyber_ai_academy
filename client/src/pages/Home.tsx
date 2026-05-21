import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Shield, Lock, AlertTriangle, Zap, Award, Brain, ChevronLeft, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-lg font-bold">أكاديمية سايبر</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  لوحة التحكم
                </Button>
                <Button variant="ghost" onClick={() => navigate("/gates")}>
                  الأبواب التعليمية
                </Button>
                <Button variant="default" onClick={() => navigate("/gates")}>
                  ابدأ التعلم
                </Button>
              </>
            ) : (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.location.href = getLoginUrl()}
              >
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">مدعومة بالذكاء الاصطناعي</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              تعلّم <span className="cyber-text-gradient">الأمن السيبراني</span>
              <br />
              بطريقة تفاعلية وممتعة
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              منصة تعليمية ذكية مصممة خصيصًا للشباب. تعلّم كيف تحمي نفسك في العالم الرقمي من خلال دروس تفاعلية، تمارين عملية، واختبارات مع مساعد ذكاء اصطناعي.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 cyber-glow"
                  onClick={() => navigate("/gates")}
                >
                  ابدأ رحلة التعلم
                  <ChevronLeft className="w-5 h-5 mr-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 cyber-glow"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  سجّل مجانًا وابدأ
                  <ChevronLeft className="w-5 h-5 mr-2" />
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                اكتشف المنصة
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">أبواب تعليمية</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">6</div>
                <div className="text-sm text-muted-foreground">دروس تفاعلية</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">AI</div>
                <div className="text-sm text-muted-foreground">مساعد ذكي</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا أكاديمية سايبر؟</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              منصة مبنية على أحدث نظريات التعلم والتصميم التعليمي لتجربة تعلم فعّالة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="ذكاء اصطناعي تفاعلي"
              description="مساعد ذكي يجيب على أسئلتك ويتكيف مع مستواك وعمرك"
              gradient="from-cyan-500/20 to-blue-500/20"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="محتوى حديث ومتخصص"
              description="دروس مبنية على أحدث مفاهيم الأمن السيبراني وتهديدات 2024"
              gradient="from-purple-500/20 to-indigo-500/20"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="تمارين تفاعلية"
              description="سيناريوهات واقعية وأسئلة متنوعة لتطبيق ما تعلمته"
              gradient="from-amber-500/20 to-orange-500/20"
            />
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="شهادات معتمدة"
              description="احصل على شهادة إتمام مخصصة باسمك عند إكمال كل باب"
              gradient="from-green-500/20 to-emerald-500/20"
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8" />}
              title="تعلم تدريجي"
              description="مسار تعليمي مُنظّم من الأساسيات إلى المفاهيم المتقدمة"
              gradient="from-pink-500/20 to-rose-500/20"
            />
            <FeatureCard
              icon={<AlertTriangle className="w-8 h-8" />}
              title="شارات ومكافآت"
              description="نظام تحفيزي بشارات وإنجازات تشجعك على الاستمرار"
              gradient="from-red-500/20 to-orange-500/20"
            />
          </div>
        </div>
      </section>

      {/* Gates Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">الأبواب التعليمية</h2>
            <p className="text-muted-foreground text-lg">
              ثلاثة أبواب متدرجة تأخذك من المبتدئ إلى المحترف
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <GatePreview
              number={1}
              title="المفاهيم الأساسية"
              description="تعرّف على أساسيات الأمن السيبراني وأهميته"
              icon={<Shield className="w-10 h-10" />}
              color="from-cyan-500 to-blue-600"
            />
            <GatePreview
              number={2}
              title="الحماية الرقمية"
              description="أدوات وتقنيات حماية نفسك في العالم الرقمي"
              icon={<Lock className="w-10 h-10" />}
              color="from-purple-500 to-indigo-600"
            />
            <GatePreview
              number={3}
              title="التهديدات المتقدمة"
              description="تعرّف على التهديدات المتقدمة وكيفية التصدي لها"
              icon={<AlertTriangle className="w-10 h-10" />}
              color="from-red-500 to-orange-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center cyber-card cyber-glow p-12">
            <h2 className="text-3xl font-bold mb-4">مستعد لتصبح خبيرًا في الأمن السيبراني؟</h2>
            <p className="text-muted-foreground text-lg mb-8">
              انضم الآن وابدأ رحلتك في عالم الأمن السيبراني. المنصة مجانية بالكامل!
            </p>
            {isAuthenticated ? (
              <Button
                size="lg"
                className="text-lg px-8 bg-primary text-primary-foreground"
                onClick={() => navigate("/gates")}
              >
                ابدأ التعلم الآن
              </Button>
            ) : (
              <Button
                size="lg"
                className="text-lg px-8 bg-primary text-primary-foreground"
                onClick={() => window.location.href = getLoginUrl()}
              >
                سجّل مجانًا
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">أكاديمية سايبر الذكية</span>
          </div>
          <p className="text-sm">منصة تعلم الأمن السيبراني التفاعلية للشباب</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className="cyber-card group">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function GatePreview({ number, title, description, icon, color }: { number: number; title: string; description: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="cyber-card relative overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-l ${color}`} />
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">الباب {number}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      <div className="mt-4 text-sm text-muted-foreground">
        درسان تفاعليان + تمارين + اختبار
      </div>
    </div>
  );
}
