import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        window.location.href = "/gates";
      } else {
        setError(data.error || "حدث خطأ أثناء التسجيل");
      }
    },
    onError: (err) => {
      setError("حدث خطأ في الاتصال. حاول مرة أخرى.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    if (name.length < 2) {
      setError("الاسم يجب أن يكون حرفين على الأقل");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    registerMutation.mutate({ name, email, password });
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: "ضعيفة", color: "bg-red-500", width: "w-1/4" };
    if (password.length < 8) return { label: "متوسطة", color: "bg-yellow-500", width: "w-2/4" };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: "قوية", color: "bg-green-500", width: "w-full" };
    return { label: "جيدة", color: "bg-cyan-500", width: "w-3/4" };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4" dir="rtl">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">إنشاء حساب جديد</h1>
          <p className="text-gray-400 mt-2">انضم إلى أكاديمية سايبر وابدأ رحلتك</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 text-sm">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="أدخل اسمك"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#1a2332] border-gray-600/50 text-white placeholder:text-gray-500 pr-10 h-11 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1a2332] border-gray-600/50 text-white placeholder:text-gray-500 pr-10 h-11 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="6 أحرف على الأقل"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1a2332] border-gray-600/50 text-white placeholder:text-gray-500 pr-10 pl-10 h-11 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {strength && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
                  </div>
                  <p className={`text-xs ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300 text-sm">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="أعد كتابة كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#1a2332] border-gray-600/50 text-white placeholder:text-gray-500 pr-10 h-11 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
                  dir="ltr"
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-11 bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-200 active:scale-[0.97]"
            >
              {registerMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "إنشاء الحساب"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              لديك حساب بالفعل؟{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                سجّل دخولك
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
