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
import { usePracticeModal } from "@/store/use-practice-modal"


export const PracticeModal = () => {
  
    const [isClient, setIsClient] = useState(false);
    const { isOpen, close } = usePracticeModal();
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
                    <Image src = "/heart.svg" alt = "Heart" height = {80} width = {80} />
                    </div>
                    <DialogTitle className = "text-center font-bold text-2xl">
                        This is a practice lesson!
                    </DialogTitle>
                    <DialogDescription className = "text-center text-base text-1.5xl">
                     You can gain points and hearts by completing this lesson, but you won't be able to earn any XP and also lost any hearts!
                    </DialogDescription>
                </DialogHeader>
                <DialogHeader>
                    <DialogFooter className = "mb-4">
                        <div className = "flex flex-col gap-y-4 w-full">
                            <Button variant = "primary" className = "w-full" size = "lg" onClick = {close}>
                                Ok, i understand!
                            </Button>  
                        </div>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}