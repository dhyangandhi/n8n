import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { CredentialsError, CredentialsLoading } from "@/features/credentials/components/credentials";
import { CredentialView } from "@/features/credentials/components/credential";
import { prefetchCredential } from "@/features/credentials/server/prefetch"; 

type Props = {
    params: Promise<{ credentialId: string }>;
}

const Page = async ({ params }: Props) => {
    await requireAuth();
    
    const resolvedParams = await params;
    const credentialId = resolvedParams.credentialId;

    await prefetchCredential(credentialId);

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<CredentialsError />}>
                <Suspense fallback={<CredentialsLoading />}>
                    {/* ✅ Just the component by itself! */}
                    <CredentialView />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
};

export default Page;