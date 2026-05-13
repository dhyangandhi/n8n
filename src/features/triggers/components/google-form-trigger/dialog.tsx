"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";

interface Props {
    open: boolean;
    onOpenchange: (open: boolean) => void;
};

export const GoogleFormTriggerDialog = ({
    open,
    onOpenchange,
}: Props) => {
    const params = useParams();
    const workflowId = params.workflowId as string;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowid=${workflowId}`;
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard");
        } catch {
            toast.error("Failed to copy Webhook URL");
        }
    }
    return (
        <Dialog open={open} onOpenChange={onOpenchange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Google Form Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Configure settings for the Google Form trigger node.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">
                            Webhook URL
                        </Label>
                        <div className="flex gap-2">
                            <Input id="webhook-url" value={webhookUrl} readOnly className="font-mono text-sm" />
                            <Button type="button" size="icon" onClick={copyToClipboard} variant="outline">
                                <CopyIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="rounded-md bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Setup Instructions:</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Open your Google Form in edit mode.</li>
                            <li>Click on the three dots in the upper right corner and select "Script editor".</li>
                            <li>In the Apps Script editor, replace any existing code with the following:</li>
                        </ol>
                    </div> 
                    <div className="rounded-lg bg-muted p-4 space-y-3">
                        <h4 className="font-medium text-sm">Google App: </h4>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                const script = generateGoogleFormScript(webhookUrl);
                                try {
                                    await navigator.clipboard.writeText(script);
                                    toast.success("Google App Script code copied to clipboard");
                                } catch {
                                    toast.error("Failed to copy Google App Script code");
                                }
                            }}
                        >
                            <CopyIcon className="w-4 h-4 mr-2" />
                            Copy Google App Script Code
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            This code will send form responses to the webhook URL when the form is submitted.
                        </p>
                    </div>
                    <div className="rounded-md bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Availalble Varialbles</h4>
                        <li>
                            <code className="bg-background px-1 py-0.5 rounded">
                                {"{{googel_form_responseEmail}}"}
                            </code>
                            - Respondent's email
                        </li>
                        <li>
                            <code className="bg-background px-1 py-0.5 rounded">
                                {"{{googel_form_responses['Question Name']}}"}
                            </code>
                            - Specific answer
                        </li>
                        <li>
                            <code className="bg-background px-1 py-0.5 rounded">
                                {"{{googel_form_responses}}"}
                            </code>
                            - All responses as JSON
                        </li>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
};