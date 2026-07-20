import { CredentialsError, CredentialsList, CredentialsLoading } from "@/features/credentials/components/credentials";
import { credentialsParmsLoader } from "@/features/credentials/server/params-loader";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CredentialsContainer } from "@/features/credentials/components/credentials";
type Props = {
    searchParams: Promise<SearchParams>;
}
const Page = async({ searchParams }: Props) => {
    await requireAuth();
    const params = await credentialsParmsLoader(searchParams);
    prefetchCredentials(params);

    return (
        <CredentialsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<CredentialsError />}>
                    <Suspense fallback={<CredentialsLoading />}>
                        <CredentialsList />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </CredentialsContainer>
    )
};

export default Page;