"use client";

import {
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";

import { BaseExecutionNode } from "../base-exection-node";
import { HTTPRequestDialog } from "./dialog";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

type HTTPRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo(
  (props: NodeProps<HTTPRequestNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const { setNodes } = useReactFlow();

    const nodeData = props.data;

    const handleOpenSettings = () => {
      setDialogOpen(true);
    };

    const handleSubmit = (values: {
      endpoint: string;
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      body?: string;
    }) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: {
                ...node.data,
                endpoint: values.endpoint,
                method: values.method,
                body: values.body,
              },
            };
          }

          return node;
        })
      );

      setDialogOpen(false);
    };

    const description = nodeData?.endpoint
      ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
      : "Not Configured";

    const nodeStatus = "initial";

    return (
      <>
        <HTTPRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultEndpoint={nodeData.endpoint}
          defaultMethod={nodeData.method}
          defaultBody={nodeData.body}
        />

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon={GlobeIcon}
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

HttpRequestNode.displayName = "HttpRequestNode";