"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExitModal } from "@/store/use-exit-modal"


export const ExitModal = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const { isOpen, close } = useExitModal();
    useEffect(() => setIsClient(true), [])
    if (!isClient)
    {
        return null;
    }

    return (
        <Dialog open = {isOpen} onOpenChange = {close} >
            <DialogContent className = "max-W-md">
                <DialogHeader>
                    <div className = "flex items-center w-full justify-center mb-5">
                    <Image src = "/anime_sad.svg" alt = "Mascot" height = {80} width = {80} />
                    </div>
                    <DialogTitle className = "text-center font-bold text-2xl">
                        Hold on, don't go!
                    </DialogTitle>
                    <DialogDescription className = "text-center text-base text-1.5xl">
                       Are you sure you want to leave the lesson?
                    </DialogDescription>
                </DialogHeader>
                <DialogHeader>
                    <DialogFooter className = "mb-4">
                        <div className = "flex flex-col gap-y-4 w-full">
                            <Button variant = "primary" className = "w-full" size = "lg" onClick = {close}>
                                Staying and learning more...
                            </Button>  
                            <Button variant = "dangerOutline" className = "w-full" size = "lg" onClick = {() => {close();router.push("/learning");}}> 
                            {/* redirect to learning route */}
                            YES, I WANNA LEAVE!
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}
