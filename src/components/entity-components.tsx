import {  PlugIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ReactNode } from "react";


type EntityHeaderProps = {
    title: string;
    despcription?: string;
    newButtonLabel?: string;
    disabled?: boolean;
    isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHerf?: never }
  | { newButtonHerf: string; onNew?: never }
  | { onNew?: never; newButtonHerf?: never }
);

export const EntityHeader = ({
    title,
    despcription,
    onNew,
    newButtonHerf,
    newButtonLabel,
    disabled,
    isCreating,
}: EntityHeaderProps) => {
    return (
        <div className="flex flex-raw items-center justify-between gap-x-4">
            <div className="flex flex-col">
                <h1 className="text-lg md:text-sl font-semibold">{title}</h1>
                {despcription && (
                    <p className="text-xs md:text text-muted-foreground">
                        {despcription}
                    </p>
                )}
            </div>
            {onNew && !newButtonHerf && (
                <Button disabled={isCreating || disabled} size="sm" onClick={onNew}>
                    <PlugIcon className="size-4" />
                    {newButtonLabel}
                </Button>
            )}
            {newButtonHerf && !onNew && (
                <Button asChild size="sm">
                    <Link href={newButtonHerf} prefetch>
                    <PlugIcon className="size-4" />
                    {newButtonLabel}
                    </Link>
                </Button>
            )}
        </div>
    );
};

type EntityContainerProps = {
    childern: React.ReactNode;
    header?: React.ReactNode;
    search?: React.ReactNode;
    pagination?: React.ReactNode;
}


export const EntityContainer = ({
    childern,
    header,
    search,
    pagination,
}: EntityContainerProps) => {
    return (
        <div className="p-4 md:px-10 md:py-6 h-full ">
            <div className="mx-auto max-w-screen-xl w-full flex flex-col gay-y-8 h-full">
                {header}
            <div className="flex flex-col gap-y-4 h-full ">
                {childern}
                {search}
            </div>
            {pagination}
        </div>
        </div>
    )
}