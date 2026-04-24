"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { SettingsIcon, TrashIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./ui/button";

interface WorkflowProps {
  children: ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
}

export function WorkflowNode({
  children,
  showToolbar = true, // default = true (important)
  onDelete,
  onSettings,
  name,
  description,
}: WorkflowProps) {
  return (
    <>
      {/* 🔧 TOP TOOLBAR */}
      {showToolbar && (
        <NodeToolbar position={Position.Top} isVisible>
          <div className="flex gap-1 rounded-md border shadow-sm p-1">
            <Button size="sm" variant="ghost" onClick={onSettings}>
              <SettingsIcon className="h-4 w-4 text-black" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <TrashIcon className="h-4 w-4 text-black" />
            </Button>
          </div>
        </NodeToolbar>
      )}

      {/* 🧩 NODE CONTENT */}
      <div className="rounded-lg border-2 shadow">
        {children}
      </div>

      {/* 🔽 BOTTOM LABEL TOOLBAR */}
      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="max-w-[200px] text-center"
        >
          <div className="rounded-md border bg-white px-2 py-1 shadow-sm">
            <p className="font-medium">{name}</p>

            {description && (
              <p className="text-muted-foreground truncate text-sm">
                {description}
              </p>
            )}
          </div>
        </NodeToolbar>
      )}
    </>
  );
}