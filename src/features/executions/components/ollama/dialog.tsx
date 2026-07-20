"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@prisma/client";
import Image from "next/image";

export const OLLAMA_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "Polside/laguna-m.1:free",
  "google/gemma-4-26b-a4b-it:free",
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  model: z.enum(OLLAMA_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z
    .string()
    .min(1, "User prompt is required"),
});

export type OLLAMAFormValues = z.infer<
  typeof formSchema
>;

interface Props {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  onSubmit: (
    values: z.infer<typeof formSchema>
  ) => void;

  defaultValues?: Partial<OLLAMAFormValues>;
}

export const OLLAMADialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { 
    data: credentials, isLoading: isLoadingCredentials,
    } = useCredentialsByType(CredentialType.OPENROUTER);

  const form = useForm<
    z.infer<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),

    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      variableName:
        defaultValues.variableName || "",

      model:
        defaultValues.model || "openai/gpt-oss-120b:free",

      systemPrompt:
        defaultValues.systemPrompt || "",

      userPrompt:
        defaultValues.userPrompt || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        variableName:
          defaultValues.variableName || "",

        model:
          defaultValues.model || "openai/gpt-oss-120b:free",

        systemPrompt:
          defaultValues.systemPrompt || "",

        userPrompt:
          defaultValues.userPrompt || "",
      });
    }
  }, [form, open, defaultValues]);

  const watchVariableName =
    form.watch("variableName") ||
    "myApiCall";

  const handleSubmit = (
    values: z.infer<typeof formSchema>
  ) => {
    onSubmit(values);

    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ollama Configure
          </DialogTitle>

          <DialogDescription>
            Configure AI model and prompts
            for this node.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              handleSubmit
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Variable Name
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="myApiCall"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Use this name to reference
                    the result in other nodes:
                    {" "}
                    {
                      `{{${watchVariableName}.text}}`
                    }
                  </FormDescription>                    
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField 
              control={form.control}
              name="credentialId"
              render={({ field }) => (
              <FormItem>
                <FormLabel>OPENROUTER Credential</FormLabel>
                  <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value} 
                      disabled={isLoadingCredentials || !credentials?.length} 
                    >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Cedential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <div className="flex items-center gap-2">
                            <Image src="/logos/openrouter.svg" alt="OpenRouter" width={16} height={16} />
                              {credential.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
                  )}
              />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Model
                  </FormLabel>

                  <Select
                    onValueChange={
                      field.onChange
                    }
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {OLLAMA_MODELS
                        .filter((model) =>
                          model?.trim()
                        )
                        .map((model) => (
                          <SelectItem
                            key={model}
                            value={model}
                          >
                            {model}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <FormDescription>
                    The Ollama model to use
                    for completion
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    System Prompt
                    (optional)
                  </FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant."
                      className="min-h-[80px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Sets the behavior of the
                    assistant. Use
                    {" "}
                    {"{{variables}}"}
                    {" "}
                    for simple values or
                    {" "}
                    {"{{json variable}}"}
                    {" "}
                    to stringify objects.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    User Prompt
                  </FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Summarize this text: {{json httpResponse.data}}"
                      className="min-h-[120px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    The prompt to send to the
                    AI. Use
                    {" "}
                    {"{{variables}}"}
                    {" "}
                    for simple values or
                    {" "}
                    {"{{json variable}}"}
                    {" "}
                    to stringify objects.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};