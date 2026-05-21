import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
      <div className="cyber-card max-w-md w-full text-center p-12">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-xl font-bold mb-2">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-8">
          عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Button
          className="gap-2 bg-primary text-primary-foreground"
          onClick={() => navigate("/")}
        >
          <Home className="w-4 h-4" />
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
}
