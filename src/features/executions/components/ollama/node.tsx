"use client";

import {
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import { memo, useState, useContext } from "react";
import { EditorContext } from "@/features/editor/components/workflow-editor";

import { BaseExecutionNode } from "../base-exection-node";
import { OLLAMA_MODELS, OLLAMADialog, OLLAMAFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import {fetchOLLAMARealtimeToken } from "./actions";
import { OLLAMA_CHANNEL_Name } from "@/inngest/channels/ollama";


type OLLamaNodeData = {
  variableName?: string;
  model?: any;
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeType = Node<OLLamaNodeData>;

export const OLLAMANode = memo(
  (props: NodeProps<GeminiNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const editorCtx = useContext(EditorContext);
    const setNodes = editorCtx ? editorCtx.setNodes : useReactFlow().setNodes;
    const nodeData = props.data;
    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: OLLAMA_CHANNEL_Name,
      topic: "status",
      refreshToken: fetchOLLAMARealtimeToken,
    });

    const handleOpenSettings = () => {
      setDialogOpen(true);
    };
    const handleSubmit = (values: OLLAMAFormValues) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...values,
              },
            };
          }

          return node;
        })
      );
      setDialogOpen(false);
    };
    const nodData = props.data;
    const description = nodeData?.userPrompt
      ? `${nodeData.model || OLLAMA_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`: "Not configuerd";


    return (
      <>
        <OLLAMADialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon="/logos/openrouter.svg"
          name="HTTP Request"
          status={nodeStatus}
          description={description}
          onSetting={handleOpenSettings}
          onDoubleClick={handleOpenSettings}

        />
      </>
    );
  }
);

OLLAMANode.displayName = "OLLAMANode";