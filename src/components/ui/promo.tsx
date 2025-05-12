"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export const Promo = () => {
    return (
        <div className="border-2 rounded-xl p-4 space-y-4 ">
            <div className="space-y-2">
                <div className="flex items-center gap-x-2">
                    <Image src="/sparkling-heart.svg" alt="Pro" height={26} width={26} />
                    <h3 className="text-lg font-semibold">Update to Pro</h3>
                </div>
                <p className="text-muted-foreground">
                    Upgrade to Pro and get unlimited hearts, access to all courses, and more!
                </p>
            </div>
            <Link href="/shop">
                <Button variant="blueBtn" >
                    UPGRADE TODAY
                </Button>
            </Link>
        </div>
    );
};