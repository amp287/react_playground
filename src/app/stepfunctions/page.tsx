'use client'

import React, { useCallback, useEffect, useState } from 'react';
import
{
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Panel,
  Node,
  Edge
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import convertStepFunctionToReactFlow from './stepfunctionUtils';
import { stepfunction } from './stepfunctionDefinition';
import NodeInfoPanel from './nodeInfoPanel';

// Function takes the nodes in localstorage and creates a map by node id to the x and y position of the node
function restorePositionsMap() {
  const nodes = JSON.parse(window.localStorage.getItem('nodes') || '[]');
  const positions: Map<string, Node> = new Map();
  nodes.forEach((node: Node) => {
    positions.set(node.id, node);
  });
  return positions;
}
 
export default function App() {
  const [graph, setGraph] = useState(convertStepFunctionToReactFlow(stepfunction, restorePositionsMap()));
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onSave = () => {
    window.localStorage.setItem('nodes', JSON.stringify(nodes));
  };

  const onNodeClick = (event: any,node: Node) => {
    setSelectedNode(node);
  }

  useEffect(() => {
    setNodes(nodes.map((node: Node) => {
      if (node.id === selectedNode?.id) {
        return {
          ...node,
          style: {
            ...node.style,
            background: '#eee'
          }
        }
      }
      return node;
    }));
  }, [selectedNode, setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh'}}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
      >
        <Panel position="top-right">
          <button onClick={onSave}>save</button>
        </Panel>
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <NodeInfoPanel node={selectedNode}></NodeInfoPanel>
      </ReactFlow>
    </div>
  );
}