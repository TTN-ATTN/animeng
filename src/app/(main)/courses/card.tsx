/* 
    Frontend component: hiển thị các khóa học trong trang dưới dạng thẻ
*/

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import Image from "next/image"

type Props = {
    title: string,
    id: number,
    imageSrc: string,
    active?: boolean,
    onClick: (id: number) => void,
    disabled?: boolean
}

// Mapping tên khóa học từ tiếng Anh sang tiếng Việt
const courseNameMapping: Record<string, string> = {
    beginner: "Khóa cơ bản",
    intermediate: "Khóa trung cấp",
    advanced: "Khóa nâng cao",
};

export const Card = ({ title, id, imageSrc, active, onClick, disabled }: Props) => {
    return(
        <div
            onClick={() => onClick(id)}
            className={cn("border h-full rounded-xl border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-3 pb-6 min-h-[217px] min-w-[200px]",
                disabled && "pointer-events-none opacity-50",
            )}
        >
            {/* Đánh dấu coi khóa học nào đang active */}
            <div className="min-[24px] w-full flex items-center justify-end">
                {
                    active && (
                        <div className="rounded-md bg-green-400 flex items-center justify-center p-1">
                            <Check className="text-white stroke-[4] h-4 w-4" />
                        </div> 
                    )
                }
            </div>
            <Image 
                src={imageSrc}
                alt={title}
                width={100}
                height={75}
                className="rounded-lg drop-shadow-md object-cover"
            />
            <p className="text-neutral-700 text-center font-bold text-lg mt-3">
                {courseNameMapping[title] || title}
            </p>
        </div>
    )
}
