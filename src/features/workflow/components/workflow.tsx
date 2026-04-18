"use client";

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { formatDistanceToNow } from "date-fns";
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflow"
import { useUpgradeModal } from "@/hooks/use-upgrade-model";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "../hooks/use-entity-search";
import type { Workflow } from "@prisma/client";
import { WorkflowIcon } from "lucide-react";
export const WorkflowSearch = () => {
    const [params, setParams] = useWorkflowsParams();
    const {searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams,
    });
    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search WorkFlows"
        />
    );
};



export const WorkflowsList = () => {
    const workflows = useSuspenseWorkflows();

    return (
        <EntityList
            items={workflows.data.items}
            getKey={(workflow) => workflow.id}
            renderItem={(workflow) => <WorkflowItem data={workflow} />}
            emptyView={<WorkflowsEmpty />}
        />
    )
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => 
{
    const createWorkflow = useCreateWorkflow();
    const { handleError } = useUpgradeModal();
    const router = useRouter();
    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`);
            },
            onError: (error) => {
                handleError(error);
            },
        });
    }

    return (
        <>
            <EntityHeader 
                title="Workflows"
                description="Create and manage your workflows"
                onNew={handleCreate}
                newButtonLabel="New workflow"
                disabled={disabled}
                isCreating={createWorkflow.isPending}
            />
        </>
    );
};

export const WorkflowsPagination = () => {
    const workflow = useSuspenseWorkflows();
    const [params, setParma] = useWorkflowsParams();
    
    return (
        <EntityPagination 
            disabled={workflow.isFetching}
            totalPages={workflow.data.totalPages}
            page={workflow.data.page}
            onPageChange={(page) => setParma({ ...params, page })}
        />
    );
};

export const WorkflowsContainer = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const { modal } = useUpgradeModal();
    return (
        <>
            {modal}
            <EntityContainer
                header={<WorkflowsHeader />}
                search={<WorkflowSearch />}
                pagination={<WorkflowsPagination />}
                children={children}

            />
        </>
    )
};

export const WorkflowLoading = () => {
    return <LoadingView message="Loading workflows..." />
}

export const WorkflowError = () => {
    return <ErrorView message="Error Loading workflow..." />
}
    
export const WorkflowsEmpty = () => {
    const router = useRouter();
    const createWorkflow = useCreateWorkflow();
    const { handleError, modal } = useUpgradeModal();
    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onError: (error) => {
                handleError(error);
            },
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`)
            }
        });
    };

    return (
        <>
            {modal}
            <EmptyView onNew={handleCreate} message="You haven't created any workflow yet. Get started by creating your workflow" />
        </>
    )
}

export const WorkflowItem = ({
    data,
}: { data: Workflow }) => {
    const removeWorkflow = useRemoveWorkflow();

    const handleRemove = () => {
        removeWorkflow.mutate({ id: data.id });
    }
    return (
        <EntityItem 
            href={`/workflow/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
                    &bull; Created{" "}
                {formatDistanceToNow(data.createdAt, {addSuffix: true})}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <WorkflowIcon className="size-5 text-muted-foreground" />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeWorkflow.isPending}
        />
    )
}   