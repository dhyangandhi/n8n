"use client";

import { 
    EmptyView, 
    EntityContainer, 
    EntityHeader, 
    EntityItem, 
    EntityList, 
    EntityPagination, 
    EntitySearch, 
    ErrorView, 
    LoadingView 
} from "@/components/entity-components";
import { formatDistanceToNow } from "date-fns";
import {
  useCreateCredentials,
  useRemoveCredential,
  useSuspenseCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-model";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useState } from "react";
import { CredentialType, Credential } from "@prisma/client";
import Image from "next/image";

// Define a safe credential type that omits sensitive data 
// so it perfectly matches what the API hook returns
export type SafeCredential = Omit<Credential, "value" | "userId">;

export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialsParams();
    const [searchValue, setSearchValue] = useState("");
    
    const onSearchChange = (value: string) => {
        setSearchValue(value);
        setParams({ ...params, search: value, page: 1 });
    };
    
    return (
        <EntitySearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search Credentials"
        />
    );
};

const credentialLogos: Record<CredentialType, string> = {
    [CredentialType.OPENROUTER]: "/logos/openrouter.svg"
};

export const CredentialsList = () => {
    const credentials = useSuspenseCredentials();

    return (
        <EntityList
            items={credentials.data.items}
            getKey={(credential) => credential.id}
            renderItem={(credential) => <CredentialItem data={credential} />}
            emptyView={<CredentialsEmpty />}
        />
    )
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
    return (
        <EntityHeader 
            title="Credentials"
            description="Create and manage your credentials"
            newButtonHref="/credentials/new"
            newButtonLabel="New credential"
            disabled={disabled}
        />
    );
};

export const CredentialsPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams(); 
    
    return (
        <EntityPagination 
            disabled={credentials.isFetching}
            totalPages={credentials.data.totalPages}
            page={credentials.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    );
};

export const CredentialsContainer = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const { modal } = useUpgradeModal();
    return (
        <>
            {modal}
            <EntityContainer
                header={<CredentialsHeader />}
                search={<CredentialsSearch />}
                pagination={<CredentialsPagination />}
                children={children}
            />
        </>
    )
};

export const CredentialsLoading = () => {
    return <LoadingView message="Loading credentials..." />
}

export const CredentialsError = () => {
    return <ErrorView message="Error Loading credentials..." />
}
    
export const CredentialsEmpty = () => {
    const router = useRouter();
    const { modal } = useUpgradeModal();
    
    const handleCreate = () => {
        router.push('/credentials/new');
    };

    return (
        <>
            {modal}
            <EmptyView 
                onNew={handleCreate} 
                message="You haven't created any credentials yet. Get started by creating one." 
            />
        </>
    )
}

// Using the SafeCredential type here!
export const CredentialItem = ({ 
    data 
}: { data: SafeCredential }) => { 
    const removeCredential = useRemoveCredential();

    const handleRemove = () => {
        removeCredential.mutate({ id: data.id });
    }
    const logo = credentialLogos[data.type] || "/logos/openrouter.svg"

    return (
        <EntityItem 
            href={`/credentials/${data.id}`}
            title={data.name}
            subtitle={
                <>
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
                    &bull; Created{" "}
                {formatDistanceToNow(data.createdAt, {addSuffix: true})}
                </>
            }
            image={
                <div className="size-8 flex items-center justify-center">
                    <Image src={logo} alt={data.type} width={20} height={20} />
                </div>
            }
            onRemove={handleRemove}
            isRemoving={removeCredential.isPending}
        />
    )
}