"use client";

import { useNodesData, type Node, type NodeProps } from "@xyflow/react"
import { GlobeIcon, GoalIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-exection-node";


type HttpRequestNodeData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
    [key: string]: unknown;
};

type HTTpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HTTpRequestNodeType>) => {
    const nodeData = props.data as HttpRequestNodeData;
    const decription = nodeData?.endpoint
        ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
        : "Not Configured";
    return (
        <>
            <BaseExecutionNode 
                {...props}
                id={props.id}
                icon={GlobeIcon}
                name="HTTP Request"
                description={decription}
                onSetting={() => {}}
                onDoubleClick={() => {}}
            />
        
        </>
    )
})

HttpRequestNode.displayName = "HTTPRequestNode";