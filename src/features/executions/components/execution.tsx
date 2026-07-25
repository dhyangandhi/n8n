"use client";

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
  useSuspenseExecutions
} from "../hooks/use-executions";
import { useUpgradeModal } from "@/hooks/use-upgrade-model";
import { useExecutionsParams } from "../hooks/use-exections-params";
import { Execution, ExecutionStatus } from "@prisma/client";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";

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
            return <CheckCircle2Icon className="size-5 text-green-600" />;
        case ExecutionStatus.FAILED:
            return <XCircleIcon className="size-5 text-red-600" />;
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="size-5 text-bule-500 animate-spin" />;
        default: 
            return <ClockIcon className="size-5 text-muted-foreground" />;
    }
}
export const ExecutionItem = ({ 
    data 
}: { data: ExecutionItemData }) => { 
    const statusIcon = {
        [ExecutionStatus.RUNNING]: <Loader2Icon className="size-4 animate-spin text-blue-500" />,
        [ExecutionStatus.SUCCESS]: <CheckCircle2Icon className="size-4 text-emerald-500" />,
        [ExecutionStatus.FAILED]: <XCircleIcon className="size-4 text-rose-500" />,
    }[data.status];

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