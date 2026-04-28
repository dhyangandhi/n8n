"use client";

import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NodeSelector } from "@/components/node-selector";

export const AddNoteButton = memo(() => {
    const [selectorOpen, setSeletorOpen] = useState(false);
    return (
        <NodeSelector open={selectorOpen} onOpenChanges={setSeletorOpen}>
            <Button onClick={() => setSeletorOpen(true)} size="icon" variant="outline" className="bg-background">
                <PlusIcon />
            </Button>
        </NodeSelector>
    )
})

AddNoteButton.displayName = "AddNoteButton";