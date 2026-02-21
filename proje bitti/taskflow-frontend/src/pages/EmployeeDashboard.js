import { useEffect, useState } from "react";
import api from "../api/axios";
import { Select, Spin, message, Empty, Button } from "antd";
import { LogoutOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import DeveloperFooter from "../components/DeveloperFooter";

const statusConfig = {
  pending: {
    label: "Yapılacak",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-l-slate-400",
    pill: "bg-slate-100 text-slate-700",
    icon: <ClockCircleOutlined className="text-slate-500" />,
  },
  in_progress: {
    label: "Devam ediyor",
    color: "text-amber-700",
    bg: "bg-amber-50/50",
    border: "border-l-amber-500",
    pill: "bg-amber-100 text-amber-800",
    icon: <SyncOutlined spin className="text-amber-600" />,
  },
  completed: {
    label: "Tamamlandı",
    color: "text-teal-700",
    bg: "bg-teal-50/50",
    border: "border-l-teal-500",
    pill: "bg-teal-100 text-teal-800",
    icon: <CheckCircleOutlined className="text-teal-600" />,
  },
};

const normalizeStatus = (raw) => {
  if (raw == null || raw === "") return "pending";
  const s = String(raw).toLowerCase().replace(/-/g, "_").trim();
  if (s === "todo") return "pending";
  if (s === "done") return "completed";
  if (s === "in progress") return "in_progress";
  return s;
};

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks/my");
      const data = res.data?.data ?? res.data?.tasks ?? res.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Görevler yüklenemedi");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      message.success("Görev durumu güncellendi");
      loadTasks();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Durum güncellenemedi");
      } else {
        message.error("Bir hata oluştu");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userDisplayName");
    message.success("Çıkış yapıldı");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--tf-surface)]" style={{ fontFamily: "var(--tf-font)" }}>
        <Spin size="large" style={{ color: "var(--tf-accent)" }} />
        <p className="mt-4 text-slate-500 font-medium">Görevler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--tf-surface)]" style={{ fontFamily: "var(--tf-font)" }}>
      <header className="bg-[var(--tf-dark)] text-white border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/arpeta-logo.png" alt="Arpeta" className="h-10 object-contain" />
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="font-bold text-lg text-white">ARPETA</h1>
              <p className="text-slate-400 text-xs">Çalışan Paneli</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm hidden sm:inline">
              {localStorage.getItem("userDisplayName") || "Kullanıcı"}
            </span>
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg"
            >
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <UnorderedListOutlined className="text-teal-600 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Görevlerim</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {tasks.length === 0
                ? "Henüz atanmış görev yok"
                : `${tasks.length} görev`}
            </p>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {["pending", "in_progress", "completed"].map((key) => {
              const cfg = statusConfig[key];
              const count = tasks.filter((t) => normalizeStatus(t.status) === key).length;
              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.pill}`}
                >
                  {cfg.icon}
                  {cfg.label}
                  <span className="bg-white/60 rounded-full px-1.5 text-xs">{count}</span>
                </span>
              );
            })}
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <UnorderedListOutlined className="text-3xl text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Henüz göreviniz yok</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Size atanan görevler burada listelenecek. Yeni görev atandığında sayfayı yenileyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const key = normalizeStatus(task.status);
              const status = statusConfig[key] || statusConfig.pending;
              return (
                <div
                  key={task.id}
                  className={`rounded-2xl border border-slate-200/80 bg-white border-l-4 ${status.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
                >
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 mb-1 leading-snug">{task.title}</h3>
                      {task.description && (
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.pill}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        {(task.project?.name ?? task.projectName ?? task.project_name) && (
                          <span className="text-slate-500 text-xs font-medium">
                            Proje Adı: {task.project?.name ?? task.projectName ?? task.project_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Select
                      value={normalizeStatus(task.status)}
                      onChange={(val) => updateStatus(task.id, val)}
                      className="w-full sm:w-[160px] shrink-0"
                      size="middle"
                      options={[
                        { value: "pending", label: "Yapılacak" },
                        { value: "in_progress", label: "Devam ediyor" },
                        { value: "completed", label: "Tamamlandı" },
                      ]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <footer className="border-t border-slate-200/80 bg-white/50 py-5 mt-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <DeveloperFooter />
          <a href="https://arpeta.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 text-sm transition-colors inline-block">
            Arpeta Yazılım ve Bilişim Teknolojileri A.Ş.
          </a>
        </div>
      </footer>
    </div>
  );
}
