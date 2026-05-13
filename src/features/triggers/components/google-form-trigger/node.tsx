import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { GoogleFormTriggerDialog } from "./dialog";
export const GoogleFormTrigger = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] =  useState(false);
    const nodeStatus = "initial";
    const handleOpenSettings = () => setDialogOpen(true);   
    return (
        <>
            <GoogleFormTriggerDialog open={dialogOpen} onOpenchange={setDialogOpen} />
            <BaseTriggerNode 
                {...props}
                icon="/logos/icons8-google-forms.svg"
                name="Google Form"
                description="When a Google Form is submitted"
                status={nodeStatus}
                onSetting={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
})