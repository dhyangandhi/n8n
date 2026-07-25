"use client";

import Link from "next/link";

import { 
    EmptyView, 
    EntityContainer, 
    EntityHeader, 
    EntityItem, 
    EntityList, 
    EntityPagination, 
    ErrorView, 
    LoadingView 
} from "@/components/entity-components";
import { formatDistanceToNow } from "date-fns";
import {
  useSuspenseExecution,
  useSuspenseExecutions
} from "../hooks/use-executions";
import { useUpgradeModal } from "@/hooks/use-upgrade-model";
import { useExecutionsParams } from "../hooks/use-exections-params";
import { Execution, ExecutionStatus } from "@prisma/client";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { useState } from "react";
import { 
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export type ExecutionItemData = Execution & {
    workflow: {
        id: string;
        name: string;
    };
};

export const ExecutionsList = () => {
    const executions = useSuspenseExecutions();

    return (
        <EntityList
            items={executions.data.items}
            getKey={(execution) => execution.id}
            renderItem={(execution) => <ExecutionItem data={execution} />}
            emptyView={<ExecutionsEmpty />}
        />
    );
};

export const ExecutionsHeader = () => {
    return (
        <EntityHeader 
            title="Executions"
            description="View your workflow execution history"
        />
    );
};

export const ExecutionsPagination = () => {
    const executions = useSuspenseExecutions();
    const [params, setParams] = useExecutionsParams(); 
    
    return (
        <EntityPagination 
            disabled={executions.isFetching}
            totalPages={executions.data.totalPages}
            page={executions.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    );
};

export const ExecutionsContainer = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const { modal } = useUpgradeModal();
    return (
        <>
            {modal}
            <EntityContainer
                header={<ExecutionsHeader />}
                pagination={<ExecutionsPagination />}
            >
                {children}
            </EntityContainer>
        </>
    );
};

export const ExecutionsLoading = () => {
    return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
    return <ErrorView message="Error Loading executions..." />;
};
    
export const ExecutionsEmpty = () => {
    return (
        <EmptyView
            message="You haven't created any executions yet. Get started by running your workflow" 
        />
    );
};

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className="size-5 text-emerald-600" />;
        case ExecutionStatus.FAILED:
            return <XCircleIcon className="size-5 text-rose-600" />;
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="size-5 text-blue-500 animate-spin" />;
        default: 
            return <ClockIcon className="size-5 text-muted-foreground" />;
    }
};

export const ExecutionItem = ({ 
    data 
}: { data: ExecutionItemData }) => { 
    const duration = data.completedAt
        ? `${Math.round((new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000)}s`
        : null;

    return (
        <EntityItem 
            href={`/executions/${data.id}`}
            title={data.workflow.name}
            subtitle={
                <>
                    Started {formatDistanceToNow(new Date(data.startedAt), { addSuffix: true })}
                    {duration && ` \u2022 Duration: ${duration}`}
                    {` \u2022 Status: ${data.status}`}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center rounded-full bg-muted">
                    {getStatusIcon(data.status)}
                </div>
            }
        />
    );
};

export const ExecutionView = ({
    executionId
}: { executionId: string }) => {
    const { data: execution } = useSuspenseExecution(executionId);
    const [showStackTrace, setShowStackTrace] = useState(false);

    const statusLabel = 
        execution.status.charAt(0).toUpperCase() + execution.status.slice(1).toLowerCase();

    return (
        <Card className="shadow-none">
            <CardHeader>
                <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                        <CardTitle className="text-xl font-semibold">
                            {statusLabel}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Execution for {execution.workflow?.name || "Workflow"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Workflow</p>
                        {execution.workflow ? (
                            <Link 
                                href={`/workflows/${execution.workflow.id}`}
                                className="text-sm font-medium text-rose-700 hover:underline dark:text-rose-400"
                            >
                                {execution.workflow.name}
                            </Link>
                        ) : (
                            <p className="text-sm font-medium">-</p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                        <p className="text-sm font-medium">
                            {statusLabel}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Started</p>
                        <p className="text-sm font-medium">
                            {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Event ID</p>
                        <p className="text-sm font-mono text-muted-foreground">
                            {execution.inngestEventId}
                        </p>
                    </div>
                </div>

                {execution.error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-6 space-y-3 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                        <div>
                            <h4 className="font-semibold text-rose-900 text-sm mb-1 dark:text-rose-200">Error</h4>
                            <p className="font-mono text-sm text-rose-800 dark:text-rose-300">{execution.error}</p>
                        </div>
                        {execution.errorStack && (
                            <Collapsible open={showStackTrace} onOpenChange={setShowStackTrace} className="space-y-3">
                                <CollapsibleTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-auto p-0 text-xs font-medium text-rose-800 hover:bg-transparent hover:text-rose-950 dark:text-rose-300 dark:hover:text-rose-100"
                                    >
                                        {showStackTrace ? "Hide stack trace" : "Show stack trace"}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <pre className="overflow-x-auto rounded-md bg-rose-100/80 p-4 font-mono text-xs text-rose-950 border border-rose-200/60 max-h-96 dark:bg-rose-950/70 dark:text-rose-100 dark:border-rose-900/60">
                                        {execution.errorStack}
                                    </pre>
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </div>
                )}

                {execution.output && (
                    <div>
                        <h4 className="mb-2 font-medium text-sm">Output Data</h4>
                        <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 font-mono text-xs">
                            {JSON.stringify(execution.output, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};