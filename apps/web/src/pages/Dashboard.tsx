import { useState } from 'react';
import {
  Button, Table, Tag, Input, Select, Form, Modal, 
  message, Tooltip, Space, Typography, Empty
} from 'antd';
import {
  PlusOutlined, SearchOutlined, BugOutlined,
  DashboardOutlined, SettingOutlined, LogoutOutlined,
  FilterOutlined, ReloadOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, SyncOutlined, ClockCircleOutlined,
  FireOutlined, ApiOutlined, RobotOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { bugsApi } from '../api/bugs';
import { projectsApi } from '../api/projects';
import type { CreateBugRequest, BugResponse } from '../api/bugs';
import BugDetailsDrawer from '../components/BugDetailsDrawer';
import ArchitectureMap from '../components/ArchitectureMap';
const { Text } = Typography;
const { TextArea } = Input;

/* ─── helper maps ─── */
const STATUS_STYLES: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Open:       { color: '#ff4d4f', bg: 'rgba(255,77,79,0.12)',   icon: <ExclamationCircleOutlined /> },
  InProgress: { color: '#fa8c16', bg: 'rgba(250,140,22,0.12)',  icon: <SyncOutlined spin />        },
  InReview:   { color: '#1677ff', bg: 'rgba(22,119,255,0.12)',  icon: <ClockCircleOutlined />       },
  Resolved:   { color: '#52c41a', bg: 'rgba(82,196,26,0.12)',   icon: <CheckCircleOutlined />       },
  Closed:     { color: '#8b8b9e', bg: 'rgba(139,139,158,0.12)', icon: <CheckCircleOutlined />       },
};

const PRIORITY_STYLES: Record<string, { color: string; bg: string }> = {
  Critical: { color: '#ff4d4f', bg: 'rgba(255,77,79,0.12)' },
  High:     { color: '#fa541c', bg: 'rgba(245,84,28,0.12)' },
  Medium:   { color: '#fa8c16', bg: 'rgba(250,140,22,0.12)' },
  Low:      { color: '#52c41a', bg: 'rgba(82,196,26,0.12)' },
};

