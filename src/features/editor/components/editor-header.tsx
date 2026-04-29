"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SaveIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

import {
  useSuspenseWorkflow,
  useUpdateWorkflowName,
} from "@/features/workflow/hooks/use-workflow";

/**
 * SAVE BUTTON
 */
export const EditorSaveButton = ({
  onSave,
  isSaving = false,
}: {
  onSave: () => void;
  isSaving?: boolean;
}) => {
  return (
    <div className="ml-auto relative z-50 pointer-events-auto">
      <Button
        size="sm"
        className="relative z-50 pointer-events-auto"
        disabled={isSaving}
        onClick={() => {
          console.log("SAVE CLICKED");
          onSave();
        }}
      >
        <SaveIcon className="size-4 mr-2" />
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};

/**
 * EDITOR NAME INPUT
 */
export const EditorNameInput = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflowName();

  const [isEditing, setIsediting] = useState(false);
  const [name, setName] = useState(workflow.name);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(workflow.name);
  }, [workflow.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name === workflow.name) {
      setIsediting(false);
      return;
    }

    try {
      await updateWorkflow.mutateAsync({
        id: workflowId,
        name,
      });
    } catch {
      setName(workflow.name);
    } finally {
      setIsediting(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleSave();
    }

    if (e.key === "Escape") {
      setName(workflow.name);
      setIsediting(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={name}
        disabled={updateWorkflow.isPending}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-[120px] px-2"
      />
    );
  }

  return (
    <BreadcrumbItem
      onClick={() => setIsediting(true)}
      className="cursor-pointer hover:text-foreground transition-colors"
    >
      {workflow.name}
    </BreadcrumbItem>
  );
};

/**
 * BREADCRUMBS
 */
export const EditorBreadcrumbs = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/workflows" prefetch>
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

/**
 * HEADER
 */
export const EditorHeader = ({
  workflowId,
  onSave,
  isSaving = false,
}: {
  workflowId: string;
  onSave: () => void;
  isSaving?: boolean;
}) => {
  return (
    <header className="relative z-50 flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />

      <div className="flex w-full items-center justify-between gap-x-4">
        <EditorBreadcrumbs workflowId={workflowId} />

        <EditorSaveButton
          onSave={onSave}
          isSaving={isSaving}
        />
      </div>
    </header>
  );
};