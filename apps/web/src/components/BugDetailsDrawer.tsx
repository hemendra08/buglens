import { useState } from 'react';
import { Drawer, Typography, Select, Space, Avatar, Input, Button, List, Spin, message, Tabs, Card, Tag, Modal, Form, Checkbox, Timeline } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bugsApi } from '../api/bugs';
import { usersApi } from '../api/users';
import { useAuthStore } from '../store/authStore';
import { SendOutlined, PlusOutlined, ExperimentOutlined, FileSearchOutlined, PictureOutlined, CodeOutlined, ExceptionOutlined, ClockCircleOutlined, LinkOutlined, RobotOutlined, GithubOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

export default function BugDetailsDrawer({
  bugId,
  open,
  onClose
}: {
  bugId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const generateAiInsights = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiInsights({
        summary: `Based on the stack trace and evidence, the application crashed because the ${bug?.title} process was unable to complete its critical path.`,
        rootCause: `The upstream dependency or database lock associated with "${bug?.title}" timed out. This strongly suggests either a network partition, excessive latency, or exhausted connection pools.`,
        steps: [
          "Check the application logs for connection pool exhaustion warnings.",
          "Verify the upstream service SLA to confirm if it was degraded during this time.",
          "Implement a circuit breaker pattern (e.g., Polly) to fail fast and degrade gracefully."
        ],
        testCode: `test('should handle ${bug?.title?.split(' ')[0] || 'service'} timeout gracefully', async () => {
  jest.spyOn(api, 'call').mockRejectedValue(new TimeoutError());
  const res = await processTransaction();
  expect(res.status).toBe('failed_safely');
});`
      });
      setAiLoading(false);
    }, 2500);
  };
  
  const [evidenceForm] = Form.useForm();
  const [noteForm] = Form.useForm();

  const { user } = useAuthStore();

  const { data: bug, isLoading } = useQuery({
    queryKey: ['bugs', bugId],
    queryFn: () => bugsApi.getById(bugId!),
    enabled: !!bugId,
    refetchInterval: 10_000,
  });

  const { data: allBugs } = useQuery({
    queryKey: ['bugs'],
    queryFn: () => bugsApi.getAll(),
  });

  const relatedBugs = allBugs?.filter(b => b.id !== bugId && b.correlationId && bug?.correlationId && b.correlationId === bug.correlationId) || [];

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => bugsApi.update(bugId!, data),
    onSuccess: () => {
      message.success('Bug updated');
      qc.invalidateQueries({ queryKey: ['bugs'] });
      qc.invalidateQueries({ queryKey: ['bugs', bugId] });
    },
    onError: () => message.error('Failed to update bug'),
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => bugsApi.addComment(bugId!, body),
    onSuccess: () => {
      setCommentText('');
      qc.invalidateQueries({ queryKey: ['bugs', bugId] });
    },
    onError: () => message.error('Failed to add comment'),
  });

  const evidenceMutation = useMutation({
    mutationFn: (data: { type: string; title: string; content: string }) => bugsApi.addEvidence(bugId!, data),
    onSuccess: () => {
      message.success('Evidence added');
      setEvidenceModalOpen(false);
      evidenceForm.resetFields();
      qc.invalidateQueries({ queryKey: ['bugs', bugId] });
    },
  });

  const noteMutation = useMutation({
    mutationFn: (data: { title: string; content: string; isRootCause: boolean }) => bugsApi.addInvestigationNote(bugId!, data),
    onSuccess: () => {
      message.success('Note added');
      setNoteModalOpen(false);
      noteForm.resetFields();
      qc.invalidateQueries({ queryKey: ['bugs', bugId] });
    },
  });

  if (!bugId) return null;

  return (
    <Drawer
      title={<Text strong style={{ fontSize: 20 }}>{bug?.title || 'Investigation Workspace'}</Text>}
      placement="right"
      width={800}
      onClose={onClose}
      open={open}
      styles={{ body: { padding: 0, background: '#0d0d12' }, header: { background: '#13131a', borderBottom: '1px solid #2a2a35' } }}
    >
      {isLoading || !bug ? (
        <div style={{ padding: 40, textAlign: 'center' }}><Spin size="large" /></div>
      ) : (
        <Tabs
          defaultActiveKey="1"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          tabBarStyle={{ padding: '0 24px', background: '#13131a', borderBottom: '1px solid #2a2a35', margin: 0 }}
          items={[
            {
              key: '1',
              label: 'Overview',
              children: (
                <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 110px)' }}>
                  <Space size="large" style={{ marginBottom: 24, width: '100%', padding: '16px', background: '#18181f', borderRadius: 8, border: '1px solid #2a2a35' }}>
                    <div>
                      <div style={{ color: '#8b8b9e', fontSize: 12, marginBottom: 4 }}>STATUS</div>
                      <Select
                        value={bug.status}
                        onChange={(v) => updateMutation.mutate({ status: v })}
                        style={{ width: 140 }}
                        options={['Open', 'InProgress', 'InReview', 'Resolved', 'Closed'].map(s => ({ value: s, label: s }))}
                      />
                    </div>
                    <div>
                      <div style={{ color: '#8b8b9e', fontSize: 12, marginBottom: 4 }}>PRIORITY</div>
                      <Select
                        value={bug.priority}
                        onChange={(v) => updateMutation.mutate({ priority: v })}
                        style={{ width: 120 }}
                        options={['Low', 'Medium', 'High', 'Critical'].map(p => ({ value: p, label: p }))}
                      />
                    </div>
                    <div>
                      <div style={{ color: '#8b8b9e', fontSize: 12, marginBottom: 4 }}>ASSIGNEE</div>
                      <Select
                        showSearch
                        allowClear
                        placeholder="Unassigned"
                        value={bug.assignedToId}
                        onChange={(v) => updateMutation.mutate({ assignedToId: v || null })}
                        style={{ width: 180 }}
                        options={users?.map(u => ({ value: u.id, label: u.name })) || []}
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      />
                    </div>
                  </Space>

                  <div style={{ marginBottom: 32 }}>
                    <div style={{ color: '#8b8b9e', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>Description</div>
                    <div style={{ background: '#18181f', padding: 16, borderRadius: 8, border: '1px solid #2a2a35', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {bug.description}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#8b8b9e', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, marginBottom: 16, textTransform: 'uppercase' }}>Activity & Comments</div>
                    <List
                      itemLayout="horizontal"
                      dataSource={bug.comments || []}
                      renderItem={(item) => (
                        <List.Item style={{ borderBottom: 'none', padding: '12px 0' }}>
                          <List.Item.Meta
                            avatar={<Avatar style={{ background: 'linear-gradient(135deg, #1677ff, #722ed1)' }}>{item.authorName?.[0]?.toUpperCase()}</Avatar>}
                            title={
                              <Space>
                                <Text strong>{item.authorName}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</Text>
                              </Space>
                            }
                            description={<div style={{ color: '#f0f0f0', marginTop: 4 }}>{item.body}</div>}
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: <span style={{ color: '#8b8b9e' }}>No comments yet.</span> }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <Avatar style={{ background: '#1677ff' }}>{user?.name?.[0]?.toUpperCase()}</Avatar>
                    <div style={{ flex: 1 }}>
                      <TextArea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        style={{ resize: 'none', background: '#18181f', border: '1px solid #2a2a35', marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="primary" icon={<SendOutlined />} disabled={!commentText.trim()} loading={commentMutation.isPending} onClick={() => commentMutation.mutate(commentText)}>
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: <><FileSearchOutlined /> Evidence</>,
              children: (
                <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 110px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Text style={{ color: '#8b8b9e', fontSize: 14 }}>Collect logs, API responses, and screenshots.</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setEvidenceModalOpen(true)}>Add Evidence</Button>
                  </div>
                  
                  <List
                    grid={{ gutter: 16, column: 2 }}
                    dataSource={bug.evidences || []}
                    locale={{ emptyText: <EmptyState title="No Evidence Collected" desc="Add stack traces, logs, or screenshots to help with the investigation." /> }}
                    renderItem={(item) => (
                      <List.Item>
                        <Card 
                          title={
                            <Space>
                              {item.type === 'Screenshot' ? <PictureOutlined style={{ color: '#1677ff' }}/> : 
                               item.type === 'NetworkLog' ? <CodeOutlined style={{ color: '#fa8c16' }}/> : 
                               item.type === 'StackTrace' ? <ExceptionOutlined style={{ color: '#ff4d4f' }}/> : 
                               <FileSearchOutlined />}
                              {item.title}
                            </Space>
                          }
                          size="small"
                          style={{ background: '#18181f', borderColor: '#2a2a35' }}
                          styles={{ header: { borderBottom: '1px solid #2a2a35' } }}
                        >
                          <div style={{ background: '#0d0d12', padding: 8, borderRadius: 4, maxHeight: 150, overflowY: 'auto', border: '1px solid #2a2a35', fontFamily: 'monospace', fontSize: 12, color: '#a0a0a0', whiteSpace: 'pre-wrap' }}>
                            {item.content}
                          </div>
                          <div style={{ marginTop: 12, fontSize: 11, color: '#8b8b9e', textAlign: 'right' }}>
                            Added by {item.uploadedByName} on {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />

                  <Modal title="Add Evidence" open={evidenceModalOpen} onCancel={() => setEvidenceModalOpen(false)} footer={null} styles={{ body: { background: '#18181f' }, header: { background: '#18181f' } }}>
                    <Form form={evidenceForm} onFinish={(v) => evidenceMutation.mutate(v)} layout="vertical">
                      <Form.Item name="type" label="Type" initialValue="NetworkLog" rules={[{ required: true }]}>
                        <Select options={['NetworkLog', 'StackTrace', 'Screenshot', 'Custom'].map(t => ({ value: t, label: t }))} />
                      </Form.Item>
                      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Failed POST /login Response" />
                      </Form.Item>
                      <Form.Item name="content" label="Content" rules={[{ required: true }]}>
                        <TextArea rows={6} placeholder="Paste log, JSON response, stack trace, or image URL..." style={{ fontFamily: 'monospace' }} />
                      </Form.Item>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <Button onClick={() => setEvidenceModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={evidenceMutation.isPending}>Add Evidence</Button>
                      </div>
                    </Form>
                  </Modal>
                </div>
              ),
            },
            {
              key: '3',
              label: <><ExperimentOutlined /> Investigation Notes</>,
              children: (
                <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 110px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Text style={{ color: '#8b8b9e', fontSize: 14 }}>Document your hypotheses and root cause analysis.</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setNoteModalOpen(true)}>Add Note</Button>
                  </div>

                  <List
                    dataSource={bug.investigationNotes || []}
                    locale={{ emptyText: <EmptyState title="No Notes" desc="Start your investigation by adding hypotheses and findings here." /> }}
                    renderItem={(item) => (
                      <List.Item style={{ borderBottom: 'none', padding: 0, marginBottom: 16 }}>
                        <Card 
                          style={{ width: '100%', background: '#18181f', borderColor: item.isRootCause ? '#fa8c16' : '#2a2a35' }}
                          styles={{ body: { padding: 16 } }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <Space>
                              <Text strong style={{ fontSize: 16 }}>{item.title}</Text>
                              {item.isRootCause && <Tag color="orange">Root Cause</Tag>}
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.authorName} • {new Date(item.createdAt).toLocaleString()}</Text>
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{item.content}</div>
                        </Card>
                      </List.Item>
                    )}
                  />

                  <Modal title="Add Investigation Note" open={noteModalOpen} onCancel={() => setNoteModalOpen(false)} footer={null} styles={{ body: { background: '#18181f' }, header: { background: '#18181f' } }}>
                    <Form form={noteForm} onFinish={(v) => noteMutation.mutate(v)} layout="vertical">
                      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Hypothesis: Rate Limit Reached" />
                      </Form.Item>
                      <Form.Item name="content" label="Content" rules={[{ required: true }]}>
                        <TextArea rows={5} placeholder="I found that..." />
                      </Form.Item>
                      <Form.Item name="isRootCause" valuePropName="checked">
                        <Checkbox>Mark as Identified Root Cause</Checkbox>
                      </Form.Item>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <Button onClick={() => setNoteModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={noteMutation.isPending}>Save Note</Button>
                      </div>
                    </Form>
                  </Modal>
                </div>
              ),
            },
            {
              key: '4',
              label: <><ClockCircleOutlined /> Timeline</>,
              children: (
                <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 110px)' }}>
                  <Timeline
                    mode="alternate"
                    items={[
                      ...(bug.comments || []).map(c => ({ type: 'comment', date: new Date(c.createdAt), data: c })),
                      ...(bug.evidences || []).map(e => ({ type: 'evidence', date: new Date(e.createdAt), data: e })),
                      ...(bug.investigationNotes || []).map(n => ({ type: 'note', date: new Date(n.createdAt), data: n })),
                    ].sort((a, b) => b.date.getTime() - a.date.getTime()).map((item) => {
                      let color = 'blue';
                      let label = item.date.toLocaleString();
                      let content = null;
                      
                      if (item.type === 'comment') {
                        const c = item.data as any;
                        color = 'gray';
                        content = <div style={{ background: '#18181f', padding: 12, borderRadius: 8, border: '1px solid #2a2a35' }}><Text strong>{c.authorName}</Text> commented:<br/>{c.body}</div>;
                      } else if (item.type === 'evidence') {
                        const e = item.data as any;
                        color = 'green';
                        content = <div style={{ background: '#18181f', padding: 12, borderRadius: 8, border: '1px solid #135200' }}><Text strong style={{color:'#52c41a'}}>{e.uploadedByName} attached evidence:</Text><br/>{e.title} ({e.type})</div>;
                      } else if (item.type === 'note') {
                        const n = item.data as any;
                        color = n.isRootCause ? 'orange' : 'purple';
                        content = <div style={{ background: '#18181f', padding: 12, borderRadius: 8, border: `1px solid ${n.isRootCause ? '#d46b08' : '#391085'}` }}><Text strong style={{color: n.isRootCause ? '#fa8c16' : '#722ed1'}}>{n.authorName} added {n.isRootCause ? 'Root Cause' : 'Note'}:</Text><br/>{n.title}</div>;
                      }

                      return { color, label, children: content };
                    })}
                  />
                </div>
              )
            },
            {
              key: '5',
              label: <><LinkOutlined /> Related Issues {relatedBugs.length > 0 && <Tag color="blue">{relatedBugs.length}</Tag>}</>,
              children: (
                <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 110px)' }}>
                  <Typography.Title level={5} style={{ color: '#fff', marginTop: 0 }}>Error Correlation</Typography.Title>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    Issues tied to the same Correlation ID: <strong>{bug.correlationId || 'None'}</strong>
                  </Typography.Text>
                  
                  {relatedBugs.length === 0 ? (
                    <EmptyState title="No related issues" desc="There are no other bugs sharing this trace ID." />
                  ) : (
                    <List
                      dataSource={relatedBugs}
                      renderItem={b => (
                        <Card size="small" style={{ background: '#18181f', border: '1px solid #2a2a35', marginBottom: 12 }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong style={{ color: '#fff', fontSize: 16 }}>{b.title}</Text>
                            <Space>
                              <Tag color={b.status === 'Resolved' ? 'success' : 'processing'}>{b.status}</Tag>
                              <Tag color={b.priority === 'Critical' ? 'error' : 'default'}>{b.priority}</Tag>
                              <Text type="secondary">{new Date(b.createdAt).toLocaleString()}</Text>
                            </Space>
                          </Space>
                        </Card>
                      )}
                    />
                  )}
                </div>
              )
            },
            {
              key: '6',
              label: <><RobotOutlined /> AI Insights <Tag color="purple" style={{ marginLeft: 6, border: 0 }}>Beta</Tag></>,
              children: (
                <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 110px)' }}>
                  {!aiInsights && !aiLoading && (
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                      <RobotOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                      <Typography.Title level={4} style={{ color: '#fff' }}>Ask BugLens AI</Typography.Title>
                      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                        Let our AI analyze the stack traces, logs, and comments to determine the root cause.
                      </Typography.Text>
                      <Button type="primary" onClick={generateAiInsights} style={{ background: '#722ed1', borderColor: '#722ed1', fontWeight: 600 }}>
                        Generate AI Analysis
                      </Button>
                    </div>
                  )}
                  {aiLoading && (
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                      <Spin size="large" />
                      <Typography.Text style={{ color: '#8b8b9e', display: 'block', marginTop: 16 }}>
                        Analyzing stack traces and evidence...
                      </Typography.Text>
                    </div>
                  )}
                  {aiInsights && !aiLoading && (
                    <div>
                      <Typography.Title level={5} style={{ color: '#fff' }}><RobotOutlined style={{ color: '#722ed1' }} /> AI Analysis</Typography.Title>
                      <Card size="small" style={{ background: 'rgba(114, 46, 209, 0.1)', border: '1px solid rgba(114, 46, 209, 0.3)', marginBottom: 16 }}>
                        <Typography.Text style={{ color: '#e6f4ff' }}>{aiInsights.summary}</Typography.Text>
                      </Card>

                      <Typography.Title level={5} style={{ color: '#fff', marginTop: 24 }}>🔥 Likely Root Cause</Typography.Title>
                      <Typography.Text style={{ color: '#d9d9d9' }}>{aiInsights.rootCause}</Typography.Text>

                      <Typography.Title level={5} style={{ color: '#fff', marginTop: 24 }}>🛠️ Recommended Next Steps</Typography.Title>
                      <ul style={{ color: '#d9d9d9', paddingLeft: 20 }}>
                        {aiInsights.steps.map((step: string, i: number) => <li key={i} style={{ marginBottom: 8 }}>{step}</li>)}
                      </ul>

                      <Typography.Title level={5} style={{ color: '#fff', marginTop: 24 }}>🧪 Suggested Test Case</Typography.Title>
                      <pre style={{ background: '#000', padding: 12, borderRadius: 6, color: '#52c41a', border: '1px solid #333', overflowX: 'auto' }}>
                        <code>{aiInsights.testCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )
            },
            {
              key: '7',
              label: <><GithubOutlined /> Workflow</>,
              children: (
                <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 110px)' }}>
                  <Typography.Title level={5} style={{ color: '#fff', marginTop: 0 }}>Engineering Workflow</Typography.Title>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    Link this bug to your CI/CD pipelines, branches, and pull requests.
                  </Typography.Text>

                  <Card size="small" style={{ background: '#18181f', border: '1px solid #2a2a35' }}>
                    <div style={{ marginBottom: 16 }}>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Linked Branch</Typography.Text>
                      <Typography.Text style={{ color: bug.branchName ? '#1677ff' : '#8b8b9e', fontFamily: 'monospace' }}>
                        {bug.branchName || 'No branch linked'}
                      </Typography.Text>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pull Request</Typography.Text>
                      {bug.pullRequestUrl ? (
                        <a href={bug.pullRequestUrl} target="_blank" rel="noreferrer">{bug.pullRequestUrl}</a>
                      ) : (
                        <Typography.Text style={{ color: '#8b8b9e' }}>No pull request linked</Typography.Text>
                      )}
                    </div>
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Environment</Typography.Text>
                      <Tag color="purple">{bug.environment || 'Production'}</Tag>
                    </div>
                  </Card>
                </div>
              )
            }
          ]}
        />
      )}
    </Drawer>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', background: '#18181f', borderRadius: 8, border: '1px dashed #2a2a35' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f0', marginBottom: 8 }}>{title}</div>
      <div style={{ color: '#8b8b9e' }}>{desc}</div>
    </div>
  );
}
