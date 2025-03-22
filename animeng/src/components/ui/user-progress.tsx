/* 
    Frontend component: sử dụng react hooks để lấy dữ liệu từ server, hiển thị thông tin người dùng
*/

"use client"; // Ensure this is a Client Component

import { Button } from "@/components/ui/button";
import { InfinityIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
    activeCourse: {
        title: string;
        imageSrc: string;
    };
    hearts: number;
    points: number;
    hasSubscription: boolean;
}

export const UserProgress = ({ activeCourse, hearts, points, hasSubscription }: Props) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="flex items-center justify-end space-x-2 w-full lg:pt-[32px]">
            <Link href="/courses">
                <Button variant="default" className="p-2">
                    <Image
                        src={activeCourse.imageSrc}
                        alt={activeCourse.title}
                        width={32}
                        height={32}
                        className="rounded-md"
                        priority
                    />
                </Button>
            </Link>
            <Link href="/shop">
                <Button variant="default" className="p-2 text-orange-400 flex items-center gap-1">
                    <Image src="/points.png" alt="points" height={24} width={24} />
                    <span>{points}</span>
                </Button>
            </Link>
            <Link href="/shop">
                <Button variant="default" className="p-2 text-rose-400 flex items-center gap-1">
                    <Image src="/heart.svg" alt="heart" height={24} width={24} />
                    {hasSubscription && isClient ? <InfinityIcon className="h-4 w-2 stroke-[3]" /> : <span>{hearts}</span>}
                </Button>
            </Link>
        </div>

    );
}
