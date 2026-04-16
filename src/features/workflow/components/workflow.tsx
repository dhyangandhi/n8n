"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflow"
import { useUpgradeModal } from "@/hooks/use-upgrade-model";
import { useRouter } from "next/navigation";
export const WorkflowsList = () => {

    const workflows = useSuspenseWorkflows();

    return (
        <div className="flex flex-1 justify-center items-center"> 
            <p>
                {JSON.stringify(workflows[0].data, null, 2)}
            </p>
        </div>
    );
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
                despcription="Create and manage your workflows"
                onNew={handleCreate}
                newButtonLabel="New workflow"
                disabled={disabled}
                isCreating={createWorkflow.isPending}
            />
        </>
    )
}

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
                search={<></>}
                pagination={<></>}
                childern={children}
            />
        </>
    )
};