"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { EditorHeader } from "./editor-header";
import { Editor } from "./editor";
import {
  useSuspenseWorkflow,
  useUpdateWorkflow,
} from "@/features/workflow/hooks/use-workflow";

import {
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";

import { NodeType } from "@prisma/client";
import { createContext } from "react";

export const EditorContext = createContext<{
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
} | null>(null);

export const WorkflowEditor = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();

  // ✅ FIX 1: initialize nodes with status
  const [nodes, setNodes] = useState<Node[]>(
    workflow.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        status: "idle",
      },
    }))
  );

  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  // ✅ FIX 3: listen for realtime updates
    
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((snapshot) => applyNodeChanges(changes, snapshot)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((snapshot) => applyEdgeChanges(changes, snapshot)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((snapshot) => addEdge(params, snapshot)),
    []
  );

  const handleSave = () => {
    updateWorkflow.mutate({
      id: workflowId,
      nodes,
      edges,
    });
  };

  const hasManualTrigger = useMemo(() => {
    return nodes.some(
      (node) => node.type === NodeType.MANUAL_TRIGGER
    );
  }, [nodes]);

  return (
    <EditorContext.Provider value={{ setNodes, setEdges }}>
      <div className="flex flex-col h-full">
        <EditorHeader
          workflowId={workflowId}
          onSave={handleSave}
          isSaving={updateWorkflow.isPending}
        />
        <main className="flex-1">
          <Editor
            workflowId={workflowId}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            hasManualTrigger={hasManualTrigger}
          />
        </main>
      </div>
    </EditorContext.Provider>
  );
};