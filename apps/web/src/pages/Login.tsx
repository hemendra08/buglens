import { useState } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined, BugOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';

const features = [
  { icon: '🔍', text: 'Track bugs from creation to resolution' },
  { icon: '👥', text: 'Assign issues and collaborate with your team' },
  { icon: '📊', text: 'Visualize progress with real-time dashboards' },
  { icon: '⚡', text: 'Prioritize critical issues instantly' },
];

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await authApi.login({ email: values.email, password: values.password });
        setAuth(data.token, data.user);
        message.success(`Welcome back, ${data.user.name}! 👋`);
      } else {
        const data = await authApi.register({ name: values.name, email: values.email, password: values.password });
        setAuth(data.token, data.user);
        message.success(`Account created! Let's crush some bugs 🐛`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { title?: string; message?: string } } };
      const msg = err.response?.data?.title || err.response?.data?.message || 'Something went wrong. Please try again.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    form.resetFields();
  };

  return (
    <div className="login-root">
      {/* Left Panel — Branding */}
      <div className="login-left">
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div className="login-brand">
            <div className="login-brand-icon">
              <BugOutlined style={{ color: 'white' }} />
            </div>
            <span className="login-brand-name">BugLens</span>
          </div>

          <div className="login-tagline">
            <h1>
              Ship software <span>without the bugs</span> holding you back.
            </h1>
            <p>
              A developer-first bug tracking platform. Capture issues, assign ownership,
              and ship fixes—all in one clean interface.
            </p>
          </div>

          <div className="feature-pills">
            {features.map((f, i) => (
              <div className="feature-pill" key={i}>
                <div className="feature-pill-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="login-right">
        <div className="login-form-title">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </div>
        <div className="login-form-subtitle">
          {mode === 'login'
            ? 'Enter your credentials to access your workspace.'
            : 'Join your team and start tracking issues today.'}
        </div>

        <div className="login-toggle">
          <button className={`login-toggle-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
            Log In
          </button>
          <button className={`login-toggle-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>
            Sign Up
          </button>
        </div>

        <Form form={form} name="auth" onFinish={onFinish} layout="vertical" size="large" requiredMark={false}>
          {mode === 'register' && (
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Your full name is required.' }]}
            >
              <Input prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />} placeholder="Full Name" />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email address.' }]}
          >
            <Input prefix={<MailOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />} placeholder="Email address" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Password is required.' },
              ...(mode === 'register' ? [{ min: 8, message: 'Password must be at least 8 characters.' }] : []),
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />} placeholder="Password" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 44, fontWeight: 600, fontSize: 15 }}>
              {loading ? '' : mode === 'login' ? 'Log In to BugLens' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          {mode === 'login' ? "New to BugLens?" : "Already have an account?"}
        </Divider>

        <Button block size="large" style={{ fontWeight: 500 }} onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create a free account' : 'Back to Login'}
        </Button>
      </div>
    </div>
  );
}
