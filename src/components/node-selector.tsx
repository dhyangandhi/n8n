    "use client";

import { createId } from "@paralleldrive/cuid2";
import { Node, useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointerIcon, WebhookIcon, } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { 
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { NodeType } from "@prisma/client";
import { Separator } from "./ui/separator";

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    desciption: string;
    icon: React.ComponentType<{ className?: string }> | string;
}

const triggerNode: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Trigger manually",
        desciption: "Runs the flow on Clicking a button. Good for getting started quickly",
        icon: MousePointerIcon,
    },
    {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        label: "Google Form",
        desciption: "Runs the flow when a Google Form is submitted",
        icon: "/logos/icon8-google-forms.svg",
    }
]

const executionNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        desciption: "Make an HTTP requset",
        icon: GlobeIcon,
    },
    {
        type: NodeType.OLLAMA,
        label: "Ollama",
        desciption: "Make an HTTP requset",
        icon: "/logos/ollama.svg",
    },
];

interface NodeSelectorProps {
    open: boolean;
    onOpenChanges: (open: boolean) => void;
    children: React.ReactNode;
}

export function NodeSelector({
    open,
    onOpenChanges,
    children,
}: NodeSelectorProps) {
    const { setNodes, getNodes, getNode, screenToFlowPosition } = useReactFlow();
    const handleNodeSelect = useCallback((nodeType: NodeTypeOption) => {
        
        if (nodeType.type === NodeType.MANUAL_TRIGGER) {
            const nodes = getNodes();
            const hasManualTrigger = nodes.some((node: Node) => node.type === NodeType.MANUAL_TRIGGER);

            if (hasManualTrigger) {
                toast.error("Onlt one manal trigger is allowed per workdflow");
                return;
            }
        }
            setNodes((nodes) => {
                const hasInitialTrigger = nodes.some(
                    (node) => node.type === NodeType.INITIAL,
                );
                
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;

                const flowPosition = screenToFlowPosition({
                    x: centerX + (Math.random() - 0.5) * 200,
                    y: centerY + (Math.random() - 0.5) * 200,
                });
                
                const newNode = {
                    id: createId(),
                    data: {},
                    position: flowPosition,
                    type: nodeType.type,
                };

                if (hasInitialTrigger) {
                    return [newNode];
                }

                return [...nodes, newNode];
            });
            onOpenChanges(false);
    }, [
        setNodes,
        getNodes,
        onOpenChanges,
        screenToFlowPosition,

    ]);
    return (
        <Sheet open={open} onOpenChange={onOpenChanges}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-auto">
                <SheetHeader>
                    <SheetTitle>
                        What trgging this workflow?
                    </SheetTitle>
                    <SheetDescription>
                        A Triggeer is a step that start your workflow.
                    </SheetDescription>
                </SheetHeader>
                <div>
                    {triggerNode.map((NodeType) => {
                        const Icon = NodeType.icon;

                        return (
                            <div
                                key={NodeType.type}
                                className="w-full flex items-start gap-4 py-5 px-4 cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(NodeType)}
                            >
                            {typeof Icon === "string" ? (
                            <img
                                src={Icon}
                                alt={NodeType.label}
                                className="size-5 object-contain rounded-sm"
                                />
                            ) : (
                                <Icon className="size-5 mt-1" />
                            )}

                                <div className="flex flex-col text-left">
                                    <span className="font-medium text-sm">
                                    {NodeType.label}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                    {NodeType.desciption}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <Separator />
                <div>
                    {executionNodes.map((NodeType) => {
                        const Icon = NodeType.icon;

                        return (
                            <div
                                key={NodeType.type}
                                className="w-full flex items-start gap-4 py-5 px-4 cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(NodeType)}
                            >
                            {typeof Icon === "string" ? (
                            <img
                                src={Icon}
                                alt={NodeType.label}
                                className="size-5 object-contain rounded-sm"
                                />
                            ) : (
                                <Icon className="size-5 mt-1" />
                            )}

                                <div className="flex flex-col text-left">
                                    <span className="font-medium text-sm">
                                    {NodeType.label}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                    {NodeType.desciption}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    )
};