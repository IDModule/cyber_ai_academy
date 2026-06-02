import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import {
  getUserProgress, upsertProgress,
  saveExerciseAttempt, getExerciseAttempts,
  saveExamAttempt, getExamAttempts,
  issueCertificate, getUserCertificates,
  awardBadge, getUserBadges,
  createNotification, getUserNotifications, markNotificationRead, markAllNotificationsRead,
  getLeaderboard
} from "./db";
import { GATES, BADGE_DEFINITIONS } from "../shared/courseData";
import { registerUser, loginUser, createSessionToken } from "./customAuth";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    register: publicProcedure.input(z.object({
      name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
      email: z.string().email("البريد الإلكتروني غير صالح"),
      password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    })).mutation(async ({ ctx, input }) => {
      const result = await registerUser(input.name, input.email, input.password);
      if (!result.success || !result.user) {
        return { success: false, error: result.error };
      }
      // Create session
      const token = await createSessionToken(result.user.id, result.user.openId || "", result.user.name || "");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
      return { success: true };
    }),
    login: publicProcedure.input(z.object({
      email: z.string().email("البريد الإلكتروني غير صالح"),
      password: z.string().min(1, "كلمة المرور مطلوبة"),
    })).mutation(async ({ ctx, input }) => {
      const result = await loginUser(input.email, input.password);
      if (!result.success || !result.user) {
        return { success: false, error: result.error };
      }
      // Create session
      const token = await createSessionToken(result.user.id, result.user.openId || "", result.user.name || "");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
      return { success: true };
    }),
  }),

  // Progress
  progress: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserProgress(ctx.user.id);
    }),
    update: protectedProcedure.input(z.object({
      lessonId: z.string(),
      gateId: z.string(),
      completed: z.boolean(),
      score: z.number().default(0),
    })).mutation(async ({ ctx, input }) => {
      await upsertProgress(ctx.user.id, input.lessonId, input.gateId, input.completed, input.score);
      if (input.completed) {
        const progress = await getUserProgress(ctx.user.id);
        const completedLessons = progress.filter(p => p.completed);
        if (completedLessons.length === 1) {
          const badge = BADGE_DEFINITIONS.find(b => b.type === "first_lesson")!;
          await awardBadge(ctx.user.id, badge.type, badge.name, badge.description);
          await createNotification(ctx.user.id, "badge_earned", "شارة جديدة!", `حصلت على شارة "${badge.name}" - ${badge.description}`);
        }
      }
      return { success: true };
    }),
  }),

  // Exercises
  exercises: router({
    submit: protectedProcedure.input(z.object({
      lessonId: z.string(),
      exerciseId: z.string(),
      answers: z.any(),
      score: z.number(),
      totalQuestions: z.number(),
      passed: z.boolean(),
    })).mutation(async ({ ctx, input }) => {
      await saveExerciseAttempt(ctx.user.id, input.lessonId, input.exerciseId, input.answers, input.score, input.totalQuestions, input.passed);
      if (input.passed) {
        const gate = GATES.find(g => g.lessons.some(l => l.id === input.lessonId));
        if (gate) {
          const allLessonIds = gate.lessons.map(l => l.id);
          let allPassed = true;
          for (const lid of allLessonIds) {
            const attempts = await getExerciseAttempts(ctx.user.id, lid);
            if (!attempts.some(a => a.passed)) {
              allPassed = false;
              break;
            }
          }
          if (allPassed) {
            const badge = BADGE_DEFINITIONS.find(b => b.type === "all_exercises")!;
            await awardBadge(ctx.user.id, badge.type, badge.name, badge.description);
            await createNotification(ctx.user.id, "badge_earned", "شارة جديدة!", `حصلت على شارة "${badge.name}"`);
          }
        }
      }
      return { success: true };
    }),
    getAttempts: protectedProcedure.input(z.object({
      lessonId: z.string(),
    })).query(async ({ ctx, input }) => {
      return getExerciseAttempts(ctx.user.id, input.lessonId);
    }),
  }),

  // Exams
  exams: router({
    submit: protectedProcedure.input(z.object({
      gateId: z.string(),
      answers: z.any(),
      score: z.number(),
      totalQuestions: z.number(),
      passed: z.boolean(),
    })).mutation(async ({ ctx, input }) => {
      let feedback = "";
      try {
        const gate = GATES.find(g => g.id === input.gateId);
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "أنت معلم أمن سيبراني ودود يخاطب طلابًا تتراوح أعمارهم بين 12 و21 سنة. قدم تغذية راجعة مختصرة ومشجعة باللغة العربية عن أداء الطالب في الاختبار. استخدم لغة بسيطة ومحفزة." },
            { role: "user", content: `الطالب أكمل اختبار "${gate?.title || input.gateId}" وحصل على ${input.score} من ${input.totalQuestions}. ${input.passed ? "نجح في الاختبار" : "لم ينجح بعد"}. قدم تغذية راجعة مختصرة (3-4 جمل) مع نصيحة.` }
          ]
        });
        const rawContent = response.choices[0]?.message?.content;
        feedback = typeof rawContent === 'string' ? rawContent : "";
      } catch (e) {
        feedback = input.passed
          ? "أحسنت! أداء رائع في هذا الاختبار. استمر في التعلم!"
          : "لا بأس، المحاولة هي أول خطوة للنجاح. راجع الدروس وحاول مرة أخرى!";
      }

      await saveExamAttempt(ctx.user.id, input.gateId, input.answers, input.score, input.totalQuestions, input.passed, feedback);

      if (input.passed) {
        if (input.score === input.totalQuestions) {
          const badge = BADGE_DEFINITIONS.find(b => b.type === "perfect_score")!;
          await awardBadge(ctx.user.id, badge.type, badge.name, badge.description);
          await createNotification(ctx.user.id, "badge_earned", "شارة جديدة!", `حصلت على شارة "${badge.name}" - درجة كاملة!`);
        }

        const gateBadge = BADGE_DEFINITIONS.find(b => b.type === "gate_complete")!;
        await awardBadge(ctx.user.id, `${gateBadge.type}_${input.gateId}`, gateBadge.name, gateBadge.description);

        const userName = ctx.user.name || "متعلم";
        const certNumber = await issueCertificate(ctx.user.id, input.gateId, "gate", userName);

        const gate = GATES.find(g => g.id === input.gateId);
        await createNotification(ctx.user.id, "gate_complete", "تهانينا!", `أكملت "${gate?.title}" بنجاح وحصلت على شهادة إتمام!`);

        const allGateIds = GATES.map(g => g.id);
        let allCompleted = true;
        for (const gid of allGateIds) {
          const attempts = await getExamAttempts(ctx.user.id, gid);
          if (!attempts.some(a => a.passed)) {
            allCompleted = false;
            break;
          }
        }
        if (allCompleted) {
          await issueCertificate(ctx.user.id, null, "platform", userName);
          const platformBadge = BADGE_DEFINITIONS.find(b => b.type === "platform_complete")!;
          await awardBadge(ctx.user.id, platformBadge.type, platformBadge.name, platformBadge.description);
          await createNotification(ctx.user.id, "gate_complete", "إنجاز عظيم!", "أكملت جميع الأبواب وحصلت على شهادة خبير الأمن السيبراني!");
        }
      }

      return { success: true, feedback, passed: input.passed };
    }),
    getAttempts: protectedProcedure.input(z.object({
      gateId: z.string(),
    })).query(async ({ ctx, input }) => {
      return getExamAttempts(ctx.user.id, input.gateId);
    }),
  }),

  // Certificates
  certificates: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserCertificates(ctx.user.id);
    }),
  }),

  // Badges
  badges: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserBadges(ctx.user.id);
    }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserNotifications(ctx.user.id);
    }),
    markRead: protectedProcedure.input(z.object({
      notificationId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      await markNotificationRead(input.notificationId, ctx.user.id);
      return { success: true };
    }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // AI Assistant
  aiAssistant: router({
    ask: protectedProcedure.input(z.object({
      question: z.string(),
      context: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `أنت "سايبر"، مساعد ذكي متخصص في الأمن السيبراني. تخاطب متعلمين تتراوح أعمارهم بين 12 و21 سنة.

قواعدك:
- استخدم لغة عربية بسيطة وواضحة
- قدم أمثلة من حياتهم اليومية (ألعاب، وسائل تواصل، دراسة)
- كن مشجعًا وإيجابيًا
- إذا كان السؤال خارج نطاق الأمن السيبراني، وجّه المتعلم بلطف للموضوع
- استخدم الرموز التعبيرية باعتدال لجعل الإجابة أكثر جاذبية
- اجعل إجاباتك مختصرة (3-5 جمل) ما لم يُطلب تفصيل أكثر
${input.context ? `\nالسياق الحالي: ${input.context}` : ""}`
            },
            { role: "user", content: input.question }
          ]
        });
        const aiContent = response.choices[0]?.message?.content;
        return { answer: typeof aiContent === 'string' ? aiContent : "عذرًا، لم أستطع الإجابة. حاول مرة أخرى!" };
      } catch (e) {
        return { answer: "عذرًا، حدث خطأ. يرجى المحاولة مرة أخرى لاحقًا." };
      }
    }),
  }),

  // Leaderboard (public)
  leaderboard: router({
    get: publicProcedure.query(async () => {
      return getLeaderboard();
    }),
  }),

  // Course data (public)
  course: router({
    gates: publicProcedure.query(() => {
      return GATES.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        icon: g.icon,
        color: g.color,
        lessonsCount: g.lessons.length,
        lessons: g.lessons.map(l => ({
          id: l.id,
          title: l.title,
          description: l.description,
          duration: l.duration,
        }))
      }));
    }),
    lesson: publicProcedure.input(z.object({
      lessonId: z.string(),
    })).query(({ input }) => {
      for (const gate of GATES) {
        const lesson = gate.lessons.find(l => l.id === input.lessonId);
        if (lesson) return { ...lesson, gateId: gate.id, gateTitle: gate.title };
      }
      return null;
    }),
    gateExam: publicProcedure.input(z.object({
      gateId: z.string(),
    })).query(({ input }) => {
      const gate = GATES.find(g => g.id === input.gateId);
      if (!gate) return null;
      return { gateId: gate.id, gateTitle: gate.title, questions: gate.exam };
    }),
  }),
});

export type AppRouter = typeof appRouter;
