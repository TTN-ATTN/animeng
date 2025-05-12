"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { quests } from "../../../constants";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

type Props = {
    points: number;
};

export const Quests = ({ points }: Props) => {
    return (
        <div className="border-2 rounded-xl p-4 space-y-4 ">
            <div className = "flex items-center gap-x-2 justify-between w-full space-y-2">
                <h3 className="font-bold text-lg"> 
                    Quests
                </h3>
                <Link href="/quests">
                    <Button size="sm" variant="primaryOutline">
                        View all
                    </Button>
                </Link>
            </div>
            <ul className="w-full space-y-3">
                {quests.map((quest) => {
                    const progress = (points / quest.value) * 100;
                        return (
                            <div key={quest.title} className="flex item-center w-full pb-4 gap-x-2">
                                <Image src = "/points.png" alt = "Points" width = {50} height = {50}/>
                                <div className = "flex flex-col w-full gap-y-2">
                                    <p className="text-neutral-700 text-sm font-bold">
                                        {quest.title}
                                    </p>
                                    <Progress value={progress} className="h-2"/>
                                </div>
                            </div>
                        )    
                })}
            </ul>
        </div>
    );
};