"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";

import {
  ReactFlow,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { nodeCompontes } from "@/config/node-components";
import { AddNoteButton } from "./add-node-button";
import { ExecuteWorkflowButton } from "./execute-workflow-button";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Error Loading editor" />;
};

export const Editor = ({
  workflowId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  hasManualTrigger,
}: {
  workflowId: string;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  hasManualTrigger: boolean;
}) => {
  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeCompontes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />

        {/* ONLY Add Button remains here */}
        <Panel position="top-right">
          <AddNoteButton />
        </Panel>

        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

