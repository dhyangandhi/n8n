"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

// ✅ Schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            toast.success("Login successful");
            router.refresh();   // 🔥 IMPORTANT
            router.push("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || "Login failed");
          },
        }
      );
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center space-y-1">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">

                {/* Social buttons */}
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" disabled={isPending}>
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full" disabled={isPending}>
                    Continue with GitHub
                  </Button>
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending ? "Logging in..." : "Login"}
                </Button>

                {/* Footer */}
                <div className="text-sm text-muted-foreground text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="underline underline-offset-4 hover:text-primary font-medium"
                  >
                    Sign up
                  </Link>
                </div>

              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}