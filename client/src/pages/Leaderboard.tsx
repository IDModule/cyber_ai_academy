import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Shield, ArrowRight, Trophy, Medal, Crown, Star, Award,
  Users, TrendingUp, Flame, Home, BookOpen
} from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const RANK_STYLES = [
  { bg: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/50", icon: <Crown className="w-6 h-6 text-yellow-400" />, label: "المركز الأول" },
  { bg: "from-slate-300/20 to-slate-400/10", border: "border-slate-400/50", icon: <Medal className="w-6 h-6 text-slate-300" />, label: "المركز الثاني" },
  { bg: "from-orange-600/20 to-orange-700/10", border: "border-orange-600/50", icon: <Medal className="w-6 h-6 text-orange-500" />, label: "المركز الثالث" },
];

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: leaderboard, isLoading } = trpc.leaderboard.get.useQuery();

  const currentUserRank = leaderboard?.findIndex(l => l.userId === user?.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-bold text-lg">أكاديمية سايبر</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 ml-1" />
              الرئيسية
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/gates")}>
              الأبواب
            </Button>
            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                لوحتي
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">لوحة الصدارة</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            أبطال <span className="cyber-text-gradient">الأمن السيبراني</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            تنافس مع زملائك واحصل على أعلى النقاط من خلال إكمال الدروس والتمارين والاختبارات
          </p>
        </div>

        {/* Score System Info */}
        <div className="cyber-card p-4 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm">نظام النقاط</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-xl font-bold text-primary">+10</div>
              <div className="text-xs text-muted-foreground">لكل درس مكتمل</div>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-xl font-bold text-primary">+25</div>
              <div className="text-xs text-muted-foreground">لكل شارة</div>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-xl font-bold text-primary">+50</div>
              <div className="text-xs text-muted-foreground">لكل اختبار ناجح</div>
            </div>
          </div>
        </div>

        {/* Current User Rank */}
        {isAuthenticated && currentUserRank !== undefined && currentUserRank >= 0 && (
          <div className="cyber-card p-4 mb-6 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ترتيبك الحالي</p>
                  <p className="font-bold text-lg">المركز #{currentUserRank + 1}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">نقاطك</p>
                <p className="font-bold text-lg text-primary">
                  {leaderboard?.[currentUserRank]?.totalScore || 0} نقطة
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="cyber-card p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!leaderboard || leaderboard.length === 0) && (
          <div className="text-center py-16 cyber-card">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لا يوجد متعلمون بعد</h3>
            <p className="text-muted-foreground mb-6">
              كن أول من يتصدر لوحة الصدارة! ابدأ التعلم الآن.
            </p>
            <Button onClick={() => navigate("/gates")} className="gap-2">
              ابدأ التعلم
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        )}

        {/* Leaderboard List */}
        {!isLoading && leaderboard && leaderboard.length > 0 && (
          <div className="space-y-3">
            {/* Top 3 - Special Cards */}
            {leaderboard.slice(0, 3).map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`cyber-card p-5 border ${RANK_STYLES[index].border} bg-gradient-to-l ${RANK_STYLES[index].bg} ${entry.userId === user?.id ? 'ring-2 ring-primary/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex flex-col items-center min-w-[48px]">
                    {RANK_STYLES[index].icon}
                    <span className="text-xs mt-1 text-muted-foreground">{RANK_STYLES[index].label}</span>
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                    <span className="text-lg font-bold text-primary">
                      {entry.name.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-bold text-base">
                      {entry.name}
                      {entry.userId === user?.id && (
                        <span className="text-xs text-primary mr-2">(أنت)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {entry.completedLessons} درس
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {entry.badgesCount} شارة
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {entry.passedExams} اختبار
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-primary" />
                      <span className="text-xl font-bold text-primary">{entry.totalScore}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">نقطة</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Rest of leaderboard */}
            {leaderboard.slice(3).map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 3) * 0.05, duration: 0.2 }}
                className={`cyber-card p-4 ${entry.userId === user?.id ? 'border-primary/40 bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Number */}
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <span className="font-bold text-sm text-muted-foreground">#{index + 4}</span>
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="font-medium text-primary">
                      {entry.name.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {entry.name}
                      {entry.userId === user?.id && (
                        <span className="text-xs text-primary mr-2">(أنت)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{entry.completedLessons} درس</span>
                      <span>{entry.badgesCount} شارة</span>
                      <span>{entry.passedExams} اختبار</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-left">
                    <span className="font-bold text-primary">{entry.totalScore}</span>
                    <span className="text-xs text-muted-foreground mr-1">نقطة</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA for non-authenticated */}
        {!isAuthenticated && (
          <div className="mt-10 text-center cyber-card p-8">
            <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">انضم للمنافسة!</h3>
            <p className="text-muted-foreground mb-4">
              سجّل الآن وابدأ التعلم لتظهر في لوحة الصدارة
            </p>
            <Button onClick={() => window.location.href = getLoginUrl()} className="gap-2">
              سجّل مجانًا
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