function StatusTag({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Open;
  return (
    <span className="status-tag" style={{ color: s.color, background: s.bg }}>
      <span className="status-dot" style={{ background: s.color }} />
      {status}
    </span>
  );
}

function PriorityTag({ priority }: { priority: string }) {
  const p = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.Medium;
  return (
    <Tag style={{ color: p.color, background: p.bg, border: 'none', fontWeight: 600, borderRadius: 6 }}>
      {priority === 'Critical' && <FireOutlined style={{ marginRight: 4 }} />}
      {priority}
    </Tag>
  );
}

/* ─── Stats ─── */
function StatsGrid({ bugs }: { bugs: BugResponse[] }) {
  const total     = bugs.length;
  const open      = bugs.filter(b => b.status === 'Open').length;
  const progress  = bugs.filter(b => b.status === 'InProgress').length;
  const critical  = bugs.filter(b => b.priority === 'Critical').length;

  const cards = [
    { label: 'Total Bugs',     value: total,    accent: '#1677ff', iconBg: 'rgba(22,119,255,0.1)',   icon: '🐛', sub: 'across all priorities' },
    { label: 'Open Issues',    value: open,     accent: '#ff4d4f', iconBg: 'rgba(255,77,79,0.1)',    icon: '🔴', sub: 'awaiting action' },
    { label: 'In Progress',    value: progress, accent: '#fa8c16', iconBg: 'rgba(250,140,22,0.1)',   icon: '⚡', sub: 'actively being worked' },
    { label: 'Critical',       value: critical, accent: '#722ed1', iconBg: 'rgba(114,46,209,0.1)',   icon: '🔥', sub: 'needs immediate attention' },
  ];

  return (
    <div className="stats-grid">
      {cards.map((c) => (
        <div className="stat-card" key={c.label} style={{ '--accent': c.accent } as React.CSSProperties}>
          <div className="stat-icon" style={{ background: c.iconBg, '--icon-bg': c.iconBg } as React.CSSProperties}>{c.icon}</div>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">{c.value}</div>
          <div className="stat-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Report Bug Modal ─── */
function ReportBugModal({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string | null }) {
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateBugRequest) => bugsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bugs'] });
      message.success('Bug reported successfully!');
      form.resetFields();
      onClose();
    },
    onError: () => {
      message.error('Failed to report bug. Make sure you are logged in.');
    },
  });

  const onFinish = (values: Record<string, string>) => {
    if (!projectId) {
      message.error("Please select or create a project first.");
      return;
    }
    mutate({
      title: values.title,
      description: values.description,
      priority: values.priority,
      projectId: projectId,
      correlationId: values.correlationId || null,
      assignedToId: null,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <Space>
          <BugOutlined style={{ color: '#1677ff' }} />
          <span>Report a Bug</span>
        </Space>
      }
      width={560}
      styles={{ body: { background: '#18181f' }, header: { background: '#18181f', borderBottom: '1px solid #2a2a35' } }}
    >
      <Form form={form} onFinish={onFinish} layout="vertical" size="large" style={{ marginTop: 20 }}>
        <Form.Item label={<span style={{ color: '#8b8b9e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bug Title</span>} name="title" rules={[{ required: true, message: 'A descriptive title is required.' }]}>
          <Input placeholder="e.g. Login button unresponsive on Safari" />
        </Form.Item>

        <Form.Item label={<span style={{ color: '#8b8b9e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>} name="description" rules={[{ required: true, message: 'Please describe the bug.' }]}>
          <TextArea
            rows={5}
            placeholder="Steps to reproduce, expected behavior, actual behavior..."
            style={{ resize: 'none' }}
          />
        </Form.Item>

        <Form.Item label={<span style={{ color: '#8b8b9e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</span>} name="priority" initialValue="Medium">
          <Select options={[
            { value: 'Low',      label: '🟢  Low — Minor inconvenience' },
            { value: 'Medium',   label: '🟡  Medium — Degraded experience' },
            { value: 'High',     label: '🔴  High — Key feature broken' },
            { value: 'Critical', label: '🔥  Critical — System unusable' },
          ]} />
        </Form.Item>

        <Form.Item label={<span style={{ color: '#8b8b9e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correlation / Trace ID (Optional)</span>} name="correlationId" tooltip="Attach an error trace ID from your logs to correlate this with other bugs.">
          <Input placeholder="e.g. req-5f8a9b21-xyz" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isPending} icon={<PlusOutlined />}>
            Report Bug
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

/* ─── Create Project Modal ─── */
function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { name: string; description: string }) => projectsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      message.success('Project created successfully!');
      form.resetFields();
      onClose();
    },
    onError: () => message.error('Failed to create project.'),
  });

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Create Project" styles={{ body: { background: '#18181f' }, header: { background: '#18181f' } }}>
      <Form form={form} onFinish={mutate} layout="vertical">
        <Form.Item label="Project Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea rows={3} />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>Create</Button>
        </div>
      </Form>
    </Modal>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const qc = useQueryClient();

  const handleSimulateCrash = async () => {
    if (!activeProjectId) {
      message.error("Please select a project first.");
      return;
    }
    setIsSimulating(true);
    const traceId = `trace-${Math.random().toString(36).substring(2, 10)}`;
    try {
      message.loading({ content: 'Simulating app crash...', key: 'sim' });
      // 1. Create Bug
      const bug = await bugsApi.create({
        title: 'Payment Gateway Timeout (Automated)',
        description: 'The payment gateway timed out after 30 seconds while processing a transaction.',
        priority: 'Critical',
        projectId: activeProjectId,
        correlationId: traceId,
        branchName: 'fix/payment-gateway-timeout',
        pullRequestUrl: 'https://github.com/buglens/buglens-demo/pull/42',
        environment: 'Production',
      });

      // 2. Add Evidence
      await bugsApi.addEvidence(bug.id, {
        type: 'StackTrace',
        title: 'GatewayTimeoutException',
        content: `at Stripe.PaymentIntentService.Create(PaymentIntentCreateOptions options)\nat BugLens.Billing.PaymentProcessor.Charge(String customerId, Int32 amount)\nat BugLens.Api.Controllers.CheckoutController.Post(CheckoutRequest req)`
      });

      // 3. Add Investigation Note
      await bugsApi.addInvestigationNote(bug.id, {
        title: 'AI Analysis',
        content: 'The timeout is correlated with a spike in latency from the upstream Stripe API. The retry policy was exhausted. Marking as Root Cause.',
        isRootCause: true
      });

      qc.invalidateQueries({ queryKey: ['bugs'] });
      message.success({ content: 'Crash simulated successfully!', key: 'sim', duration: 3 });
    } catch (e) {
      message.error({ content: 'Simulation failed.', key: 'sim' });
    } finally {
      setIsSimulating(false);
    }
  };

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });

  // Auto-select first project
  if (projects.length > 0 && !activeProjectId) {
    setActiveProjectId(projects[0].id);
  }

  const { data: bugs = [], isLoading, refetch } = useQuery({
    queryKey: ['bugs'],
    queryFn: bugsApi.getAll,
    refetchInterval: 30_000,
  });

  const filtered = bugs.filter((b) => {
    const matchProject = !activeProjectId || b.projectId === activeProjectId;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    const matchPriority = !priorityFilter || b.priority === priorityFilter;
    return matchProject && matchSearch && matchStatus && matchPriority;
  });

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() ?? '?';

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, r: BugResponse) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f0f0f0', marginBottom: 2 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#8b8b9e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
            {r.description}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (p: string) => <PriorityTag priority={p} />,
    },
    {
      title: 'Reporter',
      dataIndex: 'createdByName',
      key: 'createdByName',
      width: 140,
      render: (name: string) => (
        <Space size={6}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #1677ff, #722ed1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>
            {name?.[0]?.toUpperCase() ?? '?'}
          </span>
          <span style={{ fontSize: 13 }}>{name ?? '—'}</span>
        </Space>
      ),
    },
    {
      title: 'Assignee',
      dataIndex: 'assignedToName',
      key: 'assignedToName',
      width: 140,
      render: (name: string) =>
        name ? (
          <Space size={6}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(82,196,26,0.2)', border: '1px solid rgba(82,196,26,0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#52c41a' }}>
              {name[0].toUpperCase()}
            </span>
            <span style={{ fontSize: 13 }}>{name}</span>
          </Space>
        ) : (
          <Text style={{ fontSize: 13, color: '#8b8b9e' }}>Unassigned</Text>
        ),
    },
    {
      title: 'Opened',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => (
        <Tooltip title={new Date(d).toLocaleString()}>
          <span style={{ fontSize: 13, color: '#8b8b9e' }}>
            {new Date(d).toLocaleDateString()}
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="app-shell">
      {/* ─── Sidebar ─── */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><BugOutlined style={{ color: 'white' }} /></div>
          <span className="sidebar-logo-text">BugLens</span>
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <div className="sidebar-item active">
          <span className="sidebar-item-icon"><DashboardOutlined /></span>
          Dashboard
          <span className="sidebar-badge">{bugs.filter(b => b.status === 'Open').length}</span>
        </div>

        <div style={{ flex: 1 }} />

        <div className="sidebar-section-label" style={{ marginTop: 16 }}>Account</div>
        <div className="sidebar-item" onClick={logout} style={{ color: '#ff4d4f' }}>
          <span className="sidebar-item-icon"><LogoutOutlined /></span>
          Sign Out
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <SettingOutlined style={{ color: '#8b8b9e', fontSize: 14 }} />
          </div>
        </div>
      </nav>

      {/* ─── Main ─── */}
      <div className="main-area">
        <header className="topbar">
          <Space>
            <span className="topbar-title">Project: </span>
            <Select
              style={{ width: 200 }}
              value={activeProjectId}
              onChange={setActiveProjectId}
              placeholder="Select a project"
              options={projects.map(p => ({ value: p.id, label: p.name }))}
            />
            <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={() => setProjectModalOpen(true)}>New</Button>
          </Space>
          <div className="topbar-right">
            <Button 
              type="default" 
              icon={<ApiOutlined />} 
              href="http://localhost:5059/scalar/v1" 
              target="_blank"
            >
              API Explorer
            </Button>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Tooltip>
            <Button type="primary" danger loading={isSimulating} icon={<RobotOutlined />} onClick={handleSimulateCrash} style={{ fontWeight: 600 }}>
              Simulate Crash
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ fontWeight: 600 }}>
              Report Bug
            </Button>
          </div>
        </header>

        <main className="page-content">
          {/* Stats */}
          <StatsGrid bugs={bugs} />

          {/* Bugs Table */}
          <div className="table-container">
            <div className="table-header">
              <div className="table-header-left">
                <span className="table-title">All Issues</span>
                <span className="bug-count-badge">{filtered.length}</span>
              </div>
              <div className="table-header-right">
                <Input
                  placeholder="Search bugs…"
                  prefix={<SearchOutlined style={{ color: '#8b8b9e' }} />}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: 220 }}
                  allowClear
                />
                <Select
                  placeholder={<><FilterOutlined /> Status</>}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allowClear
                  style={{ width: 140 }}
                  options={['Open','InProgress','InReview','Resolved','Closed'].map(s => ({ value: s, label: s }))}
                />
                <Select
                  placeholder={<><FilterOutlined /> Priority</>}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  allowClear
                  style={{ width: 140 }}
                  options={['Critical','High','Medium','Low'].map(p => ({ value: p, label: p }))}
                />
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              loading={isLoading}
              onRow={(record) => ({
                onClick: () => setSelectedBugId(record.id),
              })}
              locale={{ emptyText: <Empty description="No bugs found. Great job! 🎉" /> }}
              pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} issue${t === 1 ? '' : 's'}` }}
            />
          </div>
          <div style={{ marginTop: 24, paddingBottom: 24 }}>
            <ArchitectureMap />
          </div>
        </main>
      </div>

      <CreateProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
      <ReportBugModal open={modalOpen} onClose={() => setModalOpen(false)} projectId={activeProjectId} />
      
      <BugDetailsDrawer 
        bugId={selectedBugId} 
        open={!!selectedBugId} 
        onClose={() => setSelectedBugId(null)} 
      />
    </div>
  );
}
