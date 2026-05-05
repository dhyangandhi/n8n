"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

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

  // ✅ FIX 2: create socket INSIDE component
  const socket: Socket = useMemo(
    () => io("http://localhost:3000"),
    []
  );

  // ✅ FIX 3: listen for realtime updates
  useEffect(() => {
    socket.on("workflow:update", (msg: any) => {
      console.log("🔥 FRONTEND RECEIVED:", msg);

      const { nodeId, data } = msg;

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  status: data.status,
                },
              }
            : node
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

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
  );
};