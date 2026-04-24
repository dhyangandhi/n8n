"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface Props {
    open: boolean;
    onOpenchange: (open: boolean) => void;
};

export const ManualTriggerDialog = ({
    open,
    onOpenchange,
}: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenchange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manual Trigger</DialogTitle>
                    <DialogDescription>
                        Configure settings for the manual trigger node.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">Used ot manual execute a workflow, no configuration available.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
};