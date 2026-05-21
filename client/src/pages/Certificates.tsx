import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Shield, ArrowRight, Award, Download, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useRef } from "react";
import { GATES } from "../../../shared/courseData";

export default function Certificates() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: certificates, isLoading } = trpc.certificates.list.useQuery(undefined, { enabled: isAuthenticated });

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

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowRight className="w-4 h-4 ml-1" />
            لوحة التحكم
          </Button>
          <span className="font-bold">شهاداتي</span>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Award className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">شهادات الإتمام</h1>
            <p className="text-muted-foreground">شهاداتك المكتسبة من إكمال الأبواب التعليمية</p>
          </div>

          {isLoading ? (
            <div className="grid gap-6">
              {[1, 2].map(i => <div key={i} className="cyber-card animate-pulse h-64" />)}
            </div>
          ) : certificates && certificates.length > 0 ? (
            <div className="grid gap-8">
              {certificates.map((cert) => (
                <CertificateCard key={cert.id} cert={cert} userName={user?.name || "متعلم"} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 cyber-card">
              <Award className="w-20 h-20 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-bold mb-2">لا توجد شهادات بعد</h3>
              <p className="text-muted-foreground mb-6">أكمل الأبواب التعليمية واجتز الاختبارات للحصول على شهادات إتمام</p>
              <Button onClick={() => navigate("/gates")} className="bg-primary text-primary-foreground">
                ابدأ التعلم
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CertificateCard({ cert, userName }: { cert: any; userName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gateTitle = cert.type === "platform"
    ? "خبير الأمن السيبراني"
    : GATES.find(g => g.id === cert.gateId)?.title || "باب تعليمي";

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Certificate dimensions
    canvas.width = 1200;
    canvas.height = 850;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 850);
    gradient.addColorStop(0, "#0a1628");
    gradient.addColorStop(0.5, "#0f1f3d");
    gradient.addColorStop(1, "#0a1628");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 850);

    // Border
    ctx.strokeStyle = "#00d4aa";
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 1140, 790);
    ctx.strokeStyle = "#00d4aa44";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, 1120, 770);

    // Corner decorations
    const corners = [[50, 50], [1150, 50], [50, 800], [1150, 800]];
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#00d4aa";
      ctx.fill();
    });

    // Title
    ctx.textAlign = "center";
    ctx.fillStyle = "#00d4aa";
    ctx.font = "bold 28px Cairo, sans-serif";
    ctx.fillText("أكاديمية سايبر الذكية", 600, 120);

    // Certificate text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px Cairo, sans-serif";
    ctx.fillText("شهادة إتمام", 600, 200);

    // Decorative line
    ctx.beginPath();
    ctx.moveTo(400, 230);
    ctx.lineTo(800, 230);
    ctx.strokeStyle = "#00d4aa55";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Subtitle
    ctx.fillStyle = "#94a3b8";
    ctx.font = "24px Cairo, sans-serif";
    ctx.fillText("تشهد أكاديمية سايبر الذكية بأن", 600, 300);

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Cairo, sans-serif";
    ctx.fillText(cert.userName || userName, 600, 380);

    // Underline for name
    const nameWidth = ctx.measureText(cert.userName || userName).width;
    ctx.beginPath();
    ctx.moveTo(600 - nameWidth / 2, 395);
    ctx.lineTo(600 + nameWidth / 2, 395);
    ctx.strokeStyle = "#00d4aa";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Achievement text
    ctx.fillStyle = "#94a3b8";
    ctx.font = "24px Cairo, sans-serif";
    ctx.fillText("قد أتم بنجاح", 600, 460);

    ctx.fillStyle = "#00d4aa";
    ctx.font = "bold 36px Cairo, sans-serif";
    ctx.fillText(gateTitle, 600, 520);

    // Certificate number
    ctx.fillStyle = "#64748b";
    ctx.font = "16px monospace";
    ctx.fillText(`رقم الشهادة: ${cert.certificateNumber}`, 600, 600);

    // Date
    ctx.fillStyle = "#94a3b8";
    ctx.font = "20px Cairo, sans-serif";
    const date = new Date(cert.issuedAt).toLocaleDateString("ar-SA", {
      year: "numeric", month: "long", day: "numeric"
    });
    ctx.fillText(`تاريخ الإصدار: ${date}`, 600, 650);

    // Shield icon (simple)
    ctx.beginPath();
    ctx.moveTo(600, 700);
    ctx.lineTo(630, 715);
    ctx.lineTo(630, 745);
    ctx.quadraticCurveTo(600, 770, 570, 745);
    ctx.lineTo(570, 715);
    ctx.closePath();
    ctx.fillStyle = "#00d4aa22";
    ctx.fill();
    ctx.strokeStyle = "#00d4aa";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Download
    const link = document.createElement("a");
    link.download = `certificate-${cert.certificateNumber}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="cyber-card overflow-hidden">
      {/* Certificate preview */}
      <div className="bg-gradient-to-br from-[#0a1628] to-[#0f1f3d] rounded-xl p-8 mb-4 border border-primary/20 relative">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #00d4aa 1px, transparent 1px)",
          backgroundSize: "30px 30px"
        }} />
        <div className="text-center relative">
          <div className="text-primary text-sm font-bold mb-2">أكاديمية سايبر الذكية</div>
          <h3 className="text-2xl font-bold text-white mb-1">شهادة إتمام</h3>
          <div className="w-24 h-0.5 bg-primary/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm mb-2">تشهد بأن</p>
          <p className="text-xl font-bold text-white mb-2">{cert.userName || userName}</p>
          <p className="text-muted-foreground text-sm mb-1">قد أتم بنجاح</p>
          <p className="text-primary font-bold text-lg">{gateTitle}</p>
        </div>
      </div>

      {/* Info & download */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(cert.issuedAt).toLocaleDateString("ar-SA")}
          </span>
          <span className="font-mono text-xs">{cert.certificateNumber}</span>
        </div>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground" onClick={handleDownload}>
          <Download className="w-4 h-4" />
          تنزيل
        </Button>
      </div>

      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
