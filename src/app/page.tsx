"use client";

import { useState } from "react"; // ✅ 1. Import useState
import { useQueryClient } from "@tanstack/react-query";
import { LogoutButton } from "./logout";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@base-ui/react";

const Page = () => {
  const trpc = useTRPC();
  const queryclient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  
  // ✅ 2. Create a state variable to hold the user's text
  const [promptText, setPromptText] = useState("");

  const testAi = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => {
      toast.success("AI Job queued");
      setPromptText(""); // Clear the input box after sending
    },
    onError: (error) => {
      // Helpful to see the exact error pop up!
      toast.error(error.message); 
    }
  }));

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      toast.success("Workflow creation initiated");
    }
  }));

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      <div>protected page server</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      
      {/* ✅ 3. Group the input and button together */}
      <div className="flex gap-x-2 items-center">
        <Input 
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Ask Ollama something..."
          className="px-3 py-2 border rounded-md" // Add your base-ui styles here
        />
        <Button 
          // Disable button if loading OR if the box is empty
          disabled={testAi.isPending || !promptText.trim()} 
          onClick={() => testAi.mutate(promptText)} // ✅ 4. Send the actual text!
        >
          {testAi.isPending ? "Sending..." : "Test Ai"}
        </Button>
      </div>

      <Button
        disabled={create.isPending}
        onClick={() => {
          // ⚠️ Heads up: You are also sending an empty string here!
          // Since your backend uses JSON.parse() on this, it will likely crash next.
          // I've added a dummy JSON payload so the button actually works for now:
          const dummyPayload = JSON.stringify({ name: "My New Workflow", steps: [] });
          create.mutate(dummyPayload);
        }}
      >
        Create Workflow
      </Button>
      
      <LogoutButton />
    </div>
  );
};

export default Page;