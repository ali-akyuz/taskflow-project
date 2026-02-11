import { useState, useEffect } from "react";
import { Button, Card, message, Spin, Empty, Popconfirm, Table, Tag, Modal, Form, Input, Select } from "antd";
import { LogoutOutlined, PlusOutlined, DeleteOutlined, UserOutlined, UnorderedListOutlined, PlusCircleOutlined, EditOutlined } from "@ant-design/icons";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import DeveloperFooter from "../components/DeveloperFooter";

// Atanan isimlerini burada elle değiştirebilirsiniz (username → gösterilecek isim)
const ASSIGNEE_DISPLAY_NAMES = {
  testuser_spec: "Test Kullanıcı",
};

export default function AdminDashboard() {
  const [deletingId, setDeletingId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskSubmitLoading, setTaskSubmitLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userSubmitLoading, setUserSubmitLoading] = useState(false);
  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userEditModalOpen, setUserEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userEditLoading, setUserEditLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [projectEditModalOpen, setProjectEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectEditLoading, setProjectEditLoading] = useState(false);
  const [projectCreateModalOpen, setProjectCreateModalOpen] = useState(false);
  const [projectCreateLoading, setProjectCreateLoading] = useState(false);
  const [taskEditModalOpen, setTaskEditModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskEditLoading, setTaskEditLoading] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  const [editUserForm] = Form.useForm();
  const [projectEditForm] = Form.useForm();
  const [projectCreateForm] = Form.useForm();
  const [taskEditForm] = Form.useForm();
  const navigate = useNavigate();

  const employees = users.filter((u) => u.role !== "admin");

  // Görev formunda proje + başlık değişince, bu görevi zaten almış kişileri hesapla (dropdown'da devre dışı bırakmak için)
  const watchedProjectId = Form.useWatch("projectId", form);
  const watchedTitle = Form.useWatch("title", form);
  const alreadyAssignedToThisTask = (() => {
    const projectId = watchedProjectId;
    const title = (watchedTitle || "").trim();
    if (!projectId || !title) return new Set();
    const norm = (v) => (v == null || v === "" ? null : String(v).replace(/\s+/g, " ").trim().toLowerCase());
    const sameProject = (t) => {
      const tid = t.projectId ?? t.project_id ?? t.project?.id;
      if (tid == null) return false;
      return Number(tid) === Number(projectId) || String(tid) === String(projectId);
    };
    const sameTitle = (t) => norm(t.title) === norm(title);
    const getId = (t) => t.assigneeId ?? t.userId ?? t.assignee_id ?? t.user_id ?? t.assigned_to ?? t.assignedTo ?? t.assignee?.id ?? t.assignedUserId;
    const ids = tasks
      .filter((t) => sameProject(t) && sameTitle(t))
      .map(getId)
      .filter((id) => id != null && id !== "");
    const set = new Set();
    ids.forEach((id) => {
      set.add(String(id));
      if (!Number.isNaN(Number(id))) set.add(Number(id));
    });
    return set;
  })();

  const loadProjects = async () => {
    setListLoading(true);
    try {
      const res = await api.get("/projects");
      setProjects(Array.isArray(res.data) ? res.data : res.data?.projects ?? res.data?.data ?? []);
    } catch (error) {
      if (error.response?.status !== 404) {
        message.error(error.response?.data?.message || "Projeler yüklenemedi");
      }
      setProjects([]);
    } finally {
      setListLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/users");
      const data = res.data?.data ?? res.data?.users ?? res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status !== 404) {
        message.error(error.response?.data?.message || "Çalışanlar yüklenemedi");
      }
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await api.get("/tasks");
      const data = res.data?.data ?? res.data?.tasks ?? res.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status !== 404) {
        message.error(error.response?.data?.message || "Görevler yüklenemedi");
      }
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    loadUsers();
    loadTasks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userDisplayName");
    message.success("Çıkış yapıldı");
    navigate("/");
  };

  const openProjectCreate = () => {
    projectCreateForm.resetFields();
    setProjectCreateModalOpen(true);
  };

  const createProject = async (values) => {
    setProjectCreateLoading(true);
    try {
      await api.post("/projects", {
        name: values.name?.trim() || "Yeni Proje",
        description: values.description?.trim() || undefined,
      });
      message.success("Proje başarıyla oluşturuldu");
      setProjectCreateModalOpen(false);
      projectCreateForm.resetFields();
      loadProjects();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Proje oluşturulamadı");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setProjectCreateLoading(false);
    }
  };

  const deleteProject = async (id) => {
    setDeletingId(id);
    try {
      const idStr = String(id);
      let projectTasks = tasks.filter((t) => {
        const tid = t.projectId ?? t.project_id ?? t.project?.id;
        return tid != null && String(tid) === idStr;
      });
      if (projectTasks.length === 0) {
        try {
          const res = await api.get("/tasks");
          const allTasks = Array.isArray(res.data)
            ? res.data
            : res.data?.data ?? res.data?.tasks ?? res.data ?? [];
          projectTasks = allTasks.filter((t) => {
            const tid = t.projectId ?? t.project_id ?? t.project?.id;
            return tid != null && String(tid) === idStr;
          });
        } catch (_) {}
      }
      for (const task of projectTasks) {
        const taskId = task.id ?? task.taskId;
        if (taskId) {
          try {
            await api.delete(`/tasks/${taskId}`);
          } catch (e) {
            if (e.response?.status !== 404) {
              message.warning(`Görev silinemedi: ${task.title || taskId}`);
            }
          }
        }
      }
      await api.delete(`/projects/${id}`);
      message.success("Proje ve bağlı görevler silindi");
      loadProjects();
      loadTasks();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Proje silinemedi");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const openProjectEdit = (project) => {
    setEditingProjectId(project.id);
    projectEditForm.setFieldsValue({
      name: project.name ?? project.title ?? "",
      description: project.description ?? "",
    });
    setProjectEditModalOpen(true);
  };

  const updateProject = async (values) => {
    if (!editingProjectId) return;
    setProjectEditLoading(true);
    try {
      await api.put(`/projects/${editingProjectId}`, {
        name: values.name?.trim() || undefined,
        description: values.description?.trim() || undefined,
      });
      message.success("Proje güncellendi");
      setProjectEditModalOpen(false);
      setEditingProjectId(null);
      projectEditForm.resetFields();
      loadProjects();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Proje güncellenemedi");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setProjectEditLoading(false);
    }
  };

  const openTaskModal = () => {
    form.resetFields();
    loadTasks(); // Güncel görev listesiyle aynı kişiye aynı görev tekrar atanmasın
    setTaskModalOpen(true);
  };

  const openUserModal = () => {
    userForm.resetFields();
    userForm.setFieldValue("role", "employee");
    setUserModalOpen(true);
  };

  const createUser = async (values) => {
    setUserSubmitLoading(true);
    try {
      const email = values.email?.trim() || "";
      await api.post("/users", {
        username: email ? email.split("@")[0] : undefined,
        email,
        password: values.password,
        name: values.name || undefined,
        role: values.role || "employee",
      });
      message.success("Çalışan eklendi");
      setUserModalOpen(false);
      userForm.resetFields();
      loadUsers();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Çalışan eklenemedi");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setUserSubmitLoading(false);
    }
  };

  const openUserDetail = async (id) => {
    setUserDetailModalOpen(true);
    setSelectedUserDetail(null);
    setUserDetailLoading(true);
    try {
      const res = await api.get(`/users/${id}`);
      const data = res.data?.data ?? res.data;
      setSelectedUserDetail(data);
    } catch (error) {
      message.error("Detay yüklenemedi");
      setUserDetailModalOpen(false);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const openUserEdit = (record, e) => {
    if (e) e.stopPropagation();
    const id = record.id ?? record.userId;
    if (!id) return;
    setEditingUserId(id);
    editUserForm.setFieldsValue({
      email: record.email,
      name: record.name ?? record.username,
      role: record.role || "employee",
    });
    setUserEditModalOpen(true);
  };

  const updateUser = async (values) => {
    if (!editingUserId) return;
    setUserEditLoading(true);
    try {
      await api.put(`/users/${editingUserId}`, {
        email: values.email,
        name: values.name || undefined,
        role: values.role || "employee",
      });
      message.success("Kullanıcı güncellendi");
      setUserEditModalOpen(false);
      setEditingUserId(null);
      editUserForm.resetFields();
      loadUsers();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Güncellenemedi");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setUserEditLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setDeletingUserId(id);
    try {
      await api.delete(`/users/${id}`);
      message.success("Kullanıcı silindi");
      loadUsers();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Silinemedi");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  const createTask = async (values) => {
    const projectId = values.projectId;
    const title = (values.title || "").trim();
    const description = values.description?.trim() || undefined;
    let assigneeIds = values.assigneeIds ?? (values.assigneeId ? [values.assigneeId] : []);
    if (!Array.isArray(assigneeIds)) assigneeIds = [assigneeIds];

    // Gönderirken güncel görev listesini al (sayfalamayı aşmak için limit ile; aynı kişiye aynı görev tekrar atanmasın)
    let currentTasks = tasks;
    try {
      const res = await api.get("/tasks", { params: { limit: 2000 } });
      const data = res.data?.data ?? res.data?.tasks ?? res.data;
      const list = Array.isArray(data) ? data : [];
      if (list.length > 0) currentTasks = list;
    } catch (_) {
      // Hata olursa mevcut state ile devam et
    }

    const norm = (v) => {
      if (v == null || v === "") return null;
      return String(v).replace(/\s+/g, " ").trim().toLowerCase();
    };
    const sameProject = (t) => {
      const tid = t.projectId ?? t.project_id ?? t.project?.id;
      if (tid == null) return false;
      const a = Number(projectId);
      const b = Number(tid);
      if (!Number.isNaN(a) && !Number.isNaN(b)) return a === b;
      return String(tid) === String(projectId);
    };
    const sameTitle = (t) => norm(t.title) === norm(title);

    const getId = (t) => {
      const id = t.assigneeId ?? t.userId ?? t.assignee_id ?? t.user_id ?? t.assigned_to ?? t.assignedTo ?? t.assignee?.id ?? t.assignedUserId ?? t.assignee?._id;
      if (id == null || id === "") return null;
      return id;
    };

    const alreadyAssigned = new Set(
      currentTasks
        .filter((t) => sameProject(t) && sameTitle(t))
        .map(getId)
        .filter(Boolean)
        .flatMap((id) => [String(id), Number(id)].filter((x) => x !== "" && !Number.isNaN(x)))
    );
    const toAssign = assigneeIds.filter((id) => {
      const s = String(id);
      const n = Number(id);
      return !alreadyAssigned.has(s) && (Number.isNaN(n) || !alreadyAssigned.has(n));
    });

    if (toAssign.length === 0) {
      message.warning("Seçtiğiniz kişilere bu görev zaten atanmış. Başka çalışan seçin veya farklı bir görev başlığı girin.");
      return;
    }
    if (alreadyAssigned.size > 0 && toAssign.length < assigneeIds.length) {
      message.info(`${assigneeIds.length - toAssign.length} kişi bu görevi zaten alıyor, atlandı. ${toAssign.length} kişiye atanıyor.`);
    }

    setTaskSubmitLoading(true);
    try {
      for (const assigneeId of toAssign) {
        const payload = {
          // Temel alanlar
          title,
          description,
          // Backend'in beklediği durum değerleri: pending, in_progress, completed
          status: "pending",
          // Proje için olası ID alanları
          projectId,
          project_id: projectId,
          project: projectId,
          // Atanan kullanıcı için olası ID alanları
          assigneeId,
          userId: assigneeId,
          assignee_id: assigneeId,
          user_id: assigneeId,
          assigned_to: assigneeId,
          assignedTo: assigneeId,
        };
        await api.post("/tasks", payload);
      }
      message.success(toAssign.length === 1 ? "Görev atandı" : `${toAssign.length} kişiye görev atandı`);
      setTaskModalOpen(false);
      form.resetFields();
      loadTasks();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Görev atanamadı");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setTaskSubmitLoading(false);
    }
  };

  const openTaskEdit = (task) => {
    const id = task.id ?? task.taskId;
    setEditingTaskId(id);
    const assigneeId =
      task.assigneeId ??
      task.userId ??
      task.assignee_id ??
      task.user_id ??
      task.assigned_to ??
      task.assignedTo ??
      task.assignedUserId ??
      task.assigned_user_id ??
      task.assignee?.id;

    // Mevcut görevin durumunu backend'in beklediği değerlere eşle
    const rawStatus = task.status;
    let normalizedStatus = "pending";
    if (rawStatus != null && rawStatus !== "") {
      const s = String(rawStatus).toLowerCase().replace(/-/g, "_").trim();
      if (s === "todo") normalizedStatus = "pending";
      else if (s === "done") normalizedStatus = "completed";
      else if (s === "in progress") normalizedStatus = "in_progress";
      else normalizedStatus = s;
    }

    taskEditForm.setFieldsValue({
      title: task.title ?? "",
      description: task.description ?? "",
      status: normalizedStatus,
      projectId: task.projectId ?? task.project_id ?? task.project?.id,
      assigneeId: assigneeId != null && assigneeId !== "" ? assigneeId : undefined,
    });
    setTaskEditModalOpen(true);
  };

  const updateTask = async (values) => {
    if (!editingTaskId) return;
    setTaskEditLoading(true);
    try {
      const projectId = values.projectId;
      const assigneeId = values.assigneeId;
      // Backend için en sade ve net payload
      const payload = {
        title: values.title?.trim() || undefined,
        description: values.description?.trim() || undefined,
        status: values.status, // pending / in_progress / completed
        project_id: projectId,
        assignee_id: assigneeId,
      };
      await api.put(`/tasks/${editingTaskId}`, payload);
      message.success("Görev güncellendi");
      setTaskEditModalOpen(false);
      setEditingTaskId(null);
      taskEditForm.resetFields();
      loadTasks();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Görev güncellenemedi");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setTaskEditLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    setDeletingTaskId(taskId);
    try {
      await api.delete(`/tasks/${taskId}`);
      message.success("Görev silindi");
      loadTasks();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data?.message || "Görev silinemedi");
      } else if (error.request) {
        message.error("Backend bağlantı hatası");
      } else {
        message.error("Bir hata oluştu");
      }
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--tf-surface)]" style={{ fontFamily: "var(--tf-font)" }}>
      <header className="bg-[var(--tf-dark)] text-white border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/arpeta-logo.png" alt="Arpeta" className="h-10 object-contain" />
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="font-bold text-lg text-white tracking-tight">ARPETA</h1>
              <p className="text-slate-400 text-xs">Yönetici Paneli</p>
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Card
          className="rounded-[var(--tf-radius-lg)] border border-slate-200/80 shadow-[var(--tf-shadow)] hover:shadow-[var(--tf-shadow-lg)] transition-shadow"
          styles={{ body: { padding: "2rem" } }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Projeler</h2>
              <p className="text-slate-500 text-sm">Yeni proje oluşturun veya mevcut projeleri yönetin.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openProjectCreate}
                size="large"
                className="rounded-[var(--tf-radius)] h-12 px-6 font-medium"
              >
                Proje Oluştur
              </Button>
              <Button
                icon={<PlusCircleOutlined />}
                onClick={openTaskModal}
                size="large"
                className="rounded-[var(--tf-radius)] h-12 px-6"
              >
                Görev Ata
              </Button>
            </div>
          </div>
        </Card>

        {/* Proje Oluştur Modal */}
        <Modal
          title="Proje Oluştur"
          open={projectCreateModalOpen}
          onCancel={() => { setProjectCreateModalOpen(false); projectCreateForm.resetFields(); }}
          footer={null}
          width={480}
        >
          <Form form={projectCreateForm} layout="vertical" onFinish={createProject} className="mt-4">
            <Form.Item name="name" label="Proje adı" rules={[{ required: true, message: "Proje adı girin" }]}>
              <Input placeholder="Proje adı" size="large" />
            </Form.Item>
            <Form.Item name="description" label="Açıklama (isteğe bağlı)">
              <Input.TextArea placeholder="Proje açıklaması" rows={3} size="large" />
            </Form.Item>
            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2">
                <Button onClick={() => { setProjectCreateModalOpen(false); projectCreateForm.resetFields(); }}>İptal</Button>
                <Button type="primary" htmlType="submit" loading={projectCreateLoading} className="rounded-[var(--tf-radius)]">
                  Oluştur
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Görev Ata"
          open={taskModalOpen}
          onCancel={() => setTaskModalOpen(false)}
          footer={null}
          width={480}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={createTask}
            className="mt-4"
          >
            <Form.Item
              name="projectId"
              label="Proje"
              rules={[{ required: true, message: "Proje seçin" }]}
            >
              <Select
                placeholder="Proje seçin"
                size="large"
                options={projects.map((p) => ({ value: p.id, label: p.name || p.title || "İsimsiz proje" }))}
              />
            </Form.Item>
            <Form.Item
              name="title"
              label="Görev başlığı"
              rules={[{ required: true, message: "Başlık girin" }]}
            >
              <Input placeholder="Örn: API dokümantasyonunu güncelle" size="large" />
            </Form.Item>
            <Form.Item
              name="assigneeIds"
              label="Atanacak çalışan(lar)"
              rules={[{ required: true, message: "En az bir çalışan seçin" }]}
              extra={
                <>
                  Proje ve başlığı seçtikten sonra çalışan seçin. Bu görevi zaten alanlar listede "zaten atanmış" olarak görünür ve tekrar seçilemez.
                </>
              }
            >
              <Select
                mode="multiple"
                placeholder="Çalışan seçin (1 veya daha fazla)"
                size="large"
                maxTagCount={10}
                optionFilterProp="label"
                options={employees.map((u) => {
                  const raw = u.name || u.email || u.username || `#${u.id}`;
                  const label = ASSIGNEE_DISPLAY_NAMES[raw] ?? raw;
                  const id = u.id ?? u.userId ?? u._id;
                  const isAlreadyAssigned = id != null && (alreadyAssignedToThisTask.has(id) || alreadyAssignedToThisTask.has(String(id)) || alreadyAssignedToThisTask.has(Number(id)));
                  return {
                    value: u.id,
                    label: isAlreadyAssigned ? `${label} (zaten atanmış)` : label,
                    disabled: isAlreadyAssigned,
                  };
                })}
              />
            </Form.Item>
            <Form.Item name="description" label="Açıklama (isteğe bağlı)">
              <Input.TextArea placeholder="Görev detayı..." rows={3} />
            </Form.Item>
            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2">
                <Button onClick={() => setTaskModalOpen(false)}>İptal</Button>
                <Button type="primary" htmlType="submit" loading={taskSubmitLoading} className="rounded-[var(--tf-radius)]">
                  Görev Ata
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Görev Düzenle Modal */}
        <Modal
          title="Görevi düzenle"
          open={taskEditModalOpen}
          onCancel={() => { setTaskEditModalOpen(false); setEditingTaskId(null); taskEditForm.resetFields(); }}
          footer={null}
          width={480}
        >
          <Form form={taskEditForm} layout="vertical" onFinish={updateTask} className="mt-4">
            <Form.Item name="projectId" label="Proje" rules={[{ required: true, message: "Proje seçin" }]}>
              <Select
                placeholder="Proje seçin"
                size="large"
                options={projects.map((p) => ({ value: p.id, label: p.name || p.title || "İsimsiz proje" }))}
              />
            </Form.Item>
            <Form.Item name="title" label="Görev başlığı" rules={[{ required: true, message: "Başlık girin" }]}>
              <Input placeholder="Görev başlığı" size="large" />
            </Form.Item>
            <Form.Item name="description" label="Açıklama (isteğe bağlı)">
              <Input.TextArea placeholder="Açıklama" rows={3} size="large" />
            </Form.Item>
            <Form.Item name="assigneeId" label="Çalışan" rules={[{ required: true, message: "Çalışan seçin" }]}>
              <Select
                placeholder="Çalışan"
                size="large"
                options={employees.map((u) => {
                  const raw = u.name || u.email || u.username || `#${u.id}`;
                  return { value: u.id, label: ASSIGNEE_DISPLAY_NAMES[raw] ?? raw };
                })}
              />
            </Form.Item>
            <Form.Item name="status" label="Durum" rules={[{ required: true }]}>
              <Select
                size="large"
                options={[
                  { value: "pending", label: "Yapılacak" },
                  { value: "in_progress", label: "Devam ediyor" },
                  { value: "completed", label: "Tamamlandı" },
                ]}
              />
            </Form.Item>
            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2">
                <Button onClick={() => { setTaskEditModalOpen(false); setEditingTaskId(null); taskEditForm.resetFields(); }}>İptal</Button>
                <Button type="primary" htmlType="submit" loading={taskEditLoading} className="rounded-[var(--tf-radius)]">
                  Kaydet
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {listLoading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="rounded-[var(--tf-radius-lg)] border border-slate-200/80 shadow-[var(--tf-shadow)] mt-6">
            <Empty description="Henüz proje yok. Yukarıdaki butonla proje oluşturun." />
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Mevcut projeler</h3>
            {projects.map((project) => (
              <Card
                key={project.id}
                className="rounded-[var(--tf-radius-lg)] border border-slate-200/80 shadow-[var(--tf-shadow)] hover:shadow-[var(--tf-shadow-lg)] transition-shadow"
                styles={{ body: { padding: "1rem 1.5rem" } }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{project.name || project.title || "İsimsiz proje"}</h4>
                    {project.description && (
                      <p className="text-slate-500 text-sm mt-1">{project.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openProjectEdit(project)}
                    >
                      Düzenle
                    </Button>
                    <Popconfirm
                      title="Projeyi sil"
                      description="Bu proje ve projeye bağlı tüm görevler silinecek. Emin misiniz?"
                      onConfirm={() => deleteProject(project.id)}
                      okText="Evet, sil"
                      cancelText="İptal"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deletingId === project.id}
                        className="shrink-0"
                      >
                        Sil
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Proje Düzenle Modal */}
        <Modal
          title="Proje Düzenle"
          open={projectEditModalOpen}
          onCancel={() => { setProjectEditModalOpen(false); setEditingProjectId(null); projectEditForm.resetFields(); }}
          footer={null}
          width={480}
        >
          <Form form={projectEditForm} layout="vertical" onFinish={updateProject} className="mt-4">
            <Form.Item name="name" label="Proje adı" rules={[{ required: true, message: "Proje adı girin" }]}>
              <Input placeholder="Proje adı" size="large" />
            </Form.Item>
            <Form.Item name="description" label="Açıklama (isteğe bağlı)">
              <Input.TextArea placeholder="Proje açıklaması" rows={3} size="large" />
            </Form.Item>
            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2">
                <Button onClick={() => { setProjectEditModalOpen(false); setEditingProjectId(null); projectEditForm.resetFields(); }}>İptal</Button>
                <Button type="primary" htmlType="submit" loading={projectEditLoading} className="rounded-[var(--tf-radius)]">
                  Kaydet
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Çalışan listesi */}
        <Card
          className="rounded-[var(--tf-radius-lg)] border border-slate-200/80 shadow-[var(--tf-shadow)] mt-8"
          title={
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <UserOutlined /> Çalışanlar
              </span>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openUserModal} className="rounded-[var(--tf-radius)]">
                Çalışan Ekle
              </Button>
            </div>
          }
          styles={{ body: { padding: "0 1.5rem 1.5rem" } }}
        >
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : users.length === 0 ? (
            <Empty description="Çalışan bulunamadı. Yukarıdaki butonla ekleyin." className="py-6" />
          ) : (
            <Table
              dataSource={users}
              rowKey={(r) => r.id ?? r.userId ?? r.email}
              pagination={{ pageSize: 10 }}
              size="small"
              onRow={(record) => {
                const id = record.id ?? record.userId;
                return {
                  style: { cursor: id ? "pointer" : "default" },
                  onClick: () => id && openUserDetail(id),
                };
              }}
              columns={[
                { title: "Ad / Soyad", dataIndex: "name", key: "name", width: 240, render: (_, r) => r.name || r.email || r.username || "—" },
                { title: "Email", dataIndex: "email", key: "email", render: (v) => v || "—" },
                {
                  title: "Rol",
                  dataIndex: "role",
                  key: "role",
                  width: 240,
                  align: "center",
                  render: (role) => (
                    <span className="inline-block text-left">
                      <Tag color={role === "admin" ? "blue" : "default"}>{role === "admin" ? "Yönetici" : "Çalışan"}</Tag>
                    </span>
                  ),
                },
                {
                  title: "İşlemler",
                  key: "actions",
                  width: 120,
                  align: "center",
                  render: (_, record) => {
                    const id = record.id ?? record.userId;
                    return (
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => openUserEdit(record, e)}
                        >
                          Düzenle
                        </Button>
                        <Popconfirm
                          title="Kullanıcıyı sil"
                          description="Bu kullanıcıyı silmek istediğinize emin misiniz?"
                          onConfirm={() => id && deleteUser(id)}
                          okText="Evet, sil"
                          cancelText="İptal"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            loading={deletingUserId === id}
                          >
                            Sil
                          </Button>
                        </Popconfirm>
                      </div>
                    );
                  },
                },
              ]}
            />
          )}
        </Card>

        {/* Çalışan Ekle Modal */}
        <Modal
          title="Çalışan Ekle"
          open={userModalOpen}
          onCancel={() => setUserModalOpen(false)}
          footer={null}
          width={480}
        >
          <Form form={userForm} layout="vertical" onFinish={createUser} className="mt-4">
            <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email girin" }, { type: "email", message: "Geçerli email girin" }]}>
              <Input placeholder="calisan@ornek.com" size="large" />
            </Form.Item>
            <Form.Item name="password" label="Şifre" rules={[{ required: true, message: "Şifre girin" }, { min: 6, message: "En az 6 karakter" }]}>
              <Input.Password placeholder="••••••••" size="large" />
            </Form.Item>
            <Form.Item name="name" label="Ad Soyad (isteğe bağlı)">
              <Input placeholder="Ad Soyad" size="large" />
            </Form.Item>
            <Form.Item name="role" label="Rol" initialValue="employee">
              <Select
                size="large"
                options={[
                  { value: "employee", label: "Çalışan" },
                  { value: "admin", label: "Yönetici" },
                ]}
              />
            </Form.Item>
            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2">
                <Button onClick={() => setUserModalOpen(false)}>İptal</Button>
                <Button type="primary" htmlType="submit" loading={userSubmitLoading} className="rounded-[var(--tf-radius)]">
                  Ekle
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Çalışan Düzenle Modal */}
        <Modal
          title="Çalışan Düzenle"
          open={userEditModalOpen}
          onCancel={() => { setUserEditModalOpen(false); setEditingUserId(null); editUserForm.resetFields(); }}
          footer={null}
          width={480}
        >
          <Form form={editUserForm} layout="vertical" onFinish={updateUser} className="mt-4">
            <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email girin" }, { type: "email", message: "Geçerli email girin" }]}>
              <Input placeholder="calisan@ornek.com" size="large" />
            </Form.Item>
            <Form.Item name="name" label="Ad Soyad (isteğe bağlı)">
              <Input placeholder="Ad Soyad" size="large" />
            </Form.Item>
            <Form.Item name="role" label="Rol">
              <Select
                size="large"
                options={[
                  { value: "employee", label: "Çalışan" },
                  { value: "admin", label: "Yönetici" },
                ]}
              />
            </Form.Item>
            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2">
                <Button onClick={() => { setUserEditModalOpen(false); setEditingUserId(null); editUserForm.resetFields(); }}>İptal</Button>
                <Button type="primary" htmlType="submit" loading={userEditLoading} className="rounded-[var(--tf-radius)]">
                  Kaydet
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Çalışan detay Modal */}
        <Modal
          title="Çalışan detayı"
          open={userDetailModalOpen}
          onCancel={() => setUserDetailModalOpen(false)}
          footer={<Button onClick={() => setUserDetailModalOpen(false)}>Kapat</Button>}
          width={400}
        >
          {userDetailLoading ? (
            <div className="flex justify-center py-8"><Spin /></div>
          ) : selectedUserDetail ? (
            <div className="space-y-2 text-sm">
              <p><strong>Ad:</strong> {selectedUserDetail.name || "—"}</p>
              <p><strong>Email:</strong> {selectedUserDetail.email || "—"}</p>
              <p><strong>Kullanıcı adı:</strong> {selectedUserDetail.username || "—"}</p>
              <p><strong>Rol:</strong> <Tag color={selectedUserDetail.role === "admin" ? "blue" : "default"}>{selectedUserDetail.role === "admin" ? "Yönetici" : "Çalışan"}</Tag></p>
            </div>
          ) : null}
        </Modal>

        {/* Tüm görevler */}
        <Card
          className="rounded-[var(--tf-radius-lg)] border border-slate-200/80 shadow-[var(--tf-shadow)] mt-8"
          title={
            <span className="flex items-center gap-2">
              <UnorderedListOutlined /> Tüm görevler
            </span>
          }
          styles={{ body: { padding: "0 1.5rem 1.5rem" } }}
        >
          {tasksLoading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : tasks.length === 0 ? (
            <Empty description="Henüz görev yok" className="py-6" />
          ) : (
            <Table
              dataSource={tasks}
              rowKey={(r) => r.id ?? r.taskId ?? `task-${r.projectId}-${r.assigneeId ?? r.userId}-${(r.title || "").slice(0, 30)}`}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="middle"
              scroll={{ x: 850 }}
              className="tasks-table"
              columns={[
                { title: "Görev", dataIndex: "title", key: "title", width: 140, ellipsis: true, render: (v) => v || "—" },
                { title: "Açıklama", dataIndex: "description", key: "description", width: 80, ellipsis: true, render: (v) => v || "—" },
                {
                  title: "Durum",
                  key: "status",
                  width: 160,
                  align: "center",
                  render: (_, r) => {
                    const raw = r.status ?? r.task_status ?? r.state;
                    const normalized =
                      raw == null || raw === ""
                        ? "pending"
                        : String(raw).toLowerCase().replace(/-/g, "_").trim();
                    const map = {
                      pending: "Yapılacak",
                      todo: "Yapılacak",
                      in_progress: "Devam ediyor",
                      "in progress": "Devam ediyor",
                      completed: "Tamamlandı",
                      done: "Tamamlandı",
                    };
                    const color = {
                      pending: "default",
                      todo: "default",
                      in_progress: "processing",
                      "in progress": "processing",
                      completed: "success",
                      done: "success",
                    };
                    const key = normalized.replace(/\s/g, "_");
                    const label = map[key] ?? raw ?? "—";
                    const tagColor = color[key] ?? "default";
                    return <Tag color={tagColor}>{label}</Tag>;
                  },
                },
                {
                  title: "Atanan",
                  key: "assignee",
                  width: 120,
                  ellipsis: true,
                  render: (_, r) => {
                    // Önce gömülü assignee/user varsa ismi göster
                    const embeddedName =
                      r.assignee?.name ?? r.assignee?.email ?? r.assignee?.username ??
                      r.user?.name ?? r.user?.email ?? r.user?.username ??
                      r.assignedUser?.name ?? r.assignedUser?.email ??
                      r.assigned_to_username ?? r.assignedToUsername ?? r.assigneeName;
                    if (embeddedName) return ASSIGNEE_DISPLAY_NAMES[embeddedName] ?? embeddedName;

                    const id =
                      r.assigneeId ?? r.userId ?? r.assignee_id ?? r.user_id ?? r.assigned_to ?? r.assignedTo ??
                      r.assignedUserId ?? r.assigned_user_id ?? r.assignee?.id;
                    if (id != null && id !== "") {
                      const idStr = String(id);
                      const idNum = Number(id);
                      const user = users.find(
                        (u) => {
                          const uId = u.id ?? u.userId ?? u._id;
                          if (uId == null) return false;
                          return String(uId) === idStr || Number(uId) === idNum || uId === id;
                        }
                      );
                      if (user) {
                        const n = user.name || user.email || user.username || "—";
                        return ASSIGNEE_DISPLAY_NAMES[n] ?? n;
                      }
                    }
                    return "—";
                  },
                },
                {
                  title: "Proje",
                  key: "project",
                  width: 140,
                  ellipsis: true,
                  render: (_, r) => {
                    const name = r.projectName ?? r.project?.name;
                    if (name) return name;
                    const id = r.projectId ?? r.project_id;
                    if (!id) return "—";
                    const project = projects.find((p) => (p.id ?? p.projectId) === id);
                    return project ? (project.name ?? project.title ?? "—") : id;
                  },
                },
                {
                  title: "İşlem",
                  key: "actions",
                  width: 160,
                  align: "center",
                  render: (_, r) => {
                    const id = r.id ?? r.taskId;
                    if (!id) return "—";
                    return (
                      <div className="flex items-center justify-center gap-2 flex-nowrap whitespace-nowrap">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openTaskEdit(r)}
                          className="text-slate-500 hover:text-teal-600 shrink-0"
                        >
                          Düzenle
                        </Button>
                        <Popconfirm
                          title="Görevi sil"
                          description="Bu görev silinecek. Emin misiniz?"
                          onConfirm={() => deleteTask(id)}
                          okText="Evet, sil"
                          cancelText="İptal"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            loading={deletingTaskId === id}
                            className="text-red-500 hover:text-red-600 shrink-0"
                          >
                            Sil
                          </Button>
                        </Popconfirm>
                      </div>
                    );
                  },
                },
              ]}
            />
          )}
        </Card>
      </main>
      <footer className="border-t border-slate-200/80 bg-white/50 py-5 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <DeveloperFooter />
          <a href="https://arpeta.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 text-sm transition-colors inline-block">
            Arpeta Yazılım ve Bilişim Teknolojileri A.Ş.
          </a>
        </div>
      </footer>
    </div>
  );
}
