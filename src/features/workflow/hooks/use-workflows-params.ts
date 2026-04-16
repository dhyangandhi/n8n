import { useQueryStates } from "nuqs";
import { workflowsParmas } from "../params";

export const useWorkflowsParams = () => {
    return useQueryStates(workflowsParmas);
    
}
