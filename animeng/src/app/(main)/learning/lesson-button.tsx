"use client";
// Hiển thị những nút bài học trong giao diện
// Client side rendering để tránh lỗi SSR với react-circular-progressbar

import { Check, Crown, Star } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    id: number;
    index: number;
    totalLessons: number;
    isCurrentLesson: boolean;
    isLocked: boolean;
    activeLessonProgress: number;
}

export const LessonButton = ({ id, index, totalLessons, isCurrentLesson, isLocked, activeLessonProgress }: Props) => {
    const cL = 8;
    const cI = index % cL;
    let indent = 0;

    if (cI <= 2) {
        indent = cI;
    }
    else if (cI <= 4) {
        indent = 4 - cI;
    }
    else if (cI <= 6) {
        indent = 4 - cI;
    }
    else {
        indent = cI - 8;
    }

    const rightPos = indent * 40;
    const first = index === 0;
    const last = index === totalLessons - 1;
    const completed = !isCurrentLesson && !isLocked;
    const Icon = completed ? Check : last ? Crown : Star; // Chọn icon dựa trên trạng thái hoàn thành hoặc vị trí cuối cùng
    const href = completed ? `/lesson/${id}` : "/lesson"; // Đường dẫn đến trang lesson tương ứng

    // isLocked = false;
    return (
        <Link href={href} aria-disabled={isLocked} style={{ pointerEvents: isLocked ? 'none' : 'auto' }}>
            <div
                className="relative"
                style={{
                    right: `${rightPos}px`,
                    marginTop: first && completed ? 64 : 20,
                }}>
                {isCurrentLesson ? (
                    <div className="h-[102px] w-[102px] relative">
                        <div className="absolute -top-6 left-2.5 px-3 py-2.5 border-2 font-bold uppercase bg-white rounded-xl animate-bounce tracking-wide z-10">
                            Start
                            <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2" />
                        </div>

                        <CircularProgressbarWithChildren
                            value={Number.isNaN(activeLessonProgress) ? 0 : activeLessonProgress}
                            styles={{
                                path: { stroke: "#4ade80" },
                                trail: { stroke: "#e5e7eb" },
                            }}
                        >
                            <Button size="round" variant={isLocked ? "lockedBtn" : "yellowBtn"}>
                                <Icon className={cn(
                                    "h-14 w-14",
                                    isLocked ? "fill-neutral-400 text-neutral-400 stroke-neutral-400" :
                                        "fill-primary-foreground text-primary-foreground",
                                    completed && "fill-nose stroke-[4]"
                                )} />
                            </Button>
                        </CircularProgressbarWithChildren>

                    </div>
                ) : (
                    <Button size="round" variant={isLocked ? "lockedBtn" : "yellowBtn"}>
                        <Icon className={cn(
                            "h-14 w-14",
                            isLocked ? "fill-neutral-400 text-neutral-400 stroke-neutral-400" :
                                "fill-primary-foreground text-primary-foreground",
                            completed && "fill-nose stroke-[4]"
                        )} />
                    </Button>
                )}

            </div>
        </Link>
    )
}