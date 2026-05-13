import { inngest } from "@/inngest/client";
import { sendworkflowExecution } from "@/inngest/utils";
import { raw } from "@prisma/client/runtime/client";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const workflowId = url.searchParams.get("workflowId");

        if (!workflowId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing workflowId query parameter"
                },
                {
                    status: 500
                }
            );
        };
        const body = await request.json();
        const formData = {
            formId: body.formId,
            FormItitle: body.FormItitle,
            responses: body.responses,
            timestamp: new Date().toISOString(),
            respondentEmail: body.respondentEmail,
            respondentName: body.respondentName,
            raw: body,
        };

        await sendworkflowExecution({
            workflowId,
            initialData: {
                googleForm: formData,
            }
        });
    } catch (error) {
        console.error("Google Form Workflow Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process Google Form workflow." },
            { status: 500 },
        )
    }
}