import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Shield, ArrowRight, Award, Star, Trophy, Zap, Target, Rocket, Crown,
  Bell, BookOpen, CheckCircle2, Clock, TrendingUp, MessageCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import AIChat from "@/components/AIChat";

const BADGE_ICONS: Record<string, React.ReactNode> = {
  Star: <Star className="w-6 h-6" />,
  Trophy: <Trophy className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Rocket: <Rocket className="w-6 h-6" />,
  Crown: <Crown className="w-6 h-6" />,
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showAI, setShowAI] = useState(false);

  const { data: progress } = trpc.progress.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: badges } = trpc.badges.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: certificates } = trpc.certificates.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: notifications } = trpc.notifications.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: gates } = trpc.course.gates.useQuery();

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      // Refetch notifications
    }
  });

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

  const completedLessons = progress?.filter(p => p.completed).length || 0;
  const totalLessons = 6;
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);
  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => markAllRead.mutate()}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAI(!showAI)}>
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-5xl mx-auto">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              مرحبًا، {user?.name || "متعلم"}!
            </h1>
            <p className="text-muted-foreground">تابع تقدمك في رحلة تعلم الأمن السيبراني</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<BookOpen className="w-5 h-5 text-cyan-400" />}
              label="الدروس المكتملة"
              value={`${completedLessons}/${totalLessons}`}
              color="cyan"
            />
            <StatCard
              icon={<Award className="w-5 h-5 text-purple-400" />}
              label="الشهادات"
              value={String(certificates?.length || 0)}
              color="purple"
            />
            <StatCard
              icon={<Star className="w-5 h-5 text-amber-400" />}
              label="الشارات"
              value={String(badges?.length || 0)}
              color="amber"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-green-400" />}
              label="التقدم العام"
              value={`${overallProgress}%`}
              color="green"
            />
          </div>

          {/* Overall progress */}
          <div className="cyber-card mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              التقدم العام
            </h2>
            <div className="progress-cyber mb-2">
              <div className="progress-cyber-fill" style={{ width: `${overallProgress}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              أكملت {completedLessons} من {totalLessons} دروس
            </p>

            {/* Per-gate progress */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {gates?.map((gate, idx) => {
                const gateProgress = progress?.filter(p => p.gateId === gate.id && p.completed).length || 0;
                const gatePercent = Math.round((gateProgress / gate.lessonsCount) * 100);
                return (
                  <div key={gate.id} className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">الباب {idx + 1}</span>
                    </div>
                    <h4 className="text-sm font-bold mb-2 truncate">{gate.title}</h4>
                    <div className="progress-cyber h-2 mb-1">
                      <div className="progress-cyber-fill" style={{ width: `${gatePercent}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{gatePercent}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Badges */}
            <div className="cyber-card">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                الشارات والإنجازات
              </h2>
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge) => (
                    <div key={badge.id} className="bg-secondary/50 rounded-lg p-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2 text-amber-400">
                        {BADGE_ICONS[badge.badgeType.includes("gate_complete") ? "Trophy" : badge.badgeType === "first_lesson" ? "Star" : badge.badgeType === "perfect_score" ? "Zap" : badge.badgeType === "all_exercises" ? "Target" : badge.badgeType === "speed_learner" ? "Rocket" : "Crown"] || <Star className="w-6 h-6" />}
                      </div>
                      <h4 className="text-xs font-bold">{badge.badgeName}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">لم تحصل على شارات بعد. أكمل الدروس لكسب الشارات!</p>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="cyber-card">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                الإشعارات
              </h2>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 10).map((notif) => (
                    <div key={notif.id} className={`p-3 rounded-lg border text-sm ${
                      notif.read ? "bg-secondary/30 border-border" : "bg-primary/5 border-primary/20"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {notif.type === "gate_complete" && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                        {notif.type === "badge_earned" && <Star className="w-3 h-3 text-amber-400" />}
                        {notif.type === "reminder" && <Clock className="w-3 h-3 text-blue-400" />}
                        <span className="font-bold text-xs">{notif.title}</span>
                      </div>
                      <p className="text-muted-foreground text-xs">{notif.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">لا توجد إشعارات حاليًا</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button onClick={() => navigate("/gates")} className="gap-2">
              <BookOpen className="w-4 h-4" />
              متابعة التعلم
            </Button>
            <Button variant="outline" onClick={() => navigate("/certificates")} className="gap-2">
              <Award className="w-4 h-4" />
              شهاداتي
            </Button>
          </div>
        </div>
      </div>

      {showAI && <AIChat onClose={() => setShowAI(false)} />}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="cyber-card p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
