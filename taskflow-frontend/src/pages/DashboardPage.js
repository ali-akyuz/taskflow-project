import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

const styles = {
    container: { minHeight: '100vh', background: '#f3f4f6' },
    nav: {
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color: '#fff',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        boxShadow: '0 2px 10px rgba(79,70,229,0.3)',
    },
    navTitle: { fontSize: '22px', fontWeight: '700' },
    navUser: { display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' },
    logoutBtn: {
        background: 'rgba(255,255,255,0.2)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: '8px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '13px',
    },
    content: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
    welcome: { fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
    role: {
        display: 'inline-block',
        background: '#4f46e5',
        color: '#fff',
        padding: '2px 10px',
        borderRadius: '99px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '32px',
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' },
    card: {
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    cardLabel: { fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' },
    cardValue: { fontSize: '32px', fontWeight: '700', color: '#4f46e5' },
    sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
    th: { padding: '14px 20px', textAlign: 'left', background: '#f9fafb', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
    td: { padding: '14px 20px', fontSize: '14px', color: '#374151', borderTop: '1px solid #f3f4f6' },
    badge: (status) => ({
        padding: '2px 10px',
        borderRadius: '99px',
        fontSize: '11px',
        fontWeight: '600',
        background: status === 'completed' ? '#d1fae5' : status === 'in_progress' ? '#dbeafe' : '#fef3c7',
        color: status === 'completed' ? '#065f46' : status === 'in_progress' ? '#1e40af' : '#92400e',
    }),
    emptyState: { textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '14px' },
};

function DashboardPage({ user, onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, projectsRes] = await Promise.all([
                    fetch(`${API_URL}/api/tasks`, { headers }),
                    fetch(`${API_URL}/api/projects`, { headers }),
                ]);
                const tasksData = await tasksRes.json();
                const projectsData = await projectsRes.json();

                if (tasksData.success) setTasks(tasksData.data || []);
                if (projectsData.success) setProjects(projectsData.data || []);
            } catch (err) {
                console.error('Veri yüklenirken hata:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statusLabel = { pending: 'Bekliyor', in_progress: 'Devam Ediyor', completed: 'Tamamlandı' };

    return (
        <div style={styles.container}>
            <nav style={styles.nav}>
                <span style={styles.navTitle}>⚡ TaskFlow</span>
                <div style={styles.navUser}>
                    <span>Merhaba, <strong>{user.username}</strong></span>
                    <button style={styles.logoutBtn} onClick={onLogout}>Çıkış Yap</button>
                </div>
            </nav>

            <div style={styles.content}>
                <div style={styles.welcome}>Hoş Geldiniz 👋</div>
                <span style={styles.role}>{user.role === 'admin' ? '👑 Admin' : '👤 Employee'}</span>

                {/* İstatistik Kartları */}
                <div style={styles.grid}>
                    <div style={styles.card}>
                        <div style={styles.cardLabel}>Toplam Görev</div>
                        <div style={styles.cardValue}>{loading ? '...' : tasks.length}</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardLabel}>Tamamlanan</div>
                        <div style={{ ...styles.cardValue, color: '#10b981' }}>
                            {loading ? '...' : tasks.filter(t => t.status === 'completed').length}
                        </div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardLabel}>Devam Eden</div>
                        <div style={{ ...styles.cardValue, color: '#3b82f6' }}>
                            {loading ? '...' : tasks.filter(t => t.status === 'in_progress').length}
                        </div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardLabel}>Toplam Proje</div>
                        <div style={{ ...styles.cardValue, color: '#8b5cf6' }}>
                            {loading ? '...' : projects.length}
                        </div>
                    </div>
                </div>

                {/* Görev Tablosu */}
                <div style={styles.sectionTitle}>📋 Görevler</div>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Görev</th>
                            <th style={styles.th}>Proje</th>
                            <th style={styles.th}>Atanan</th>
                            <th style={styles.th}>Öncelik</th>
                            <th style={styles.th}>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={styles.emptyState}>Yükleniyor...</td></tr>
                        ) : tasks.length === 0 ? (
                            <tr><td colSpan={5} style={styles.emptyState}>Henüz görev yok.</td></tr>
                        ) : (
                            tasks.map(task => (
                                <tr key={task.id}>
                                    <td style={styles.td}><strong>{task.title}</strong></td>
                                    <td style={styles.td}>{task.project?.name || '-'}</td>
                                    <td style={styles.td}>{task.assignee?.username || '-'}</td>
                                    <td style={styles.td}>{task.priority}</td>
                                    <td style={styles.td}>
                                        <span style={styles.badge(task.status)}>
                                            {statusLabel[task.status] || task.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DashboardPage;
