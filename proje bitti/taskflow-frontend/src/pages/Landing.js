import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0f1a]"
      style={{ fontFamily: "var(--tf-font)" }}
    >
      {/* Arka plan: gradient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-[80%] max-w-2xl h-[70%] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-[60%] max-w-xl h-[50%] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8">
          <a
            href="https://arpeta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <img src="/arpeta-logo.png" alt="Arpeta Yazılım" className="h-10 sm:h-12 object-contain" />
            <span className="font-semibold text-white/90 text-sm sm:text-base tracking-tight">
              Arpeta Yazılım
            </span>
          </a>
          <span className="text-slate-400 hover:text-teal-400 text-sm transition-colors cursor-default">
            Ali Akyüz
          </span>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-12 sm:py-16">
          <div className="w-full max-w-3xl mx-auto text-center">
            {/* Marka – Arpeta */}
            <h1 className="landing-animate landing-animate-delay-1 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[0.35em] sm:tracking-[0.4em] text-white uppercase leading-none text-center ml-4 sm:ml-6">
              Arpeta
            </h1>
            {/* Arpeta sitesinden referans */}
            <p className="landing-animate landing-animate-delay-2 mt-6 text-slate-400/90 text-base sm:text-lg tracking-wide max-w-lg mx-auto font-medium text-center">
              Mobil uyumlu web uygulaması · Proje ve görev yönetimi
            </p>
            <p className="landing-animate landing-animate-delay-2 mt-2 text-slate-500 text-sm sm:text-base max-w-md mx-auto text-center">
            Projelerinizi en iyi şekilde yönetmenizi sağlayalım.
            </p>

            <div className="landing-animate landing-animate-delay-3 mt-12 sm:mt-14 flex justify-center">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/login")}
                className="h-12 px-8 rounded-full font-semibold text-base shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:shadow-xl transition-all duration-300 border-0"
              >
                Giriş Yap
                <ArrowRightOutlined className="ml-2 text-sm" />
              </Button>
            </div>
          </div>
        </main>

        <footer className="py-5 sm:py-6 border-t border-white/[0.06]">
          <p className="text-center text-slate-500 text-sm">
            © {new Date().getFullYear()}{" "}
            <a
              href="https://arpeta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-400 transition-colors"
            >
              Arpeta Yazılım ve Bilişim Teknolojileri A.Ş.
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
