import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflow/hooks/use-workflow";
import { FlaskConicalIcon } from "lucide-react";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow();
  const handleExecute = () => {
    executeWorkflow.mutate({ id: workflowId });
  };
  return (
    <Button
      size="lg"
      onClick={handleExecute}
      disabled={executeWorkflow.isPending}
    >
      <FlaskConicalIcon className="size-4 mr-2" />

      {executeWorkflow.isPending
        ? "Executing..."
        : "Execute Workflow"}
    </Button>
  );
};