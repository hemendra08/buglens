import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, Typography, Space } from 'antd';
import { 
  ApiOutlined, 
  DatabaseOutlined, 
  DesktopOutlined, 
  LockOutlined, 
  CloudServerOutlined, 
  BugOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

// Initial Nodes Data
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 50 },
    data: { 
      label: (
        <Space direction="vertical" align="center" style={{ padding: 10 }}>
          <DesktopOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Text strong style={{ color: '#fff' }}>Web Frontend</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>React / Vite</Text>
        </Space>
      ) 
    },
    style: { background: '#18181f', border: '1px solid #1677ff', borderRadius: 8, color: '#fff', width: 150 },
  },
  {
    id: '2',
    position: { x: 250, y: 200 },
    data: { 
      label: (
        <Space direction="vertical" align="center" style={{ padding: 10 }}>
          <ApiOutlined style={{ fontSize: 24, color: '#722ed1' }} />
          <Text strong style={{ color: '#fff' }}>API Gateway</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>Nginx / Envoy</Text>
        </Space>
      ) 
    },
    style: { background: '#18181f', border: '1px solid #722ed1', borderRadius: 8, color: '#fff', width: 150 },
  },
  {
    id: '3',
    position: { x: 50, y: 350 },
    data: { 
      label: (
        <Space direction="vertical" align="center" style={{ padding: 10 }}>
          <LockOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
          <Text strong style={{ color: '#fff' }}>Auth Service</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>.NET Core</Text>
        </Space>
      ) 
    },
    style: { background: '#18181f', border: '1px solid #fa8c16', borderRadius: 8, color: '#fff', width: 150 },
  },
  {
    id: '4',
    position: { x: 450, y: 350 },
    data: { 
      label: (
        <Space direction="vertical" align="center" style={{ padding: 10 }}>
          <BugOutlined style={{ fontSize: 24, color: '#f5222d' }} />
          <Text strong style={{ color: '#fff' }}>Bug Service</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>.NET Core</Text>
        </Space>
      ) 
    },
    style: { background: '#18181f', border: '1px solid #f5222d', borderRadius: 8, color: '#fff', width: 150 },
  },
  {
    id: '5',
    position: { x: 250, y: 500 },
    data: { 
      label: (
        <Space direction="vertical" align="center" style={{ padding: 10 }}>
          <DatabaseOutlined style={{ fontSize: 24, color: '#52c41a' }} />
          <Text strong style={{ color: '#fff' }}>PostgreSQL</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>Primary DB</Text>
        </Space>
      ) 
    },
    style: { background: '#18181f', border: '1px solid #52c41a', borderRadius: 8, color: '#fff', width: 150 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#1677ff' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#722ed1' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#722ed1' } },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#52c41a' } },
  { id: 'e4-5', source: '4', target: '5', style: { stroke: '#52c41a' } },
];

export default function ArchitectureMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  return (
    <Card 
      title={<><CloudServerOutlined /> System Architecture Map</>} 
      style={{ background: '#111115', border: '1px solid #2a2a35', height: '600px', width: '100%' }}
      styles={{ body: { height: 'calc(100% - 56px)', padding: 0 } }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} nodeColor="#18181f" maskColor="rgba(0,0,0,0.5)" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#2a2a35" />
      </ReactFlow>
    </Card>
  );
}
