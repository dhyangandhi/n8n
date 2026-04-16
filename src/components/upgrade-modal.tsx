"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";

interface UpgradeModalPage {
    open: boolean;
    onOpenchanges: (open: boolean) => void;
}

export const UpgradeModel = ({ open, onOpenchanges }:
UpgradeModalPage) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenchanges}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Upgrade to pro</AlertDialogTitle>
                        <AlertDialogDescription>
                            You to need an active subscription to perform this action. Upgrade to Proto unlock all features.
                        </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogContent>Cancel</AlertDialogContent>
                    <AlertDialogAction onClick={() => authClient.checkout({ slug: "pro" })}> Upgrade now </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
};