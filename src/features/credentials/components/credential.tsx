"use client";
import { useEffect } from "react";
import { CredentialType } from "@prisma/client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCreateCredentials, useSuspenseCredential, useUpdateCredential } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-model";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.nativeEnum(CredentialType),
    value: z.string().min(1, "API key is required"),
})

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
    {
        value: CredentialType.OPENROUTER,
        label: "OPENROUTER",
        logo: "/logos/openrouter.svg",
    }
]

interface CredentialFormProps {
    initialData?: {
        id?: string;
        name: string;
        type: CredentialType;
        value?: string; 
    };
};

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
    const router = useRouter();
    const { modal, handleError } = useUpgradeModal();
    
    const createCredentials = useCreateCredentials(); 
    const updateCredential = useUpdateCredential();

    const isEdit = !!initialData?.id;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: CredentialType.OPENROUTER,
            value: "",
        },
    });

useEffect(() => {
  if (initialData) {
    form.reset({
      name: initialData.name,
      type: initialData.type,
      value: initialData.value ?? "",
    });
  }
}, [initialData, form]);

    const onSubmit = async (values: FormValues) => {
        if (isEdit && initialData?.id) {
            await updateCredential.mutateAsync({
                id: initialData.id,
                ...values,
            }, {
                onError: (error) => handleError(error),
                onSuccess: () => router.push("/credentials")
            });
        } else {
            await createCredentials.mutateAsync(values, {
                onError: (error) => handleError(error),
                onSuccess: () => router.push("/credentials")
            });
        }
    }

    const isPending = form.formState.isSubmitting || createCredentials.isPending || updateCredential.isPending;

    return (
        <>
            {modal}
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>
                        {isEdit ? "Edit Credential" : "Create Credential"}
                    </CardTitle>
                    <CardDescription>
                        {isEdit
                            ? "Update your API key or credential details"
                            : "Add a new API key or credential to your account"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            {/* NAME FIELD */}
                            <FormField 
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="My API key" disabled={isPending} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* TYPE FIELD */}
                            <FormField 
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Provider</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value} 
                                            disabled={isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a provider" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentialTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <Image src={option.logo} alt={option.label} width={16} height={16} />
                                                            {option.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* VALUE / API KEY FIELD */}
                            <FormField 
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Key</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="sk-..." 
                                                disabled={isPending} 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ACTIONS: CANCEL & SUBMIT BUTTONS */}
                            <div className="flex justify-end items-center gap-4 pt-4">
                                <Button type="submit" disabled={isPending}>
                                    {isPending 
                                        ? (isEdit ? "Updating..." : "Creating...") 
                                        : (isEdit ? "Update" : "Create")
                                    }
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => router.push("/credentials")}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>                              
                            </div>

                        </form>
                    </Form>
                </CardContent>                  
            </Card>
        </>
    );
}

// ✅ FIXED: Removed the credentialId prop since it's defined inside the component
// ✅ REMOVED: all props and typos. It's completely clean!
export const CredentialView = () => {
    const params = useParams();
    const credentialId = params.credentialId as string;
    const { data: credential } = useSuspenseCredential(credentialId);

    return <CredentialForm initialData={credential} />
}