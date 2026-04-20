"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflow/hooks/use-workflow";
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, type Edge, type Node, type NodeChange, type EdgeChange, type Connection, Background, Controls, MiniMap, Panel, } from '@xyflow/react';
import { useState, useCallback } from 'react';
import '@xyflow/react/dist/style.css';
import { nodeCompontes } from "@/config/node-components";
import { AddNoteButton } from "./add-node-button";
export const EditorLoading = () => {
    return <LoadingView message="Loading editor..." />
};

export const EditorError = () => {
    return <ErrorView message="Errro Loading editor" />
};

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

export const Editor = ({ workflowId }: {workflowId: string}) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const [nodes, setNodes] = useState<Node[]>(workflow.nodes );
    const [edges, setEdge] = useState<Edge[]>(workflow.edges);

     
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdge((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) => setEdge((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
 
    return (
        <div className='size-full'>
            <ReactFlow 
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeCompontes}
            >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-right">
                  <AddNoteButton />
                </Panel>
            </ReactFlow>
        </div>
    );
};