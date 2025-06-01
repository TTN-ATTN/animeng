"use client"

import { toast } from "sonner";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import { useTransition } from "react";
import { refillHearts } from "../../../../actions/user-progress";
import { createMomoUrl } from "../../../../actions/user-subscription";
import { POINTS_TO_REFILL } from "../../../../constants";

type Props = {
    hearts: number;
    points: number;
    hasSubscription: boolean;
}
export const Items = ({hearts, points, hasSubscription}: Props) => {
    const [pending,startTransition] = useTransition();
    const onRefillHearts = () =>{
        if (pending || hearts === 5 || points < POINTS_TO_REFILL)
        {
            return;
        }
        startTransition(() => {
            refillHearts().catch(() => toast.error("Something went wrong!"))
        });
    };
    const onUpgrade = () => {
        startTransition(() => {
            fetch('/api/momo', {
                method: 'POST',
            })
            .then (async (res) => {
                const data = await res.json();
                if (data.payUrl) {
                    window.location.href = data.payUrl;
                }
                else {
                    toast.error("Payment Url not received");
                }
            })
            .catch (() => toast.error("Something went wrong!"));
        })
    }
    return (
        <ul  className = "w-full" >
            <div className = "flex items-center w-full p-4 gap-x-4 border-t-2">
                <Image src = "/heart.svg" alt = "Hearts" height = {60} width = {60}/>
                <div className = "flex-1">
                    <p className = "text-neutral-700 text-base lg:text-xl font-bold">
                        Refill Hearts
                    </p>
                </div>

                <Button onClick = {onRefillHearts} disabled = {pending || hearts === 5 || points < POINTS_TO_REFILL}>
                {/* if we have maximum number of hearts and not enough points (cannot refill) */}
                {hearts === 5 ? "full" : (
                    <div className = "flex items-center">
                        <Image src = "/points.png" alt = "points" height = {30} width = {30}/>  
                    <p>
                        {POINTS_TO_REFILL}
                    </p>
                    </div>
                )}
                </Button>
            </div>
            <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
                <Image src = "/sparkling-heart.svg" alt = "Hearts" height = {60} width = {60}/>
                <div className = "flex-1">
                    <p className="text-neutral-700 text-base lg:text-xl font-bold">Unlimited hearts</p>
                </div>
                <Button 
                    onClick = {onUpgrade}
                    disabled = {pending || hasSubscription} >
                    {hasSubscription ? "Active" : "Upgrade"}
                </Button>
            </div>
        </ul>
    );
};