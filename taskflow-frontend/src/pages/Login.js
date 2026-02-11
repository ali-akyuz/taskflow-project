import { useState } from "react";
import { Button, Input, message } from "antd";
import { UserOutlined, LockOutlined, ArrowRightOutlined } from "@ant-design/icons";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim()) {
      message.error("Kullanıcı adı veya email boş bırakılamaz");
      return;
    }
    if (!password.trim()) {
      message.error("Şifre boş bırakılamaz");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      const data = res.data?.data ?? res.data;
      const token = data?.token ?? data?.accessToken;
      const role = data?.user?.role ?? data?.role;
      const user = data?.user;
      const displayName = user?.name ?? user?.username ?? user?.email ?? email?.trim() ?? "Kullanıcı";
      if (!token) {
        message.error("Backend beklenmeyen yanıt verdi. Token alınamadı.");
        return;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "employee");
      localStorage.setItem("userDisplayName", displayName);
      message.success("Giriş başarılı!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        const msg = error.response.data?.message ?? error.response.data?.error ?? "Giriş başarısız. Kullanıcı adı veya şifre hatalı.";
        message.error(msg);
      } else if (error.request) {
        message.error("Backend bağlantı hatası. Backend çalışıyor mu? CORS açık mı kontrol et.");
      } else {
        message.error(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "var(--tf-font)" }}>
      {/* Sol panel – tamamen yeni: marka odaklı, sade */}
      <div className="hidden lg:flex lg:w-[48%] flex-col items-center justify-center p-10 xl:p-14 bg-[#0a0f1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-teal-500/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-cyan-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          <button
            type="button"
            onClick={() => navigate("/welcome")}
            className="mb-10 hover:opacity-90 transition-opacity"
          >
            <img src="/arpeta-logo.png" alt="Arpeta Yazılım" className="h-16 xl:h-20 object-contain mx-auto" />
          </button>
          <h1 className="text-4xl xl:text-5xl font-bold tracking-[0.2em] text-white uppercase">
            Arpeta
          </h1>
          <div className="mt-6 w-12 h-px bg-teal-400/60" />
          <p className="mt-6 text-slate-400 text-sm tracking-wide">
            Görev ve proje yönetimi
          </p>
        </div>
        <p className="absolute bottom-8 left-0 right-0 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()}{" "}
          <a href="https://arpeta.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-400 transition-colors">
            Arpeta Yazılım ve Bilişim Teknolojileri A.Ş.
          </a>
        </p>
      </div>

      {/* Sağ panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#f8fafc]">
        <div className="w-full max-w-[400px]">
          <button
            type="button"
            onClick={() => navigate("/welcome")}
            className="lg:hidden flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity text-left cursor-pointer bg-transparent border-0 p-0"
          >
            <img src="/arpeta-logo.png" alt="Arpeta" className="h-10 object-contain" />
            <span className="font-semibold text-lg text-slate-800">Arpeta Yazılım</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Hoş geldiniz</h2>
          <p className="text-slate-500 mt-1 mb-8">Hesabınıza giriş yapın</p>

          <label className="block text-sm font-medium text-slate-700 mb-2">E-posta veya kullanıcı adı</label>
          <Input
            prefix={<UserOutlined className="text-slate-400" />}
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            autoComplete="off"
            className="mb-5 h-12 rounded-xl border-slate-200 hover:border-slate-300 focus:border-teal-500"
            size="large"
          />
          <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
          <Input.Password
            prefix={<LockOutlined className="text-slate-400" />}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            autoComplete="off"
            className="mb-8 h-12 rounded-xl border-slate-200 hover:border-slate-300 focus:border-teal-500"
            size="large"
          />
          <Button
            type="primary"
            block
            onClick={handleLogin}
            loading={loading}
            size="large"
            className="h-12 rounded-full font-semibold text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 border-0"
          >
            Giriş Yap
            <ArrowRightOutlined className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
